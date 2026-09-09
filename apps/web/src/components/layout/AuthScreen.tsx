import { Center, Container } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import { Link } from "react-router";
import { Logo } from "../ui/Logo";

// Standalone screen for login/signup — no AppShell sidebar/nav, since
// there's no course content to navigate yet. Centers a single card the
// way a dedicated auth screen usually looks, rather than a bare page
// fragment sitting at the top of an otherwise-empty viewport.
export function AuthScreen({ children }: PropsWithChildren) {
  return (
    <Center minH="100dvh" px="4">
      <Container maxW="sm" py={{ base: "10", md: "16" }}>
        <Link to="/" aria-label="QisLearn">
          <Logo boxSize="10" mb="6" />
        </Link>
        {children}
      </Container>
    </Center>
  );
}
