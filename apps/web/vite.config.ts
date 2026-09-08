import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  // plotly.js references the Node-style `global` object at module scope; needed for the
  // standalone `import("plotly.js")` in pngExport.ts (react-plotly.js's own bundling already
  // works around this, but a bare dynamic import of the package does not).
  define: { global: "globalThis" },
  ssr: {
    // @apollo/client has no package.json "exports" map, so Vite's default
    // SSR externalization leaves a bare `import {...} from "@apollo/client"`
    // for Node to resolve at runtime — Node then falls back to its ".cjs"
    // main entry, and cjs-module-lexer can't statically detect its named
    // exports, breaking the import. Force it to be bundled instead, so Vite
    // (which correctly resolves the ESM "module" entry) inlines real named
    // exports into the server build.
    noExternal: ["@apollo/client"],
  },
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
