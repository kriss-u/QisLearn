import { generateText } from "ai";
import { GraphQLError } from "graphql";
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

const QUESTION_SEPARATOR = "\n===\n";

// Fully dynamic, like the example-prompt chips on an LLM chat box — nothing
// persisted, regenerated fresh on every call. Grounded in this lesson's own
// content so the suggestions are actually answerable from it. Actually
// answering a question happens in the streaming chat (see lesson-chat.ts),
// not here — this only produces the starter-suggestion chips shown before
// the chat has any messages.
//
// Deliberately plain text, not a JSON/tool-call schema (`Output.object`):
// asking a model to hand-author its own JSON string escaping for
// LaTeX-heavy content is a known footgun — models routinely emit a single
// backslash instead of the doubled one JSON requires (e.g. `\rangle`
// instead of `\\rangle`), and JSON.parse then silently reinterprets that as
// the *control-character* escape `\r` (or `\b`/`\f`/`\n`/`\t` for other
// LaTeX commands starting with those letters — \beta, \bra, \forall,
// \frac, \nabla, \neq, \rangle, \rho, \tan, \theta, \times, ...), eating
// the backslash and leaving broken math like a bare "angle" behind. Plain
// text has no such escaping layer, so we ask for a fixed separator between
// questions and split on it ourselves instead.
export async function suggestLessonQuestions(lessonContent: string): Promise<string[]> {
  const { text } = await generateText({
    model: requireModel(),
    system:
      "You suggest short example questions a student could ask about one lesson in an interactive " +
      "quantum computing course, the way a chat assistant shows sample prompts. You are given the " +
      "lesson's full text. Propose 3-4 concise, specific questions that are actually answerable from " +
      "that text alone — no generic or off-topic questions.\n\n" +
      "Formatting: write any math using LaTeX, delimited with single dollar signs for inline math " +
      "(e.g. $|\\alpha|^2$, $|0\\rangle$) or double dollar signs for standalone equations " +
      "(e.g. $$|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$$) — never \\( \\) or \\[ \\] " +
      "delimiters, and never bare LaTeX commands outside of $ delimiters. This matches how the rest " +
      "of the course renders math, and questions rendered without this exact delimiter style will " +
      `show up broken.\n\nOutput format: reply with ONLY the questions, nothing else — no numbering, ` +
      `no bullets, no preamble. Separate each question with a line containing exactly "===" and ` +
      "nothing else, and put nothing before the first question or after the last one.",
    prompt: lessonContent,
  });
  return text
    .split(QUESTION_SEPARATOR)
    .map((q) => q.trim())
    .filter((q) => q.length > 0);
}
