import { Box, Skeleton } from "@chakra-ui/react";
import { Suspense, lazy } from "react";

const PyEditor = lazy(() => import("../editor/PyEditor").then((m) => ({ default: m.PyEditor })));

const HIGHLIGHTABLE = new Set(["python", "py"]);

export function MarkdownCodeBlock({ code, language }: { code: string; language?: string }) {
  if (language && HIGHLIGHTABLE.has(language)) {
    return (
      <Suspense fallback={<Skeleton h="90px" rounded="l3" mb="3" />}>
        <Box mb="3">
          <PyEditor value={code} readOnly showLineNumbers={false} />
        </Box>
      </Suspense>
    );
  }

  return (
    <Box as="pre" bg="bg.muted" p="3" rounded="l3" overflowX="auto" fontSize="sm" fontFamily="mono" mb="3">
      <code>{code}</code>
    </Box>
  );
}
