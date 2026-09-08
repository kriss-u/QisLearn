import { Alert, Box, Button, Container, Field, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams, type MetaFunction } from "react-router";
import { signIn } from "../../lib/authClient";
import { buildPageMeta } from "../../lib/seo";

export const meta: MetaFunction = () =>
  buildPageMeta({ title: "Log in — QisLearn", description: "Log in to QisLearn to save your progress.", path: "/login" });

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn.email({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message ?? "Couldn't log you in — check your email and password.");
      return;
    }
    navigate(searchParams.get("redirect") ?? "/");
  }

  return (
    <Container maxW="sm" py={{ base: "10", md: "16" }}>
      <VStack align="stretch" gap="6">
        <Box>
          <Heading size="lg">Log in</Heading>
          <Text color="fg.muted" fontSize="sm" mt="1">
            Log in to save your lesson progress, code, and quiz answers to your account.
          </Text>
        </Box>

        <VStack as="form" onSubmit={handleSubmit} align="stretch" gap="4">
          <Field.Root required>
            <Field.Label>Email</Field.Label>
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Password</Field.Label>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field.Root>

          {error && (
            <Alert.Root status="error" rounded="l2">
              <Alert.Indicator />
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}

          <Button type="submit" colorPalette="quantum" loading={submitting}>
            Log in
          </Button>
        </VStack>

        <Text fontSize="sm" color="fg.muted">
          Don't have an account?{" "}
          <Link to="/signup" style={{ textDecoration: "underline" }}>
            Sign up
          </Link>
        </Text>
      </VStack>
    </Container>
  );
}
