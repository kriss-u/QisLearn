import { GraphQLError } from "graphql";
import { db } from "./db.js";

type MarkdownBlock = { type: string; data: unknown };

function blocksToMarkdown(blocks: MarkdownBlock[]): string {
  return blocks
    .filter((b) => b.type === "markdown")
    .map((b) => (b.data as { text: string }).text)
    .join("\n\n");
}

export async function getLessonMarkdownContent(lessonSlug: string): Promise<string> {
  const found = await db.query.lesson.findFirst({
    where: (l, { eq: eqOp }) => eqOp(l.slug, lessonSlug),
    with: { contentBlocks: { orderBy: (cb, { asc }) => asc(cb.order) } },
  });
  if (!found) throw new GraphQLError("Lesson not found.");
  return blocksToMarkdown(found.contentBlocks);
}

export interface CourseSearchResult {
  lessonSlug: string;
  lessonTitle: string;
  excerpt: string;
}

// Plain keyword search across every lesson's markdown, not a vector store —
// at this course's size (~20 lessons, well under any modern model's context
// window) a real embeddings/RAG pipeline would be solving a scale problem
// that doesn't exist yet. Exposed to the chat model as a tool call (see
// lesson-chat.ts) so it can pull in another lesson's content only when the
// current lesson's own text doesn't cover the question.
export async function searchCourseLessons(query: string): Promise<CourseSearchResult[]> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (terms.length === 0) return [];

  const lessons = await db.query.lesson.findMany({
    with: { contentBlocks: { orderBy: (cb, { asc }) => asc(cb.order) } },
  });

  const results: CourseSearchResult[] = [];
  for (const l of lessons) {
    const text = blocksToMarkdown(l.contentBlocks);
    const lower = text.toLowerCase();
    const matchIndex = terms.map((t) => lower.indexOf(t)).find((i) => i >= 0);
    if (matchIndex === undefined) continue;
    const start = Math.max(0, matchIndex - 200);
    results.push({ lessonSlug: l.slug, lessonTitle: l.title, excerpt: text.slice(start, start + 600) });
  }
  return results.slice(0, 5);
}
