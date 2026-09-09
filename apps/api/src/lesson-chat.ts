import type { IncomingMessage, ServerResponse } from "node:http";
import { convertToModelMessages, pipeUIMessageStreamToResponse, streamText, tool, toUIMessageStream, type UIMessage } from "ai";
import { z } from "zod";
import { auth } from "./auth.js";
import { getLessonMarkdownContent, searchCourseLessons } from "./lesson-content.js";
import { getOpenrouterModel } from "./openrouter.js";

function toWebHeaders(nodeHeaders: IncomingMessage["headers"]): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }
  return headers;
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}

function sendJsonError(res: ServerResponse, status: number, error: string) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify({ error }));
}

// The relevance guard lives in this system prompt rather than a separate
// classification call before it — one streamed generateText round trip
// either answers (grounded in course content) or declines with alternate
// on-topic suggestions, instead of doubling latency/cost with a pre-check
// that would also delay the first streamed token.
function systemPrompt(lessonContent: string): string {
  return (
    "You are a course assistant embedded in one lesson of an interactive quantum computing course. " +
    "You are given that lesson's full text below. Answer the student's questions using ONLY " +
    "information from this course: the current lesson's text, or another lesson's content fetched " +
    "via the searchCourseContent tool if the question needs material from elsewhere in the course " +
    "(e.g. a prerequisite concept). Never use outside/general knowledge beyond what the course itself " +
    "states.\n\n" +
    "If a question is unrelated to this course, or too vague/random to connect to any course content " +
    "even after considering the current lesson and searching the course, politely decline — say " +
    "plainly that you can only help with this course's material — and suggest 2-3 specific on-topic " +
    "questions the student could ask instead, based on the current lesson.\n\n" +
    `Current lesson content:\n\n${lessonContent}`
  );
}

export async function handleLessonChat(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const session = await auth.api.getSession({ headers: toWebHeaders(req.headers) });
  if (!session) return sendJsonError(res, 401, "Unauthorized");

  let body: { lessonSlug?: string; messages?: UIMessage[] };
  try {
    body = (await readJsonBody(req)) as typeof body;
  } catch {
    return sendJsonError(res, 400, "Invalid JSON body");
  }

  const { lessonSlug, messages } = body;
  if (!lessonSlug || !Array.isArray(messages)) {
    return sendJsonError(res, 400, "lessonSlug and messages are required");
  }

  let model: ReturnType<typeof getOpenrouterModel>;
  try {
    model = getOpenrouterModel();
  } catch (err) {
    return sendJsonError(res, 503, err instanceof Error ? err.message : "Not configured");
  }

  let lessonContent: string;
  try {
    lessonContent = await getLessonMarkdownContent(lessonSlug);
  } catch {
    return sendJsonError(res, 404, "Lesson not found");
  }

  const result = streamText({
    model,
    system: systemPrompt(lessonContent),
    messages: await convertToModelMessages(messages),
    tools: {
      searchCourseContent: tool({
        description:
          "Search other lessons in this course for content related to a query. Use this only when " +
          "the current lesson's own text doesn't cover what's needed to answer.",
        inputSchema: z.object({ query: z.string() }),
        execute: ({ query }) => searchCourseLessons(query),
      }),
    },
  });

  await pipeUIMessageStreamToResponse({ response: res, stream: toUIMessageStream({ stream: result.stream }) });
}
