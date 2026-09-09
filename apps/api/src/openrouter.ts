import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModelV4 } from "@ai-sdk/provider";
import { env } from "./env.js";

let openrouter: ReturnType<typeof createOpenRouter> | undefined;

// Shared by both the GraphQL ask-mutations (lesson-qa.ts) and the streaming
// chat endpoint (lesson-chat.ts) so there's one place that knows about the
// OPENROUTER_API_KEY/OPENROUTER_MODEL env vars and lazily creates the client.
export function getOpenrouterModel(): LanguageModelV4 {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY isn't configured.");
  }
  openrouter ??= createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });
  return openrouter(env.OPENROUTER_MODEL);
}
