import type { ComponentType } from "react";
import type { ContentBlockData } from "../../content";
import { Markdown } from "./Markdown";
import { mdxComponents } from "./mdxComponents";

export interface ContentBlockListProps {
  blocks: ContentBlockData[];
}

export function ContentBlockList({ blocks }: ContentBlockListProps) {
  return (
    <>
      {blocks.map((block) => {
        if (block.type === "markdown") {
          return <Markdown key={block.id}>{block.data.text as string}</Markdown>;
        }

        const Component = (mdxComponents as unknown as Record<string, ComponentType<Record<string, unknown>> | undefined>)[
          block.type
        ];
        if (!Component) {
          if (import.meta.env.DEV) {
            console.warn(`Unknown content block type: ${block.type}`);
          }
          return null;
        }
        return <Component key={block.id} {...block.data} />;
      })}
    </>
  );
}
