import { Alert, Box, Button, Field, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams, type MetaFunction } from "react-router";
import { signUp } from "../../lib/authClient";
import { AuthScreen } from "../../components/layout/AuthScreen";
import { buildPageMeta } from "../../lib/seo";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Sign up — QisLearn",
    description: "Create a QisLearn account to save your progress.",
    path: "/signup",
  });

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signUpError } = await signUp.email({ name, email, password });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message ?? "Couldn't create your account.");
      return;
    }
    navigate(searchParams.get("redirect") ?? "/courses");
  }

  return (
    <AuthScreen>
      <VStack align="stretch" gap="6">
        <Box>
          <Heading size="lg">Sign up</Heading>
          <Text color="fg.muted" fontSize="sm" mt="1">
            Create an account to save your lesson progress, code, and quiz answers.
          </Text>
        </Box>

        <VStack as="form" onSubmit={handleSubmit} align="stretch" gap="4">
          <Field.Root required>
            <Field.Label>Name</Field.Label>
            <Input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Email</Field.Label>
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Password</Field.Label>
            <Input
              type="password"
              autoComplete="new-password"
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
            Sign up
          </Button>
        </VStack>

        <Text fontSize="sm" color="fg.muted">
          Already have an account?{" "}
          <Link to="/login" style={{ textDecoration: "underline" }}>
            Log in
          </Link>
        </Text>
      </VStack>
    </AuthScreen>
  );
}
