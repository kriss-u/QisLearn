import {
  Alert,
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Heading,
  Input,
  NativeSelect,
  Portal,
  Separator,
  Spinner,
  Text,
  Textarea,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  type LessonDifficulty,
  useAdminLessonQuery,
  useAdminTagsQuery,
  useAdminTracksQuery,
  useCreateContentBlockMutation,
  useCreateTagMutation,
  useDeleteContentBlockMutation,
  useDeleteLessonMutation,
  useUpdateContentBlockMutation,
  useUpdateLessonMutation,
  useUpdateLessonPrerequisitesMutation,
  useUpdateLessonTagsMutation,
} from "@qislearn/graphql-schema";

const LAYOUTS = ["standard", "theory-heavy", "circuit-focus", "lab"];

function LessonMetadataForm({
  lesson,
  allLessons,
  onSaved,
}: {
  lesson: NonNullable<NonNullable<ReturnType<typeof useAdminLessonQuery>["data"]>["adminLesson"]>;
  allLessons: Array<{ id: string; slug: string; title: string }>;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [summary, setSummary] = useState(lesson.summary);
  const [layout, setLayout] = useState(lesson.layout);
  const [difficulty, setDifficulty] = useState<LessonDifficulty>(lesson.difficulty);
  const [order, setOrder] = useState(lesson.order);
  const [estimatedMinutes, setEstimatedMinutes] = useState(lesson.estimatedMinutes);
  const [prerequisiteIds, setPrerequisiteIds] = useState(lesson.prerequisites.map((p) => p.id));

  const [updateLesson, { loading: savingLesson }] = useUpdateLessonMutation();
  const [updatePrerequisites, { loading: savingPrereqs }] = useUpdateLessonPrerequisitesMutation();

  async function handleSave() {
    await updateLesson({
      variables: { id: lesson.id, title, summary, layout, difficulty, order, estimatedMinutes },
    });
    await updatePrerequisites({ variables: { lessonId: lesson.id, prerequisiteLessonIds: prerequisiteIds } });
    onSaved();
  }

  return (
    <VStack align="stretch" gap="4" borderWidth="1px" borderColor="border" rounded="l3" p="4">
      <Field.Root>
        <Field.Label>Title</Field.Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field.Root>
      <Field.Root>
        <Field.Label>Summary</Field.Label>
        <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} />
      </Field.Root>
      <HStack align="start">
        <Field.Root>
          <Field.Label>Layout</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field value={layout} onChange={(e) => setLayout(e.target.value)}>
              {LAYOUTS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>Difficulty</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as LessonDifficulty)}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root maxW="28">
          <Field.Label>Order</Field.Label>
          <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </Field.Root>
        <Field.Root maxW="32">
          <Field.Label>Minutes</Field.Label>
          <Input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
          />
        </Field.Root>
      </HStack>

      <Field.Root>
        <Field.Label>Prerequisites</Field.Label>
        <Wrap gap="2">
          {allLessons
            .filter((l) => l.id !== lesson.id)
            .map((l) => {
              const checked = prerequisiteIds.includes(l.id);
              return (
                <Badge
                  key={l.id}
                  as="button"
                  cursor="pointer"
                  variant={checked ? "solid" : "outline"}
                  colorPalette={checked ? "quantum" : "gray"}
                  onClick={() =>
                    setPrerequisiteIds((prev) =>
                      checked ? prev.filter((id) => id !== l.id) : [...prev, l.id],
                    )
                  }
                >
                  {l.title}
                </Badge>
              );
            })}
        </Wrap>
      </Field.Root>

      <Button
        alignSelf="start"
        colorPalette="quantum"
        onClick={handleSave}
        loading={savingLesson || savingPrereqs}
      >
        Save lesson
      </Button>
    </VStack>
  );
}

function TagPicker({ lessonId, currentTagIds }: { lessonId: string; currentTagIds: string[] }) {
  const { data, refetch: refetchTags } = useAdminTagsQuery();
  const [newTag, setNewTag] = useState("");
  const [createTag] = useCreateTagMutation();
  const [updateLessonTags] = useUpdateLessonTagsMutation();
  const [selected, setSelected] = useState(currentTagIds);

  const tags = data?.adminTags ?? [];

  async function toggle(tagId: string) {
    const next = selected.includes(tagId) ? selected.filter((id) => id !== tagId) : [...selected, tagId];
    setSelected(next);
    await updateLessonTags({ variables: { lessonId, tagIds: next } });
  }

  async function handleAddTag() {
    if (!newTag.trim()) return;
    const slug = newTag.trim().toLowerCase().replace(/\s+/g, "-");
    const { data: created } = await createTag({ variables: { slug, label: newTag.trim() } });
    setNewTag("");
    await refetchTags();
    if (created?.createTag) await toggle(created.createTag.id);
  }

  return (
    <VStack align="stretch" gap="2">
      <Text fontSize="sm" fontWeight="medium">
        Tags
      </Text>
      <Wrap gap="2">
        {tags.map((t) => {
          const checked = selected.includes(t.id);
          return (
            <Badge
              key={t.id}
              as="button"
              cursor="pointer"
              variant={checked ? "solid" : "outline"}
              onClick={() => toggle(t.id)}
            >
              {t.label}
            </Badge>
          );
        })}
      </Wrap>
      <HStack maxW="sm">
        <Input size="sm" placeholder="New tag label" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
        <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
          Add tag
        </Button>
      </HStack>
    </VStack>
  );
}

interface BlockRowProps {
  block: { id: string; order: number; type: string; data: Record<string, unknown> };
  onSaved: () => void;
}

function ContentBlockRow({ block, onSaved }: BlockRowProps) {
  const [type, setType] = useState(block.type);
  const [order, setOrder] = useState(block.order);
  const [dataText, setDataText] = useState(JSON.stringify(block.data, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updateBlock, { loading: saving }] = useUpdateContentBlockMutation();
  const [deleteBlock, { loading: deleting }] = useDeleteContentBlockMutation();

  function handleSave() {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(dataText);
    } catch {
      setJsonError("Data isn't valid JSON — fix it before saving.");
      return;
    }
    setJsonError(null);
    updateBlock({ variables: { id: block.id, type, order, data: parsed } }).then(() => onSaved());
  }

  return (
    <VStack align="stretch" gap="2" borderWidth="1px" borderColor="border" rounded="l2" p="3">
      <HStack>
        <Field.Root maxW="48">
          <Field.Label fontSize="xs">Type</Field.Label>
          <Input size="sm" value={type} onChange={(e) => setType(e.target.value)} />
        </Field.Root>
        <Field.Root maxW="24">
          <Field.Label fontSize="xs">Order</Field.Label>
          <Input size="sm" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </Field.Root>
      </HStack>
      <Field.Root>
        <Field.Label fontSize="xs">Data (JSON)</Field.Label>
        <Textarea
          fontFamily="mono"
          fontSize="xs"
          rows={6}
          value={dataText}
          onChange={(e) => setDataText(e.target.value)}
        />
      </Field.Root>
      {jsonError && (
        <Alert.Root status="error" size="sm">
          <Alert.Indicator />
          <Alert.Description>{jsonError}</Alert.Description>
        </Alert.Root>
      )}
      <HStack>
        <Button size="sm" colorPalette="quantum" onClick={handleSave} loading={saving}>
          Save block
        </Button>
        <Dialog.Root open={confirmOpen} onOpenChange={(d) => setConfirmOpen(d.open)} role="alertdialog">
          <Dialog.Trigger asChild>
            <Button size="sm" variant="outline" colorPalette="red">
              Delete
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete this block?</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Text color="fg.muted">This removes it from the live lesson immediately. This can't be undone.</Text>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="ghost">Cancel</Button>
                  </Dialog.ActionTrigger>
                  <Button
                    colorPalette="red"
                    loading={deleting}
                    onClick={() => deleteBlock({ variables: { id: block.id } }).then(() => onSaved())}
                  >
                    Delete
                  </Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </HStack>
    </VStack>
  );
}

function NewBlockRow({ lessonId, nextOrder, onCreated }: { lessonId: string; nextOrder: number; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("markdown");
  const [dataText, setDataText] = useState('{\n  "content": ""\n}');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [createBlock, { loading }] = useCreateContentBlockMutation();

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Add block
      </Button>
    );
  }

  function handleCreate() {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(dataText);
    } catch {
      setJsonError("Data isn't valid JSON — fix it before saving.");
      return;
    }
    setJsonError(null);
    createBlock({ variables: { lessonId, order: nextOrder, type, data: parsed } }).then(() => {
      setOpen(false);
      onCreated();
    });
  }

  return (
    <VStack align="stretch" gap="2" borderWidth="1px" borderColor="border" rounded="l2" p="3">
      <Field.Root maxW="48">
        <Field.Label fontSize="xs">Type</Field.Label>
        <Input size="sm" value={type} onChange={(e) => setType(e.target.value)} />
      </Field.Root>
      <Field.Root>
        <Field.Label fontSize="xs">Data (JSON)</Field.Label>
        <Textarea
          fontFamily="mono"
          fontSize="xs"
          rows={6}
          value={dataText}
          onChange={(e) => setDataText(e.target.value)}
        />
      </Field.Root>
      {jsonError && (
        <Alert.Root status="error" size="sm">
          <Alert.Indicator />
          <Alert.Description>{jsonError}</Alert.Description>
        </Alert.Root>
      )}
      <HStack>
        <Button size="sm" colorPalette="quantum" onClick={handleCreate} loading={loading}>
          Create block
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </HStack>
    </VStack>
  );
}

export default function LessonEditorPage() {
  const { lessonId } = useParams();
  const { data, loading, refetch } = useAdminLessonQuery({ variables: { id: lessonId ?? "" }, skip: !lessonId });
  const { data: tracksData } = useAdminTracksQuery();
  const [deleteLesson, { loading: deletingLesson }] = useDeleteLessonMutation();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (lessonId) refetch({ id: lessonId });
  }, [lessonId, refetch]);

  if (loading) return <Spinner />;

  const lesson = data?.adminLesson;
  if (!lesson) return <Text>Lesson not found.</Text>;

  const allLessons = (tracksData?.tracks ?? []).flatMap((t) => t.lessons);
  const sortedBlocks = [...lesson.contentBlocks].sort((a, b) => a.order - b.order);
  const nextOrder = sortedBlocks.length > 0 ? Math.max(...sortedBlocks.map((b) => b.order)) + 100 : 100;

  return (
    <VStack align="stretch" gap="6">
      <HStack justify="space-between">
        <Heading size="md">{lesson.title}</Heading>
        <Dialog.Root open={confirmDeleteOpen} onOpenChange={(d) => setConfirmDeleteOpen(d.open)} role="alertdialog">
          <Dialog.Trigger asChild>
            <Button size="sm" variant="outline" colorPalette="red">
              Delete lesson
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete "{lesson.title}"?</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Text color="fg.muted">
                    This deletes the lesson and all its content blocks permanently. This can't be undone.
                  </Text>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="ghost">Cancel</Button>
                  </Dialog.ActionTrigger>
                  <Button
                    colorPalette="red"
                    loading={deletingLesson}
                    onClick={() => deleteLesson({ variables: { id: lesson.id } }).then(() => history.back())}
                  >
                    Delete
                  </Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </HStack>

      <LessonMetadataForm lesson={lesson} allLessons={allLessons} onSaved={() => refetch()} />

      <Box borderWidth="1px" borderColor="border" rounded="l3" p="4">
        <TagPicker lessonId={lesson.id} currentTagIds={lesson.tags.map((t) => t.id)} />
      </Box>

      <Separator />

      <Box>
        <Heading size="sm" mb="3">
          Content blocks
        </Heading>
        <VStack align="stretch" gap="3">
          {sortedBlocks.map((block) => (
            <ContentBlockRow key={block.id} block={block} onSaved={() => refetch()} />
          ))}
          <NewBlockRow lessonId={lesson.id} nextOrder={nextOrder} onCreated={() => refetch()} />
        </VStack>
      </Box>
    </VStack>
  );
}
