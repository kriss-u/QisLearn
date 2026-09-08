import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import { createDb } from "../src/index.js";
import { contentBlock, lesson, lessonPrerequisite, track } from "../src/content-schema.js";

// Mirrors apps/web/src/content/index.ts's reading-time estimate exactly, so
// migrated lessons keep the same estimatedMinutes learners see today.
const PROSE_WPM = 200;
const CODE_WPM = 50;

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function estimateReadingMinutes(bodySource: string): number {
  const codeSegments: string[] = [];
  const withoutCode = bodySource
    .replace(/```[\s\S]*?```/g, (match) => {
      codeSegments.push(match);
      return " ";
    })
    .replace(/<[^>]*>/g, (match) => {
      codeSegments.push(match);
      return " ";
    })
    .replace(/`[^`]*`/g, (match) => {
      codeSegments.push(match);
      return " ";
    });

  const proseWords = countWords(withoutCode.replace(/[#*_>[\]()~-]/g, " "));
  const codeWords = countWords(codeSegments.join(" "));

  const minutes = proseWords / PROSE_WPM + codeWords / CODE_WPM;
  return Math.max(1, Math.round(minutes));
}

interface LessonFrontmatter {
  id: string;
  track: string;
  order: number;
  title: string;
  summary: string;
  layout: string;
  prerequisites: string[];
}

function parseFrontmatter(filePath: string, raw: unknown): LessonFrontmatter {
  const value = raw as Record<string, unknown>;
  if (typeof value?.id !== "string" || typeof value.track !== "string" || typeof value.order !== "number") {
    throw new Error(`${filePath}: missing/invalid required frontmatter fields (id, track, order)`);
  }
  return {
    id: value.id,
    track: value.track,
    order: value.order,
    title: String(value.title ?? ""),
    summary: String(value.summary ?? ""),
    layout: typeof value.layout === "string" ? value.layout : "standard",
    prerequisites: Array.isArray(value.prerequisites) ? value.prerequisites.map(String) : [],
  };
}

function evalExpression(source: string): unknown {
  return new Function(`"use strict"; return (${source});`)();
}

interface MdastPosition {
  start: { offset: number };
  end: { offset: number };
}

interface MdastNode {
  type: string;
  position?: MdastPosition;
  name?: string;
  attributes?: Array<{
    type: string;
    name: string;
    value: string | null | { type: string; value: string };
  }>;
}

interface ParsedContentBlock {
  type: string;
  data: Record<string, unknown>;
}

function parseBody(source: string): ParsedContentBlock[] {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkMdx);
  const tree = processor.parse(source) as unknown as { children: MdastNode[] };

  const blocks: ParsedContentBlock[] = [];
  let groupStart: number | null = null;
  let groupEnd: number | null = null;

  function flushMarkdown() {
    if (groupStart === null || groupEnd === null) return;
    const text = source.slice(groupStart, groupEnd).trim();
    if (text) blocks.push({ type: "markdown", data: { text } });
    groupStart = null;
    groupEnd = null;
  }

  for (const node of tree.children) {
    if (node.type === "yaml") continue;

    if (node.type === "mdxJsxFlowElement") {
      flushMarkdown();
      if (!node.name) {
        throw new Error("Encountered an anonymous top-level MDX JSX element");
      }
      const blockType = node.name;
      const data: Record<string, unknown> = {};
      for (const attr of node.attributes ?? []) {
        if (attr.type !== "mdxJsxAttribute") continue;
        if (attr.value === null) {
          data[attr.name] = true;
        } else if (typeof attr.value === "string") {
          data[attr.name] = attr.value;
        } else {
          data[attr.name] = evalExpression(attr.value.value);
        }
      }
      blocks.push({ type: blockType, data });
      continue;
    }

    if (!node.position) continue;
    if (groupStart === null) groupStart = node.position.start.offset;
    groupEnd = node.position.end.offset;
  }
  flushMarkdown();

  return blocks;
}

function titleCase(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const lessonsDir = path.resolve(import.meta.dirname, "../../../apps/web/src/content/lessons");
  const files = readdirSync(lessonsDir).filter((f) => f.endsWith(".mdx"));

  const parsed = files.map((file) => {
    const filePath = path.join(lessonsDir, file);
    const source = readFileSync(filePath, "utf-8");
    const tree = unified().use(remarkParse).use(remarkFrontmatter).parse(source) as unknown as {
      children: MdastNode[];
    };
    const yamlNode = tree.children.find((n) => n.type === "yaml") as (MdastNode & { value?: string }) | undefined;
    if (!yamlNode?.value) {
      throw new Error(`${file}: missing YAML frontmatter block`);
    }
    const frontmatter = parseFrontmatter(file, parseYaml(yamlNode.value));
    const estimatedMinutes = estimateReadingMinutes(source);
    const blocks = parseBody(source);
    return { file, frontmatter, estimatedMinutes, blocks };
  });

  parsed.sort((a, b) => a.frontmatter.order - b.frontmatter.order);

  const trackSlugs = [...new Set(parsed.map((p) => p.frontmatter.track))].sort(
    (a, b) =>
      Math.min(...parsed.filter((p) => p.frontmatter.track === a).map((p) => p.frontmatter.order)) -
      Math.min(...parsed.filter((p) => p.frontmatter.track === b).map((p) => p.frontmatter.order)),
  );

  const db = createDb(databaseUrl);

  await db.transaction(async (tx) => {
    await tx.delete(contentBlock);
    await tx.delete(lessonPrerequisite);
    await tx.delete(lesson);
    await tx.delete(track);

    const trackIdBySlug = new Map<string, string>();
    for (const [index, slug] of trackSlugs.entries()) {
      const [row] = await tx.insert(track).values({ slug, title: titleCase(slug), order: index + 1 }).returning({
        id: track.id,
      });
      if (!row) throw new Error(`Failed to insert track ${slug}`);
      trackIdBySlug.set(slug, row.id);
    }

    const lessonIdBySlug = new Map<string, string>();
    for (const p of parsed) {
      const trackId = trackIdBySlug.get(p.frontmatter.track);
      if (!trackId) throw new Error(`${p.file}: unknown track ${p.frontmatter.track}`);
      const [row] = await tx
        .insert(lesson)
        .values({
          slug: p.frontmatter.id,
          trackId,
          order: p.frontmatter.order,
          title: p.frontmatter.title,
          summary: p.frontmatter.summary,
          layout: p.frontmatter.layout,
          estimatedMinutes: p.estimatedMinutes,
        })
        .returning({ id: lesson.id });
      if (!row) throw new Error(`Failed to insert lesson ${p.frontmatter.id}`);
      lessonIdBySlug.set(p.frontmatter.id, row.id);
    }

    for (const p of parsed) {
      const lessonId = lessonIdBySlug.get(p.frontmatter.id);
      if (!lessonId) continue;
      for (const prereqSlug of p.frontmatter.prerequisites) {
        const prerequisiteLessonId = lessonIdBySlug.get(prereqSlug);
        if (!prerequisiteLessonId) {
          throw new Error(`${p.file}: unknown prerequisite ${prereqSlug}`);
        }
        await tx.insert(lessonPrerequisite).values({ lessonId, prerequisiteLessonId });
      }
    }

    for (const p of parsed) {
      const lessonId = lessonIdBySlug.get(p.frontmatter.id);
      if (!lessonId) continue;
      for (const [index, block] of p.blocks.entries()) {
        await tx.insert(contentBlock).values({
          lessonId,
          order: index,
          type: block.type,
          data: block.data,
        });
      }
    }
  });

  console.log(`Migrated ${parsed.length} lessons across ${trackSlugs.length} tracks:`);
  for (const p of parsed) {
    const counts = p.blocks.reduce<Record<string, number>>((acc, b) => {
      acc[b.type] = (acc[b.type] ?? 0) + 1;
      return acc;
    }, {});
    console.log(`  ${p.frontmatter.id}: ${p.blocks.length} blocks (${JSON.stringify(counts)})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
