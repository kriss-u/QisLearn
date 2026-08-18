import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readLessons } from "./lessons.mjs";

const SITE_URL = "https://qislearn.nepcodex.com";
const DIST_DIR = fileURLToPath(new URL("../dist", import.meta.url));

function urlEntry(path, changefreq, priority) {
  return `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function generateSitemap() {
  const lessons = readLessons();
  const entries = [
    urlEntry("/", "weekly", "1.0"),
    ...lessons.map((lesson) => urlEntry(`/lesson/${lesson.id}`, "monthly", "0.8")),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

  writeFileSync(`${DIST_DIR}/sitemap.xml`, xml);
  console.log(`Generated sitemap.xml with ${entries.length} URLs`);
}

generateSitemap();
