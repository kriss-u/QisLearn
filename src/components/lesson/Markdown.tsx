import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { inlineMarkdownElements, markdownElements } from "./markdownElements";

export interface MarkdownProps {
  children: string;
  /** Renders without block-level margins — for text embedded in labels, cards, etc. */
  inline?: boolean;
}

export function Markdown({ children, inline = false }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={inline ? inlineMarkdownElements : markdownElements}
    >
      {children}
    </ReactMarkdown>
  );
}
