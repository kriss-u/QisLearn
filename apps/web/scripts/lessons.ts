import { getAllLessons } from "../src/content/index.js";

/** Used by generate-sitemap.ts to enumerate every lesson URL at build time. */
export async function readLessons() {
  return getAllLessons();
}
