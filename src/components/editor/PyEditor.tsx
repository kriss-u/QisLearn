import { Box, IconButton } from "@chakra-ui/react";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { useColorMode } from "../ui/color-mode";

const fontTheme = EditorView.theme({
  "&": { fontFamily: "'Fira Code', ui-monospace, monospace" },
  ".cm-content": { fontFamily: "'Fira Code', ui-monospace, monospace" },
});

export interface PyEditorProps {
  value: string;
  onChange?: (value: string) => void;
  minHeight?: string;
  readOnly?: boolean;
  showLineNumbers?: boolean;
}

export function PyEditor({
  value,
  onChange,
  minHeight,
  readOnly = false,
  showLineNumbers = true,
}: PyEditorProps) {
  const { colorMode } = useColorMode();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Box
      position="relative"
      borderWidth="1px"
      borderColor="border"
      rounded="l3"
      overflow="hidden"
      fontFamily="mono"
      fontSize="sm"
    >
      <IconButton
        className="no-print"
        aria-label="Copy code"
        size="xs"
        variant="ghost"
        position="absolute"
        top="2"
        right="2"
        zIndex="1"
        onClick={handleCopy}
      >
        {copied ? <LuCheck /> : <LuCopy />}
      </IconButton>
      <CodeMirror
        value={value}
        onChange={onChange}
        minHeight={minHeight}
        theme={colorMode === "dark" ? oneDark : "light"}
        extensions={[python(), fontTheme]}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: showLineNumbers,
          foldGutter: false,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
        }}
      />
    </Box>
  );
}
