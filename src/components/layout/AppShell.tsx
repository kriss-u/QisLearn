import { Badge, Box, Flex, HStack, Heading, Separator, Text, VStack } from "@chakra-ui/react";
import { useEffect, type PropsWithChildren } from "react";
import { Link, useParams } from "react-router";
import { lessonsByTrack } from "../../content";
import { useProgressStore } from "../../store/progressStore";
import { STATUS_COLOR_PALETTE } from "../../store/statusColor";
import { Logo } from "../ui/Logo";
import { ColorModeButton } from "../ui/color-mode";
import { LatexModeButton } from "../ui/latex-mode";
import { ResetDataButton } from "./ResetDataButton";

const STATUS_LABEL: Record<string, string> = {
  "not-started": "",
  "in-progress": "In progress",
  completed: "Done",
};

export function AppShell({ children }: PropsWithChildren) {
  const { lessonId } = useParams();
  const statusByLesson = useProgressStore((s) => s.statusByLesson);

  useEffect(() => {
    const root = document.documentElement;

    function forceLightForPrint() {
      if (root.classList.contains("dark")) {
        root.dataset.printRestoreDark = "true";
        root.classList.remove("dark");
        root.classList.add("light");
      }
    }

    function restoreThemeAfterPrint() {
      if (root.dataset.printRestoreDark) {
        delete root.dataset.printRestoreDark;
        root.classList.remove("light");
        root.classList.add("dark");
      }
    }

    window.addEventListener("beforeprint", forceLightForPrint);
    window.addEventListener("afterprint", restoreThemeAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", forceLightForPrint);
      window.removeEventListener("afterprint", restoreThemeAfterPrint);
    };
  }, []);

  return (
    <Flex className="app-shell-root" h="100dvh" bg="bg">
      <Flex
        className="no-print"
        as="nav"
        direction="column"
        w="300px"
        flexShrink={0}
        h="100%"
        position="sticky"
        top="0"
        borderRightWidth="1px"
        borderColor="border.glass"
        bg="bg.glass"
        backdropFilter="blur(16px)"
        display={{ base: "none", md: "flex" }}
      >
        <Box px="6" pt="7" pb="5" flexShrink={0}>
          <Link to="/">
            <HStack gap="2.5" mb="1.5">
              <Logo boxSize="8" flexShrink={0} />
              <Heading size="md" colorPalette="quantum" color="colorPalette.fg">
                QisLearn
              </Heading>
            </HStack>
          </Link>
          <Text fontSize="xs" color="fg.muted">
            Learn quantum computing with Qiskit, entirely in your browser.
          </Text>
        </Box>

        <Separator borderColor="border.muted" />

        <Box flex="1" minH="0" overflowY="auto" px="4" py="5">
          {Object.entries(lessonsByTrack).map(([track, lessons]) => (
            <Box key={track} mb="7">
              <Text
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wide"
                color="fg.subtle"
                mb="2.5"
                px="2"
              >
                {track}
              </Text>
              <VStack align="stretch" gap="1">
                {lessons.map((lesson) => {
                  const status = statusByLesson[lesson.id];
                  const active = lesson.id === lessonId;
                  return (
                    <Link key={lesson.id} to={`/lesson/${lesson.id}`}>
                      <HStack
                        justify="space-between"
                        px="3"
                        py="2.5"
                        rounded="l2"
                        bg={active ? "colorPalette.subtle" : "transparent"}
                        borderLeftWidth="3px"
                        borderLeftColor={active ? "colorPalette.solid" : "transparent"}
                        transition="background 0.15s ease"
                        _hover={{ bg: active ? "colorPalette.subtle" : "bg.muted" }}
                      >
                        <Text
                          fontSize="sm"
                          fontWeight={active ? "semibold" : "normal"}
                          color={active ? "colorPalette.fg" : "fg"}
                        >
                          {lesson.title}
                        </Text>
                        {status && status !== "not-started" && (
                          <Badge
                            size="sm"
                            colorPalette={STATUS_COLOR_PALETTE[status]}
                            variant="subtle"
                            flexShrink={0}
                          >
                            {STATUS_LABEL[status]}
                          </Badge>
                        )}
                      </HStack>
                    </Link>
                  );
                })}
              </VStack>
            </Box>
          ))}
        </Box>

        <Separator borderColor="border.muted" flexShrink={0} />
        <Box px="4" py="4" flexShrink={0}>
          <ResetDataButton />
        </Box>

        <Box as="footer" px="6" py="4" borderTopWidth="1px" borderColor="border.muted" flexShrink={0}>
          <Text fontSize="xs" color="fg.subtle">
            Made by Krishna Upadhyay
          </Text>
        </Box>
      </Flex>

      <Flex className="app-shell-col" direction="column" flex="1" minW="0" h="100%">
        <HStack
          className="no-print"
          as="header"
          h="16"
          flexShrink={0}
          justify="space-between"
          px={{ base: "4", md: "8" }}
          borderBottomWidth="1px"
          borderColor="border.glass"
          bg="bg.glass"
          backdropFilter="blur(16px)"
          position="sticky"
          top="0"
          zIndex="1"
        >
          <Link to="/">
            <Heading size="sm" display={{ base: "block", md: "none" }}>
              QisLearn
            </Heading>
          </Link>
          <Box flex="1" />
          <LatexModeButton />
          <ColorModeButton />
        </HStack>
        <Box as="main" className="app-shell-main" flex="1" minH="0" overflowY="auto" px={{ base: "5", md: "10" }}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
