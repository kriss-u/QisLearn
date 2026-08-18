import { IconButton } from "@chakra-ui/react";
import { LuRotateCcw } from "react-icons/lu";
import { Tooltip } from "../../ui/tooltip";

export function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip content="Reset to starting values">
      <IconButton aria-label="Reset to starting values" size="xs" variant="ghost" onClick={onClick}>
        <LuRotateCcw />
      </IconButton>
    </Tooltip>
  );
}
