import type { Config } from "@react-router/dev/config";
import { readLessons } from "./scripts/lessons.mjs";

export default {
  ssr: false,
  appDirectory: "src/app",
  // Prerenders every route (home + each lesson) to static HTML at build time,
  // so search engines and social crawlers get real per-page <title>/meta/JSON-LD
  // without executing JS, even though this stays a client-only SPA at runtime.
  async prerender({ getStaticPaths }) {
    const lessonPaths = readLessons().map((lesson) => `/lesson/${lesson.id}`);
    return [...getStaticPaths(), ...lessonPaths];
  },
} satisfies Config;
