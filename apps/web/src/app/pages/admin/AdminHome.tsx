import { Box, Button, Field, HStack, Heading, Input, Separator, Spinner, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router";
import { useAdminTracksQuery, useCreateLessonMutation, useCreateTrackMutation } from "@qislearn/graphql-schema";

function NewTrackForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(0);
  const [createTrack, { loading }] = useCreateTrackMutation();

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Add track
      </Button>
    );
  }

  async function handleSubmit() {
    await createTrack({ variables: { slug, title, order } });
    setOpen(false);
    setSlug("");
    setTitle("");
    setOrder(0);
    onCreated();
  }

  return (
    <VStack align="stretch" gap="2" borderWidth="1px" borderColor="border" rounded="l2" p="3">
      <HStack>
        <Field.Root>
          <Field.Label>Slug</Field.Label>
          <Input size="sm" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field.Root>
        <Field.Root>
          <Field.Label>Title</Field.Label>
          <Input size="sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field.Root>
        <Field.Root maxW="24">
          <Field.Label>Order</Field.Label>
          <Input size="sm" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </Field.Root>
      </HStack>
      <HStack>
        <Button size="sm" colorPalette="quantum" onClick={handleSubmit} loading={loading} disabled={!slug || !title}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </HStack>
    </VStack>
  );
}

function NewLessonForm({ trackId, onCreated }: { trackId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(0);
  const [createLesson, { loading }] = useCreateLessonMutation();

  if (!open) {
    return (
      <Button size="xs" variant="ghost" onClick={() => setOpen(true)}>
        + Add lesson
      </Button>
    );
  }

  async function handleSubmit() {
    await createLesson({
      variables: {
        trackId,
        slug,
        title,
        summary: "",
        layout: "standard",
        difficulty: "BEGINNER",
        order,
        estimatedMinutes: 10,
      },
    });
    setOpen(false);
    setSlug("");
    setTitle("");
    setOrder(0);
    onCreated();
  }

  return (
    <VStack align="stretch" gap="2" borderWidth="1px" borderColor="border" rounded="l2" p="3">
      <HStack>
        <Field.Root>
          <Field.Label fontSize="xs">Slug</Field.Label>
          <Input size="sm" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="xs">Title</Field.Label>
          <Input size="sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field.Root>
        <Field.Root maxW="24">
          <Field.Label fontSize="xs">Order</Field.Label>
          <Input size="sm" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </Field.Root>
      </HStack>
      <Text fontSize="xs" color="fg.muted">
        Summary, layout, difficulty, and everything else can be filled in on the lesson's editor page after creating it.
      </Text>
      <HStack>
        <Button size="sm" colorPalette="quantum" onClick={handleSubmit} loading={loading} disabled={!slug || !title}>
          Create
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </HStack>
    </VStack>
  );
}

export default function AdminHome() {
  const { data, loading, refetch } = useAdminTracksQuery();

  if (loading) return <Spinner />;

  const tracks = data?.tracks ?? [];

  return (
    <VStack align="stretch" gap="8">
      {tracks.map((track) => (
        <Box key={track.id}>
          <Heading size="md" mb="3">
            {track.title} <Text as="span" fontSize="sm" color="fg.muted">({track.slug})</Text>
          </Heading>
          <VStack align="stretch" gap="1" mb="3">
            {track.lessons.map((lesson) => (
              <HStack
                key={lesson.id}
                justify="space-between"
                px="3"
                py="2"
                rounded="l2"
                borderWidth="1px"
                borderColor="border"
              >
                <HStack gap="3">
                  <Text fontSize="sm">{lesson.title}</Text>
                  <Text fontSize="xs" color="fg.muted">
                    {lesson.slug} · {lesson.difficulty.toLowerCase()}
                  </Text>
                </HStack>
                <Link to={`/admin/lessons/${lesson.id}`}>
                  <Text fontSize="sm" textDecoration="underline">
                    Edit
                  </Text>
                </Link>
              </HStack>
            ))}
          </VStack>
          <NewLessonForm trackId={track.id} onCreated={() => refetch()} />
        </Box>
      ))}

      <Separator />
      <NewTrackForm onCreated={() => refetch()} />
    </VStack>
  );
}
