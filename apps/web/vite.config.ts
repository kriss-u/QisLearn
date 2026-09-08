import { reactRouter } from "@react-router/dev/vite";
import mdx from "@mdx-js/rollup";
import rehypeKatex from "rehype-katex";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { defineConfig } from "vite";

function mdxPlugin() {
  const plugin = mdx({
    remarkPlugins: [remarkFrontmatter, remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex],
  });
  const compile = plugin.transform as (code: string, id: string) => unknown;
  return {
    ...plugin,
    enforce: "pre" as const,
    // @mdx-js/rollup strips query strings before checking the .mdx extension,
    // so it would otherwise also try to compile `foo.mdx?raw` (used in
    // src/content/index.ts to read frontmatter as plain text) into JSX.
    transform(code: string, id: string) {
      if (id.includes("?")) return null;
      return compile.call(this, code, id);
    },
  };
}

export default defineConfig({
  plugins: [mdxPlugin(), reactRouter()],
  // plotly.js references the Node-style `global` object at module scope; needed for the
  // standalone `import("plotly.js")` in pngExport.ts (react-plotly.js's own bundling already
  // works around this, but a bare dynamic import of the package does not).
  define: { global: "globalThis" },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (/[\\/](three|@react-three)[\\/]/.test(id)) return "vendor-three";
            if (/[\\/](plotly\.js|react-plotly\.js)[\\/]/.test(id)) return "vendor-plotly";
            if (/[\\/](@uiw[\\/]react-codemirror|codemirror|@codemirror)[\\/]/.test(id)) return "vendor-codemirror";
            if (/[\\/](@chakra-ui|@emotion|@ark-ui)[\\/]/.test(id)) return "vendor-chakra";
            if (/[\\/](katex|rehype-katex|remark-math)[\\/]/.test(id)) return "vendor-katex";
          }
        },
      },
    },
  },
});
