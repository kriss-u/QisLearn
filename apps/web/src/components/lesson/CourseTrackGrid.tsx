import { Badge, Box, Card, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router";
import type { CourseGroup } from "../../content";
import { useProgressStore } from "../../store/progressStore";
import { STATUS_COLOR_PALETTE } from "../../store/statusColor";

// Shared between HomePage (renders the viewer's one course directly, no
// redirect) and CourseHomePage (a specific course, reached from the
// picker when there's more than one) — the actual track/lesson grid,
// generic with respect to subject matter: only `course`'s own data
// (title/tracks/lessons) drives what renders here.
export function CourseTrackGrid({ course }: { course: CourseGroup }) {
  const statusByLesson = useProgressStore((s) => s.statusByLesson);

  return (
    <>
      {course.tracks.map((track) => (
        <Box key={track.slug} mb="14">
          <Heading size="lg" mb="5">
            {track.title}
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, "2xl": 4 }} gap="5">
            {track.lessons.map((lesson) => {
              const status = statusByLesson[lesson.id] ?? "not-started";
              return (
                <Link key={lesson.id} to={`/lesson/${lesson.id}`}>
                  <Card.Root
                    h="full"
                    colorPalette="quantum"
                    variant="elevated"
                    bg="bg.glass"
                    backdropFilter="blur(12px)"
                    boxShadow="glass"
                    _hover={{ borderColor: "colorPalette.solid", transform: "translateY(-3px)", boxShadow: "glow" }}
                    borderWidth="1px"
                    borderColor="border.glass"
                  >
                    <Card.Body gap="1">
                      <VStack align="stretch" gap="2.5">
                        <Badge
                          alignSelf="flex-start"
                          colorPalette={STATUS_COLOR_PALETTE[status]}
                          variant="subtle"
                          textTransform="capitalize"
                        >
                          {status.replace("-", " ")}
                        </Badge>
                        <Card.Title fontSize="lg">{lesson.title}</Card.Title>
                        <Card.Description fontSize="sm">{lesson.summary}</Card.Description>
                        <Text fontSize="xs" color="fg.subtle" mt="1">
                          {lesson.estimatedMinutes} min read
                        </Text>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                </Link>
              );
            })}
          </SimpleGrid>
        </Box>
      ))}
    </>
  );
}
