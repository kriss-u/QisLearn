import { HStack, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { LuCheck, LuCopy, LuDownload } from "react-icons/lu";
import { Tooltip } from "../ui/tooltip";

export interface VizActionsProps {
  onCopy: () => Promise<void>;
  onDownload: () => Promise<void>;
}

export function VizActions({ onCopy, onDownload }: VizActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <HStack gap="1">
      <Tooltip content={copied ? "Copied!" : "Copy as image"}>
        <IconButton aria-label="Copy as image" size="xs" variant="ghost" onClick={handleCopy}>
          {copied ? <LuCheck /> : <LuCopy />}
        </IconButton>
      </Tooltip>
      <Tooltip content="Download as PNG">
        <IconButton aria-label="Download as PNG" size="xs" variant="ghost" onClick={onDownload}>
          <LuDownload />
        </IconButton>
      </Tooltip>
    </HStack>
  );
}
