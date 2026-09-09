import { Box, HStack, Heading, Link as ChakraLink } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import { Link } from "react-router";
import { AuthMenu } from "../../../components/layout/AuthMenu";
import { ColorModeButton } from "../../../components/ui/color-mode";
import { Logo } from "../../../components/ui/Logo";

export function AdminShell({ children }: PropsWithChildren) {
  return (
    <Box minH="100dvh" bg="bg">
      <HStack
        as="header"
        h="16"
        px={{ base: "4", md: "8" }}
        justify="space-between"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg.panel"
        position="sticky"
        top="0"
        zIndex="1"
      >
        <HStack gap="6">
          <Link to="/admin">
            <HStack gap="2">
              <Logo boxSize="6" flexShrink={0} />
              <Heading size="sm">QisLearn Admin</Heading>
            </HStack>
          </Link>
          <ChakraLink asChild fontSize="sm" color="fg.muted">
            <Link to="/admin">Content</Link>
          </ChakraLink>
          <ChakraLink asChild fontSize="sm" color="fg.muted">
            <Link to="/admin/widgets">Widgets</Link>
          </ChakraLink>
          <ChakraLink asChild fontSize="sm" color="fg.muted">
            <Link to="/admin/content-backup">Content backup</Link>
          </ChakraLink>
        </HStack>
        <HStack gap="3">
          <ChakraLink asChild fontSize="sm" color="fg.muted">
            <Link to="/">Back to site</Link>
          </ChakraLink>
          <ColorModeButton />
          <AuthMenu />
        </HStack>
      </HStack>

      <Box px={{ base: "4", md: "8" }} py={{ base: "6", md: "10" }}>
        {children}
      </Box>
    </Box>
  );
}
