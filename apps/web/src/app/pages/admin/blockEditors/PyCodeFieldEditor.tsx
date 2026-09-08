import { Box, Skeleton } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
import { ClientOnly } from "../../../../components/ClientOnly";

// Same lazy+ClientOnly pattern CodeExercise.tsx uses for the learner-facing
// editor — @uiw/react-codemirror touches browser-only APIs.
const PyEditor = lazy(() => import("../../../../components/editor/PyEditor").then((m) => ({ default: m.PyEditor })));

export function PyCodeFieldEditor({
  value,
  onChange,
  minHeight = "260px",
}: {
  value: string;
  onChange: (next: string) => void;
  minHeight?: string;
}) {
  return (
    <Box w="full">
      <ClientOnly fallback={<Skeleton h={minHeight} rounded="l3" />}>
        {() => (
          <Suspense fallback={<Skeleton h={minHeight} rounded="l3" />}>
            <PyEditor value={value} onChange={onChange} minHeight={minHeight} />
          </Suspense>
        )}
      </ClientOnly>
    </Box>
  );
}
