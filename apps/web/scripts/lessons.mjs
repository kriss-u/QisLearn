import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const LESSONS_DIR = fileURLToPath(new URL("../src/content/lessons", import.meta.url));
const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---/;

/** Reads every lesson's frontmatter directly off disk, without going through Vite. */
export function readLessons() {
  const files = readdirSync(LESSONS_DIR).filter((f) => f.endsWith(".mdx"));
  const lessons = files.map((file) => {
    const source = readFileSync(path.join(LESSONS_DIR, file), "utf-8");
    const match = FRONTMATTER_PATTERN.exec(source);
    if (!match) throw new Error(`${file}: missing YAML frontmatter block (--- ... ---)`);
    return parseYaml(match[1]);
  });
  return lessons.sort((a, b) => a.order - b.order);
}
