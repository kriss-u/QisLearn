import { Badge, Box, Card, Container, HStack, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router";
import { lessonsByTrack } from "../../content";
import { useProgressStore } from "../../store/progressStore";
import { STATUS_COLOR_PALETTE } from "../../store/statusColor";
import { Logo } from "../../components/ui/Logo";

export function HomePage() {
  const statusByLesson = useProgressStore((s) => s.statusByLesson);

  return (
    <Container maxW="6xl" px="0" py={{ base: "6", md: "10" }}>
      <Box mb="14" maxW="2xl">
        <HStack gap="3" mb="5">
          <Logo boxSize="10" />
          <Badge colorPalette="ember" variant="subtle" size="lg">
            Runs 100% in your browser
          </Badge>
        </HStack>
        <Heading size="3xl" mb="4" letterSpacing="tight">
          Learn Quantum Computing with{" "}
          <Text as="span" color="colorPalette.fg">
            Qiskit
          </Text>
        </Heading>
        <Text color="fg.muted" fontSize="lg">
          Interactive lessons that run entirely in your browser. Progress is saved locally in
          IndexedDB — nothing leaves your machine.
        </Text>
      </Box>

      {Object.entries(lessonsByTrack).map(([track, lessons]) => (
        <Box key={track} mb="14">
          <Heading size="lg" mb="5" textTransform="capitalize">
            {track}
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="5">
            {lessons.map((lesson) => {
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
    </Container>
  );
}
