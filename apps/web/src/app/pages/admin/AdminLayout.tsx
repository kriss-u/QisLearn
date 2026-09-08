import { Box, Container, HStack, Heading, Link as ChakraLink, Spinner } from "@chakra-ui/react";
import { Link, Navigate, Outlet } from "react-router";
import { useSession } from "../../../lib/authClient";

export default function AdminLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Container py="16">
        <Spinner />
      </Container>
    );
  }

  // Redirect non-admins to "/" rather than "/login" — an unauthorized visitor
  // shouldn't be able to tell this route exists from the redirect target.
  if (!session || session.user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxW="4xl" py={{ base: "6", md: "10" }}>
      <HStack justify="space-between" mb="8">
        <Heading size="lg">Content admin</Heading>
        <ChakraLink asChild fontSize="sm" color="fg.muted">
          <Link to="/">Back to site</Link>
        </ChakraLink>
      </HStack>
      <Box>
        <Outlet />
      </Box>
    </Container>
  );
}
