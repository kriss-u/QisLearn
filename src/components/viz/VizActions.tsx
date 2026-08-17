import { HStack, IconButton, Menu, Portal } from "@chakra-ui/react";
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

export interface VizFormatActionsProps {
  onCopyImage: () => Promise<void>;
  onCopyCsv: () => Promise<void>;
  onDownloadImage: () => Promise<void>;
  onDownloadCsv: () => Promise<void>;
}

export function VizFormatActions({ onCopyImage, onCopyCsv, onDownloadImage, onDownloadCsv }: VizFormatActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(action: () => Promise<void>) {
    await action();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <HStack gap="1">
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <IconButton aria-label={copied ? "Copied!" : "Copy"} size="xs" variant="ghost">
            {copied ? <LuCheck /> : <LuCopy />}
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="copy-image" onClick={() => handleCopy(onCopyImage)}>
                Copy as image
              </Menu.Item>
              <Menu.Item value="copy-csv" onClick={() => handleCopy(onCopyCsv)}>
                Copy as CSV
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <IconButton aria-label="Download" size="xs" variant="ghost">
            <LuDownload />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="download-image" onClick={onDownloadImage}>
                Download as image
              </Menu.Item>
              <Menu.Item value="download-csv" onClick={onDownloadCsv}>
                Download as CSV
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </HStack>
  );
}
