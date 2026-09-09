import { Box, Button, Container, Field, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router";
import { signOut, updateUser, useSession } from "../../lib/authClient";
import { requireSession } from "../../lib/session.server";
import { buildPageMeta } from "../../lib/seo";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";

export const meta: MetaFunction = () =>
  buildPageMeta({ title: "Your profile — QisLearn", description: "Manage your QisLearn account.", path: "/profile" });

export async function loader({ request }: LoaderFunctionArgs) {
  await requireSession(request, "/profile");
  return null;
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session) setName(session.user.name);
  }, [session]);

  if (isPending) return null;
  if (!session) return <Navigate to="/login?redirect=/profile" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    await updateUser({ name });
    setSaving(false);
    setSaved(true);
  }

  return (
    <Container maxW="sm" py={{ base: "10", md: "16" }}>
      <VStack align="stretch" gap="6">
        <Heading size="lg">Your profile</Heading>

        <VStack as="form" onSubmit={handleSubmit} align="stretch" gap="4">
          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input value={session.user.email} disabled />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Name</Field.Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field.Root>

          {saved && (
            <Text fontSize="sm" color="fg.muted">
              Saved.
            </Text>
          )}

          <Button type="submit" colorPalette="quantum" loading={saving}>
            Save
          </Button>
        </VStack>

        <Box borderTopWidth="1px" borderColor="border" pt="6">
          <Button variant="outline" onClick={() => signOut().then(() => window.location.assign("/"))}>
            Log out
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}
