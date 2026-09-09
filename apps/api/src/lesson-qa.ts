import { generateText, Output } from "ai";
import { GraphQLError } from "graphql";
import { z } from "zod";
import { getOpenrouterModel } from "./openrouter.js";

function requireModel() {
  try {
    return getOpenrouterModel();
  } catch {
    throw new GraphQLError("Ask-a-question isn't configured (missing OPENROUTER_API_KEY).", {
      extensions: { code: "NOT_CONFIGURED" },
    });
  }
}

const SuggestedQuestionsSchema = z.object({
  questions: z.array(z.string()).min(3).max(4),
});

// Fully dynamic, like the example-prompt chips on an LLM chat box — nothing
// persisted, regenerated fresh on every call. Grounded in this lesson's own
// content so the suggestions are actually answerable from it. Actually
// answering a question happens in the streaming chat (see lesson-chat.ts),
// not here — this only produces the starter-suggestion chips shown before
// the chat has any messages.
export async function suggestLessonQuestions(lessonContent: string): Promise<string[]> {
  const { output } = await generateText({
    model: requireModel(),
    output: Output.object({ schema: SuggestedQuestionsSchema }),
    system:
      "You suggest short example questions a student could ask about one lesson in an interactive " +
      "quantum computing course, the way a chat assistant shows sample prompts. You are given the " +
      "lesson's full text. Propose 3-4 concise, specific questions that are actually answerable from " +
      "that text alone — no generic or off-topic questions.",
    prompt: lessonContent,
  });
  return output.questions;
}
