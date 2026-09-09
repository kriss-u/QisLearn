import { Box, Text } from "@chakra-ui/react";
import type { ComponentType } from "react";
import type { ContentBlockData } from "../../content";
import { Markdown } from "./Markdown";
import { mdxComponents } from "./mdxComponents";

export interface ContentBlockListProps {
  blocks: ContentBlockData[];
}

// A block whose type has no matching component here — either a typo, or a
// widget catalog entry (see packages/db's `widget` table) that's been
// cataloged for authors to plan around but doesn't have a working
// component/field-spec yet. Suggestive, not blocking: authors can still
// place it, it just renders this instead of the real thing.
function NotImplementedBlock({ type }: { type: string }) {
  return (
    <Box borderWidth="1px" borderStyle="dashed" borderColor="border" rounded="l2" p="4" color="fg.muted">
      <Text fontSize="sm">"{type}" isn't implemented yet.</Text>
    </Box>
  );
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
          return <NotImplementedBlock key={block.id} type={block.type} />;
        }
        return <Component key={block.id} {...block.data} />;
      })}
    </>
  );
}
