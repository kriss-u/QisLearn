import { Fragment, type ReactNode } from "react";
import { renderKatex } from "../viz/latexLabels";

const MATH_SEGMENT = /\$([^$]+)\$/g;

/**
 * Renders a short string with `$...$` segments as KaTeX, everything else as plain text.
 * Used for titles/eyebrows that only need inline math for gate/qubit names, not the full
 * Markdown formatting (GFM, links, emphasis, ...) the `Markdown` component supports.
 */
export function InlineMath({ children }: { children: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  MATH_SEGMENT.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MATH_SEGMENT.exec(children))) {
    if (match.index > lastIndex) {
      parts.push(<Fragment key={key++}>{children.slice(lastIndex, match.index)}</Fragment>);
    }
    parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: renderKatex(match[1]) }} />);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < children.length) {
    parts.push(<Fragment key={key++}>{children.slice(lastIndex)}</Fragment>);
  }
  return <>{parts}</>;
}
