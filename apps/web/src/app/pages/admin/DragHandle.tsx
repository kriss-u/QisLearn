import { Box } from "@chakra-ui/react";
import type { DragEvent, RefObject } from "react";
import { LuGripVertical } from "react-icons/lu";

export function DragHandle({
  onDragStart,
  onDragEnd,
  rowRef,
}: {
  onDragStart: () => void;
  onDragEnd: () => void;
  rowRef: RefObject<HTMLElement | null>;
}) {
  return (
    <Box
      as="span"
      draggable
      cursor="grab"
      color="fg.muted"
      display="inline-flex"
      alignItems="center"
      flexShrink={0}
      onDragStart={(e: DragEvent) => {
        onDragStart();
        if (rowRef.current) e.dataTransfer.setDragImage(rowRef.current, 20, 20);
      }}
      onDragEnd={onDragEnd}
    >
      <LuGripVertical />
    </Box>
  );
}
