import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
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
    <Box>
      <HStack className="no-print" justify="space-between" mb="1">
        <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="fg.muted">
          Python
        </Text>
        <IconButton aria-label="Copy code" size="xs" variant="ghost" onClick={handleCopy}>
          {copied ? <LuCheck /> : <LuCopy />}
        </IconButton>
      </HStack>
      <Box
        borderWidth="1px"
        borderColor="border"
        rounded="l3"
        overflow="hidden"
        fontFamily="mono"
        fontSize="sm"
      >
        <CodeMirror
          value={value}
          onChange={onChange}
          minHeight={minHeight}
          theme={colorMode === "dark" ? githubDark : githubLight}
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
    </Box>
  );
}
