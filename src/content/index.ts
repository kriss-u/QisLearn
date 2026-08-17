import type { ComponentType } from "react";
import { parse as parseYaml } from "yaml";
import { type LessonFrontmatter, LessonFrontmatterSchema } from "./schema";

interface MdxModule {
  default: ComponentType<{ components?: Record<string, unknown> }>;
}

// Eager but raw-text: reading just the source string (not the compiled
// component) keeps each lesson's heavy body/component code out of the
// bundle that builds the lesson list/sidebar, so `loadLessonContent` below
// can still code-split it per lesson. See vite.config.ts for why frontmatter
// isn't read via the MDX compiler's own export instead.
const rawModules = import.meta.glob("./lessons/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const componentLoaders = import.meta.glob("./lessons/*.mdx") as Record<
  string,
  () => Promise<MdxModule>
>;

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---/;

const PROSE_WPM = 200;
// Code (fenced blocks, JSX props, inline code) reads slower word-for-word
// than prose, but it's still time a learner spends on the page — earlier
// versions dropped it entirely, which under-counted code-heavy lessons.
const CODE_WPM = 50;

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Reading time is derived from the lesson's own body rather than a hand-typed
 * frontmatter number, which tended to drift from the actual content length.
 * Code fences, JSX tags/props, and inline code are counted separately from
 * prose at a slower words-per-minute rate rather than being excluded.
 */
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

function parseFrontmatter(path: string, source: string): LessonFrontmatter {
  const match = FRONTMATTER_PATTERN.exec(source);
  if (!match) {
    throw new Error(`${path}: missing YAML frontmatter block (--- ... ---)`);
  }
  const frontmatter = LessonFrontmatterSchema.parse(parseYaml(match[1]));
  const body = source.slice(match[0].length);
  return { ...frontmatter, estimatedMinutes: estimateReadingMinutes(body) };
}

interface LessonEntry {
  path: string;
  frontmatter: LessonFrontmatter;
}

function loadLessonEntries(): LessonEntry[] {
  const entries = Object.entries(rawModules).map(([path, source]) => ({
    path,
    frontmatter: parseFrontmatter(path, source),
  }));
  return entries.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

const lessonEntries = loadLessonEntries();

export const lessons: LessonFrontmatter[] = lessonEntries.map((entry) =>
  entry.frontmatter
);

export const lessonsByTrack = lessons.reduce<
  Record<string, LessonFrontmatter[]>
>((acc, lesson) => {
  (acc[lesson.track] ??= []).push(lesson);
  return acc;
}, {});

export function getLesson(id: string): LessonFrontmatter | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getNextLesson(id: string): LessonFrontmatter | undefined {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  return index >= 0 ? lessons[index + 1] : undefined;
}

/** Lazily imports the compiled MDX component for a lesson's body content. */
export function loadLessonContent(id: string): Promise<MdxModule> {
  const entry = lessonEntries.find((e) => e.frontmatter.id === id);
  if (!entry) throw new Error(`Unknown lesson: ${id}`);
  return componentLoaders[entry.path]();
}

export type {
  Circuit,
  Gate,
  LessonFrontmatter,
  LessonLayout,
  QuizChoice,
  VisualizationView,
} from "./schema";
