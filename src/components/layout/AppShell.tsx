import {
  Badge,
  Box,
  CloseButton,
  Drawer,
  Flex,
  HStack,
  Heading,
  IconButton,
  Portal,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { LuMenu } from "react-icons/lu";
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

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { lessonId } = useParams();
  const statusByLesson = useProgressStore((s) => s.statusByLesson);

  return (
    <Flex direction="column" h="100%">
      <Box px="6" pt="7" pb="5" flexShrink={0}>
        <Link to="/" onClick={onNavigate}>
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
                  <Link key={lesson.id} to={`/lesson/${lesson.id}`} onClick={onNavigate}>
                    <HStack
                      justify="space-between"
                      px="3"
                      py="2.5"
                      rounded="l2"
                      bg={active ? "colorPalette.subtle" : "transparent"}
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
                        <Badge size="sm" colorPalette={STATUS_COLOR_PALETTE[status]} variant="subtle" flexShrink={0}>
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
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <Flex className="app-shell-root" h="100dvh" bg="bg">
      <Box
        className="no-print"
        as="nav"
        w="300px"
        flexShrink={0}
        h="100%"
        position="sticky"
        top="0"
        borderRightWidth="1px"
        borderColor="border"
        bg="bg.panel"
        display={{ base: "none", md: "block" }}
      >
        <NavContent />
      </Box>

      <Drawer.Root open={navOpen} onOpenChange={(details) => setNavOpen(details.open)} placement="start" size="xs">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content bg="bg.panel">
              <Drawer.CloseTrigger asChild position="absolute" top="4" right="4" zIndex="1">
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
              <NavContent onNavigate={() => setNavOpen(false)} />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

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
          <HStack gap="3">
            <IconButton
              aria-label="Open navigation"
              variant="ghost"
              size="sm"
              display={{ base: "flex", md: "none" }}
              onClick={() => setNavOpen(true)}
            >
              <LuMenu />
            </IconButton>
            <Link to="/" style={{ display: "contents" }}>
              <HStack gap="2" display={{ base: "flex", md: "none" }}>
                <Logo boxSize="6" flexShrink={0} />
                <Heading size="sm">QisLearn</Heading>
              </HStack>
            </Link>
          </HStack>
          <Box flex="1" />
          <LatexModeButton />
          <ColorModeButton />
        </HStack>
        <Box
          as="main"
          className="app-shell-main"
          flex="1"
          minH="0"
          overflowY="auto"
          px={{ base: "4", sm: "5", md: "10" }}
        >
          <Box maxW={{ base: "900px", xl: "1100px", "2xl": "1400px" }} mx="auto">
            {children}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
