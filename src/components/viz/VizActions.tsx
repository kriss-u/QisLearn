import { HStack, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { LuCheck, LuCopy, LuDownload } from "react-icons/lu";
import { Tooltip } from "../ui/tooltip";

export interface VizActionsProps {
  onCopy: () => Promise<void>;
  onDownload: () => Promise<void>;
  copyLabel?: string;
  downloadLabel?: string;
}

export function VizActions({
  onCopy,
  onDownload,
  copyLabel = "Copy as image",
  downloadLabel = "Download as PNG",
}: VizActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <HStack gap="1">
      <Tooltip content={copied ? "Copied!" : copyLabel}>
        <IconButton aria-label={copyLabel} size="xs" variant="ghost" onClick={handleCopy}>
          {copied ? <LuCheck /> : <LuCopy />}
        </IconButton>
      </Tooltip>
      <Tooltip content={downloadLabel}>
        <IconButton aria-label={downloadLabel} size="xs" variant="ghost" onClick={onDownload}>
          <LuDownload />
        </IconButton>
      </Tooltip>
    </HStack>
  );
}
