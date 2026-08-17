import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { LuCircle, LuCircleCheck, LuCircleDot } from "react-icons/lu";
import { Link } from "react-router";
import { getLesson } from "../../content";
import { useProgressStore } from "../../store/progressStore";

const STATUS_ICON = {
  completed: <LuCircleCheck color="var(--chakra-colors-quantum-solid)" />,
  "in-progress": <LuCircleDot color="var(--chakra-colors-ember-solid)" />,
  "not-started": <LuCircle color="var(--chakra-colors-fg-subtle)" />,
};

/**
 * Informational only — prerequisites are suggested reading order, not a gate.
 * A learner can jump straight into a lesson regardless of what's shown here.
 */
export function PrerequisitesList({ prerequisiteIds }: { prerequisiteIds: string[] }) {
  const statusByLesson = useProgressStore((s) => s.statusByLesson);

  if (prerequisiteIds.length === 0) return null;

  return (
    <Box mb="8" p="4" rounded="l3" borderWidth="1px" borderColor="border" bg="bg.subtle">
      <Text fontSize="sm" fontWeight="medium" mb="2.5">
        Suggested before this lesson
      </Text>
      <VStack align="stretch" gap="1.5">
        {prerequisiteIds.map((id) => {
          const prereq = getLesson(id);
          const status = statusByLesson[id] ?? "not-started";
          if (!prereq) return null;
          return (
            <HStack key={id} gap="2">
              {STATUS_ICON[status]}
              <Text
                asChild
                fontSize="sm"
                color={status === "completed" ? "fg.muted" : "fg"}
                _hover={{ color: "quantum.solid", textDecoration: "underline" }}
                transition="color 0.15s ease"
              >
                <Link to={`/lesson/${prereq.id}`}>{prereq.title}</Link>
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
}
