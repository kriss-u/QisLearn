import { Badge, Box, Container, HStack, Heading, IconButton, Separator, Text } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import { LuPrinter } from "react-icons/lu";
import type { LessonFrontmatter, LessonLayout as LessonLayoutKind } from "../../content/schema";

const LAYOUT_CONFIG: Record<LessonLayoutKind, { maxW: string; note: string }> = {
  standard: { maxW: "4xl", note: "" },
  "theory-heavy": { maxW: "3xl", note: "Reading-focused" },
  "circuit-focus": { maxW: "6xl", note: "Circuit workspace" },
  lab: { maxW: "7xl", note: "Lab" },
};

export function getLessonMaxWidth(layout: LessonLayoutKind): string {
  return LAYOUT_CONFIG[layout].maxW;
}

export function LessonLayout({ lesson, children }: PropsWithChildren<{ lesson: LessonFrontmatter }>) {
  const config = LAYOUT_CONFIG[lesson.layout];

  return (
    <Container maxW={config.maxW} px="0">
      <HStack className="no-print" mb="3" gap="2" justify="space-between">
        <HStack gap="2">
          <Badge colorPalette="quantum" variant="subtle" size="lg" textTransform="capitalize">
            {lesson.track}
          </Badge>
          {config.note && (
            <Badge variant="outline" colorPalette="ember" size="lg">
              {config.note}
            </Badge>
          )}
          <Text fontSize="sm" color="fg.muted">
            {lesson.estimatedMinutes} min read
          </Text>
        </HStack>
        <IconButton
          aria-label="Print lesson"
          variant="ghost"
          size="sm"
          onClick={() => window.print()}
        >
          <LuPrinter />
        </IconButton>
      </HStack>
      <Box id="lesson-print-area">
        <Heading size="2xl" mb="2">
          {lesson.title}
        </Heading>
        <Text color="fg.muted" mb="10" fontSize="lg" maxW="2xl">
          {lesson.summary}
        </Text>
        <Separator className="print-only" borderColor="border.muted" mb="8" />
        {children}
      </Box>
    </Container>
  );
}
