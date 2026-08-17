import katex from "katex";
import "katex/dist/katex.min.css";
import { createContext, useContext, useMemo, useState, type HTMLAttributes, type ReactNode } from "react";
import { IconButton } from "@chakra-ui/react";
import { LuSigma } from "react-icons/lu";
import { useSettingsStore } from "../../store/settingsStore";
import { Tooltip } from "../ui/tooltip";

export function renderKatex(tex: string): string {
  return katex.renderToString(tex, { throwOnError: false, output: "html", displayMode: false });
}

/**
 * `tex` is always built from our own strings (gate names, qubit indices, ket labels), never
 * raw lesson/user-authored text — dangerouslySetInnerHTML is safe here. Author-supplied MDX
 * math should keep going through the existing rehype-katex Markdown pipeline instead.
 */
export function KatexSpan({ tex, ...rest }: { tex: string } & HTMLAttributes<HTMLSpanElement>) {
  const html = useMemo(() => renderKatex(tex), [tex]);
  return <span {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}

const VizLatexOverrideContext = createContext<boolean | undefined>(undefined);

export function useVizLatex(): boolean {
  const global = useSettingsStore((s) => s.latexRendering);
  const override = useContext(VizLatexOverrideContext);
  return override ?? global;
}

export function VizLatexToggle({ children }: { children: (action: ReactNode) => ReactNode }) {
  const global = useSettingsStore((s) => s.latexRendering);
  const [override, setOverride] = useState<boolean | undefined>(undefined);
  const resolved = override ?? global;

  const label = resolved ? "Use plain-text labels for this card" : "Use LaTeX-style labels for this card";
  const action = (
    <Tooltip content={label}>
      <IconButton aria-label={label} size="xs" variant={resolved ? "subtle" : "ghost"} onClick={() => setOverride(!resolved)}>
        <LuSigma />
      </IconButton>
    </Tooltip>
  );

  return <VizLatexOverrideContext.Provider value={override}>{children(action)}</VizLatexOverrideContext.Provider>;
}
