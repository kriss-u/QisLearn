import "katex/dist/katex.min.css";
import { Skeleton } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { ClientOnly } from "../../../../components/ClientOnly";
import { useColorMode } from "../../../../components/ui/color-mode";

// @uiw/react-md-editor self-imports a .css file at its module root, which
// Node's SSR loader can't handle — load it lazily, client-only only, same
// pattern as PyEditor/CodeExercise's ClientOnly+lazy combo.
const MDEditor = lazy(async () => {
  await import("@uiw/react-md-editor/markdown-editor.css");
  const mod = await import("@uiw/react-md-editor");
  return { default: mod.default };
});

export function MarkdownFieldEditor({
  value,
  onChange,
  height = 220,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Shorter for one-liner fields (quiz choices), taller for full block bodies. */
  height?: number;
}) {
  const { colorMode } = useColorMode();

  return (
    <ClientOnly fallback={<Skeleton h={`${height}px`} rounded="l2" />}>
      {() => (
        <Suspense fallback={<Skeleton h={`${height}px`} rounded="l2" />}>
          <div className="qislearn-md-editor" data-color-mode={colorMode}>
            {/* The source pane should read as code; the preview pane keeps the
                site's normal prose font so it matches how learners see it. */}
            <style>{`
              .qislearn-md-editor .w-md-editor-text-input,
              .qislearn-md-editor .w-md-editor-text-pre > code {
                font-family: 'Fira Code', ui-monospace, monospace !important;
              }
            `}</style>
            <MDEditor
              value={value}
              onChange={(next: string | undefined) => onChange(next ?? "")}
              height={height}
              previewOptions={{
                remarkPlugins: [remarkGfm, remarkMath],
                rehypePlugins: [rehypeKatex],
              }}
            />
          </div>
        </Suspense>
      )}
    </ClientOnly>
  );
}
