import {
  Alert,
  Badge,
  Box,
  Button,
  CloseButton,
  Collapsible,
  Dialog,
  Field,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  NativeSelect,
  Portal,
  Separator,
  Text,
  Textarea,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { LuChevronDown, LuTrash2 } from "react-icons/lu";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useParams } from "react-router";
import {
  type LessonDifficulty,
  useAdminBlockTypesQuery,
  useAdminLessonLayoutsQuery,
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
  type AdminBlockTypesQuery,
} from "@qislearn/graphql-schema";
import type { ContentBlockData } from "../../../content";
import type { LessonFrontmatter } from "../../../content/schema";
import { DynamicBlockForm } from "./blockEditors/DynamicBlockForm";
import { AdminLoading } from "./AdminLoading";
import { DragHandle } from "./DragHandle";
import { LessonPreviewDialog } from "./LessonPreviewDialog";
import { spacedOrders, useDragReorder } from "./useDragReorder";

type BlockTypeSpec = AdminBlockTypesQuery["adminBlockTypes"][number];

// Owns title/summary (main column, natural document flow) plus every other
// lesson-settings field (sidebar) under one save action, since they're all
// part of the same updateLesson/updateLessonPrerequisites mutations. Content
// blocks render as `children` inside the main column so the page reads as
// one document — title, summary, blocks — with settings alongside it rather
// than interleaved as another "field" to fill in.
export interface LessonMetaDraft {
  title: string;
  summary: string;
  layout: string;
  difficulty: LessonDifficulty;
  estimatedMinutes: number;
}

function LessonMetaEditor({
  lesson,
  allLessons,
  onSaved,
  onDraftChange,
  actions,
  children,
}: {
  lesson: NonNullable<
    NonNullable<ReturnType<typeof useAdminLessonQuery>["data"]>["adminLesson"]
  >;
  allLessons: Array<{ id: string; slug: string; title: string }>;
  onSaved: () => void;
  onDraftChange: (draft: LessonMetaDraft) => void;
  /** Preview/delete triggers — rendered alongside the Save button at the top of the sidebar. */
  actions: ReactNode;
  children: ReactNode;
}) {
  const { data: layoutsData } = useAdminLessonLayoutsQuery();
  const layouts = layoutsData?.adminLessonLayouts ?? [];
  const [title, setTitle] = useState(lesson.title);
  const [summary, setSummary] = useState(lesson.summary);
  const [layout, setLayout] = useState(lesson.layout);
  const [difficulty, setDifficulty] = useState<LessonDifficulty>(
    lesson.difficulty,
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    lesson.estimatedMinutes,
  );
  const [prerequisiteIds, setPrerequisiteIds] = useState(
    lesson.prerequisites.map((p) => p.id),
  );

  const onDraftChangeRef = useRef(onDraftChange);
  useEffect(() => {
    onDraftChangeRef.current = onDraftChange;
  });
  useEffect(() => {
    onDraftChangeRef.current({
      title,
      summary,
      layout,
      difficulty,
      estimatedMinutes,
    });
  }, [title, summary, layout, difficulty, estimatedMinutes]);

  const [updateLesson, { loading: savingLesson }] = useUpdateLessonMutation();
  const [updatePrerequisites, { loading: savingPrereqs }] =
    useUpdateLessonPrerequisitesMutation();

  async function handleSave() {
    // `order` isn't edited here — a lesson's position within its track is
    // set by dragging it in the admin content list (AdminHome.tsx).
    await updateLesson({
      variables: {
        id: lesson.id,
        title,
        summary,
        layout,
        difficulty,
        estimatedMinutes,
      },
    });
    await updatePrerequisites({
      variables: {
        lessonId: lesson.id,
        prerequisiteLessonIds: prerequisiteIds,
      },
    });
    onSaved();
  }

  return (
    <Flex gap="6" align="start" direction={{ base: "column", lg: "row" }}>
      <Box flex="1" minW="0">
        <VStack align="stretch" gap="2" mb="6">
          <Input
            variant="flushed"
            fontSize="xl"
            fontWeight="semibold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
          />
          <Textarea
            variant="flushed"
            color="fg.muted"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="One or two sentences describing this lesson"
          />
        </VStack>
        {children}
      </Box>

      <VStack
        as="aside"
        align="stretch"
        gap="4"
        // Scales with the available width instead of a fixed px so the
        // panel doesn't stay pinned to a phone-sized column now that the
        // admin shell is full-bleed on wide screens, capped so it doesn't
        // sprawl on ultrawide monitors either.
        w={{ base: "full", lg: "clamp(280px, 22vw, 420px)" }}
        flexShrink={0}
        position={{ lg: "sticky" }}
        // Matches the app header (h="16" = 4rem) plus the admin shell's
        // top padding (py="10" at md+ = 2.5rem) so the panel's sticky
        // offset lines up with where it already sits in normal flow —
        // no catch-up scroll needed before it "locks" in place. maxH is
        // sized off that same offset so it scrolls internally instead of
        // ever pushing past the bottom of the viewport.
        top={{ lg: "6.5rem" }}
        maxH={{ lg: "calc(100dvh - 6.5rem - 1rem)" }}
        overflowY={{ lg: "auto" }}
        borderWidth="1px"
        borderColor="border"
        rounded="l3"
        p="4"
      >
        <HStack wrap="wrap">
          {actions}
          <Button
            size="sm"
            colorPalette="quantum"
            onClick={handleSave}
            loading={savingLesson || savingPrereqs}
          >
            Save
          </Button>
        </HStack>
        <Separator />

        <Field.Root>
          <Field.Label fontSize="xs">Layout</Field.Label>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
            >
              {layouts.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="xs">Difficulty</Field.Label>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as LessonDifficulty)
              }
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root maxW="32">
          <Field.Label fontSize="xs">Minutes</Field.Label>
          <Input
            size="sm"
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label fontSize="xs">Prerequisites</Field.Label>
          <Wrap gap="1.5">
            {allLessons
              .filter((l) => l.id !== lesson.id)
              .map((l) => {
                const checked = prerequisiteIds.includes(l.id);
                return (
                  <Badge
                    key={l.id}
                    as="button"
                    size="sm"
                    cursor="pointer"
                    variant={checked ? "solid" : "outline"}
                    colorPalette={checked ? "quantum" : "gray"}
                    onClick={() =>
                      setPrerequisiteIds((prev) =>
                        checked
                          ? prev.filter((id) => id !== l.id)
                          : [...prev, l.id],
                      )
                    }
                  >
                    {l.title}
                  </Badge>
                );
              })}
          </Wrap>
        </Field.Root>

        <Separator />

        <TagPicker
          lessonId={lesson.id}
          currentTagIds={lesson.tags.map((t) => t.id)}
        />
      </VStack>
    </Flex>
  );
}

function TagPicker({
  lessonId,
  currentTagIds,
}: {
  lessonId: string;
  currentTagIds: string[];
}) {
  const { data, refetch: refetchTags } = useAdminTagsQuery();
  const [newTag, setNewTag] = useState("");
  const [createTag] = useCreateTagMutation();
  const [updateLessonTags] = useUpdateLessonTagsMutation();
  const [selected, setSelected] = useState(currentTagIds);

  const tags = data?.adminTags ?? [];

  async function toggle(tagId: string) {
    const next = selected.includes(tagId)
      ? selected.filter((id) => id !== tagId)
      : [...selected, tagId];
    setSelected(next);
    await updateLessonTags({ variables: { lessonId, tagIds: next } });
  }

  async function handleAddTag() {
    if (!newTag.trim()) return;
    const slug = newTag.trim().toLowerCase().replace(/\s+/g, "-");
    const { data: created } = await createTag({
      variables: { slug, label: newTag.trim() },
    });
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
        <Input
          size="sm"
          placeholder="New tag label"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
        />
        <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
          Add tag
        </Button>
      </HStack>
    </VStack>
  );
}

// A one-line hint for the collapsed header — whichever text-ish field a
// block actually has, truncated. Falls back to the type name alone.
function summarizeBlockData(data: Record<string, unknown>): string | null {
  const candidate =
    data.title ?? data.text ?? data.question ?? data.prompt ?? data.description;
  if (typeof candidate !== "string" || !candidate.trim()) return null;
  const oneLine = candidate.trim().replace(/\s+/g, " ");
  return oneLine.length > 80 ? `${oneLine.slice(0, 80)}…` : oneLine;
}

interface BlockRowProps {
  block: {
    id: string;
    order: number;
    type: string;
    data: Record<string, unknown>;
  };
  blockTypes: BlockTypeSpec[];
  onSaved: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  /** Reports every in-progress edit (not just saved ones) so the "Preview lesson" dialog can reflect it. */
  onDraftChange: (patch: {
    type: string;
    data: Record<string, unknown>;
  }) => void;
  /** Bumped by the "Expand all"/"Collapse all" toggle to force this row's open state. */
  expandSignal: { open: boolean; token: number } | null;
}

function ContentBlockRow({
  block,
  blockTypes,
  onSaved,
  onDragStart,
  onDragEnd,
  onDrop,
  onDraftChange,
  expandSignal,
}: BlockRowProps) {
  const [type, setType] = useState(block.type);
  const [data, setData] = useState<Record<string, unknown>>(block.data);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [updateBlock, { loading: saving }] = useUpdateContentBlockMutation();
  const [deleteBlock, { loading: deleting }] = useDeleteContentBlockMutation();
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expandSignal) setOpen(expandSignal.open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandSignal?.token]);

  // Kept in a ref (rather than a useEffect dependency) since onDraftChange
  // is a fresh closure from the parent every render — only the actual edit
  // (type/data) should trigger a re-report, not a parent re-render.
  const onDraftChangeRef = useRef(onDraftChange);
  useEffect(() => {
    onDraftChangeRef.current = onDraftChange;
  });
  useEffect(() => {
    onDraftChangeRef.current({ type, data });
  }, [type, data]);

  const spec = blockTypes.find((t) => t.type === type);

  function handleSave() {
    setSaveError(null);
    updateBlock({ variables: { id: block.id, type, data } })
      .then(() => onSaved())
      .catch((err) =>
        setSaveError(
          err instanceof Error ? err.message : "Failed to save block.",
        ),
      );
  }

  const summary = summarizeBlockData(data);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={(d) => setOpen(d.open)}
      ref={rowRef}
      borderWidth="1px"
      borderColor="border"
      rounded="l2"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <HStack
        px="3"
        py="2"
        gap="2"
        roundedTop="l2"
        bg={open ? "colorPalette.subtle" : undefined}
        colorPalette={open ? "quantum" : undefined}
      >
        <DragHandle
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          rowRef={rowRef}
        />
        <NativeSelect.Root size="sm" maxW="44" flexShrink={0}>
          <NativeSelect.Field
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {blockTypes.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        {summary && !open && (
          <Text
            fontSize="xs"
            color="fg.muted"
            flex="1"
            minW="0"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
          >
            {summary}
          </Text>
        )}
        <Box flex="1" />
        <Collapsible.Trigger asChild>
          <IconButton
            aria-label={open ? "Collapse block" : "Expand block"}
            size="sm"
            variant="ghost"
          >
            <Box
              transform={open ? "rotate(180deg)" : undefined}
              transition="transform 0.15s ease"
            >
              <LuChevronDown />
            </Box>
          </IconButton>
        </Collapsible.Trigger>
      </HStack>

      <Collapsible.Content>
        <VStack
          align="stretch"
          gap="2"
          px="3"
          pb="3"
          pt="1"
          borderTopWidth="1px"
          borderColor="border"
        >
          {spec ? (
            <DynamicBlockForm
              fields={spec.fields}
              data={data}
              onChange={setData}
            />
          ) : (
            <Text fontSize="xs" color="fg.muted">
              Unknown block type "{type}" — no editor form registered for it.
            </Text>
          )}
          {saveError && (
            <Alert.Root status="error" size="sm">
              <Alert.Indicator />
              <Alert.Description>{saveError}</Alert.Description>
            </Alert.Root>
          )}
          <HStack>
            <Button
              size="sm"
              colorPalette="quantum"
              onClick={handleSave}
              loading={saving}
            >
              Save block
            </Button>
            <Dialog.Root
              open={confirmOpen}
              onOpenChange={(d) => setConfirmOpen(d.open)}
              role="alertdialog"
            >
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
                      <Text color="fg.muted">
                        This removes it from the live lesson immediately. This
                        can't be undone.
                      </Text>
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="ghost">Cancel</Button>
                      </Dialog.ActionTrigger>
                      <Button
                        colorPalette="red"
                        loading={deleting}
                        onClick={() =>
                          deleteBlock({ variables: { id: block.id } }).then(
                            () => onSaved(),
                          )
                        }
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
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function defaultDataFor(
  spec: BlockTypeSpec | undefined,
): Record<string, unknown> {
  if (!spec) return {};
  const data: Record<string, unknown> = {};
  for (const field of spec.fields) {
    switch (field.kind) {
      case "STRING":
      case "LONG_TEXT":
      case "MARKDOWN":
        data[field.name] = "";
        break;
      case "NUMBER":
        data[field.name] = undefined;
        break;
      case "BOOLEAN":
        data[field.name] = false;
        break;
      case "STRING_ARRAY":
      case "NUMBER_ARRAY":
      case "QUIZ_CHOICES":
      case "VISUALIZATION_VIEWS":
      case "MATRIX_PRESETS":
        data[field.name] = [];
        break;
      case "CIRCUIT":
        data[field.name] = { numQubits: 1, gates: [] };
        break;
    }
  }
  return data;
}

function NewBlockRow({
  lessonId,
  nextOrder,
  blockTypes,
  onCreated,
  onDraftChange,
}: {
  lessonId: string;
  nextOrder: number;
  blockTypes: BlockTypeSpec[];
  onCreated: () => void;
  /** null while the "add block" form is closed — nothing to preview yet. */
  onDraftChange: (
    patch: { type: string; data: Record<string, unknown> } | null,
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(blockTypes[0]?.type ?? "markdown");
  const [data, setData] = useState<Record<string, unknown>>(() =>
    defaultDataFor(blockTypes[0]),
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createBlock, { loading }] = useCreateContentBlockMutation();

  const onDraftChangeRef = useRef(onDraftChange);
  useEffect(() => {
    onDraftChangeRef.current = onDraftChange;
  });
  useEffect(() => {
    onDraftChangeRef.current(open ? { type, data } : null);
  }, [open, type, data]);

  const spec = blockTypes.find((t) => t.type === type);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Add block
      </Button>
    );
  }

  function handleTypeChange(nextType: string) {
    setType(nextType);
    setData(defaultDataFor(blockTypes.find((t) => t.type === nextType)));
  }

  function handleCreate() {
    setSaveError(null);
    createBlock({ variables: { lessonId, order: nextOrder, type, data } })
      .then(() => {
        setOpen(false);
        onCreated();
      })
      .catch((err) =>
        setSaveError(
          err instanceof Error ? err.message : "Failed to create block.",
        ),
      );
  }

  return (
    <VStack
      align="stretch"
      gap="2"
      borderWidth="1px"
      borderColor="border"
      rounded="l2"
      p="3"
    >
      <Field.Root maxW="56">
        <Field.Label fontSize="xs">Type</Field.Label>
        <NativeSelect.Root size="sm">
          <NativeSelect.Field
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {blockTypes.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
      {spec && (
        <DynamicBlockForm fields={spec.fields} data={data} onChange={setData} />
      )}
      {saveError && (
        <Alert.Root status="error" size="sm">
          <Alert.Indicator />
          <Alert.Description>{saveError}</Alert.Description>
        </Alert.Root>
      )}
      <HStack>
        <Button
          size="sm"
          colorPalette="quantum"
          onClick={handleCreate}
          loading={loading}
        >
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
  const { data, loading, refetch } = useAdminLessonQuery({
    variables: { id: lessonId ?? "" },
    skip: !lessonId,
  });
  const { data: tracksData } = useAdminTracksQuery();
  const { data: blockTypesData } = useAdminBlockTypesQuery();
  const blockTypes = blockTypesData?.adminBlockTypes ?? [];
  const [deleteLesson, { loading: deletingLesson }] = useDeleteLessonMutation();
  const [updateBlockOrder] = useUpdateContentBlockMutation();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [expandSignal, setExpandSignal] = useState<{
    open: boolean;
    token: number;
  } | null>(null);
  const [metaDraft, setMetaDraft] = useState<LessonMetaDraft | null>(null);
  const [blockDrafts, setBlockDrafts] = useState<
    Record<string, { type: string; data: Record<string, unknown> }>
  >({});
  const [newBlockDraft, setNewBlockDraft] = useState<{
    type: string;
    data: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    if (lessonId) refetch({ id: lessonId });
  }, [lessonId, refetch]);

  const lesson = data?.adminLesson;
  const sortedBlocks = lesson
    ? [...lesson.contentBlocks].sort((a, b) => a.order - b.order)
    : [];

  // Hooks must run unconditionally on every render, so this is declared
  // before the loading/not-found early returns below even though its
  // result is only meaningful once `lesson` exists.
  const blockReorder = useDragReorder(
    sortedBlocks,
    (b) => b.id,
    (orderedIds) => {
      const newOrders = spacedOrders(orderedIds.length);
      const updates = orderedIds
        .map((id, i) => ({ id, order: newOrders[i]! }))
        .filter(
          ({ id, order }) =>
            sortedBlocks.find((b) => b.id === id)?.order !== order,
        );
      return Promise.all(
        updates.map(({ id, order }) =>
          updateBlockOrder({ variables: { id, order } }),
        ),
      ).then(() => refetch());
    },
  );

  if (loading) return <AdminLoading label="Loading lesson…" />;
  if (!lesson) return <Text>Lesson not found.</Text>;

  const allLessons = (tracksData?.tracks ?? []).flatMap((t) => t.lessons);
  const nextOrder =
    sortedBlocks.length > 0
      ? Math.max(...sortedBlocks.map((b) => b.order)) + 100
      : 100;

  // The preview reflects whatever's currently in the editor, not just what's
  // saved: each row/field reports its live value via onDraftChange, and this
  // just overlays those reports onto the last-fetched lesson. displayItems
  // (not sortedBlocks) so a not-yet-persisted drag reorder shows up too.
  const previewFrontmatter = {
    id: lesson.id,
    track: lesson.track.slug,
    order: lesson.order,
    title: metaDraft?.title ?? lesson.title,
    summary: metaDraft?.summary ?? lesson.summary,
    layout: (metaDraft?.layout ?? lesson.layout) as LessonFrontmatter["layout"],
    prerequisites: lesson.prerequisites.map((p) => p.id),
    estimatedMinutes: metaDraft?.estimatedMinutes ?? lesson.estimatedMinutes,
  };
  const previewBlocks: ContentBlockData[] = blockReorder.displayItems.map(
    (block) => ({
      id: block.id,
      order: block.order,
      type: blockDrafts[block.id]?.type ?? block.type,
      data: blockDrafts[block.id]?.data ?? block.data,
    }),
  );
  if (newBlockDraft) {
    previewBlocks.push({ id: "__new__", order: nextOrder, ...newBlockDraft });
  }

  // Rendered inside the sidebar (LessonMetaEditor's `actions` prop),
  // alongside its own Save button, so all three lesson-level actions sit
  // together — save owns lesson-meta state so it stays local to that
  // component, these two don't so they're built here instead.
  const actions = (
    <>
      <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>
        Preview
      </Button>
      <Dialog.Root
        open={confirmDeleteOpen}
        onOpenChange={(d) => setConfirmDeleteOpen(d.open)}
        role="alertdialog"
      >
        <Dialog.Trigger asChild>
          <IconButton
            aria-label="Delete lesson"
            size="sm"
            variant="outline"
            colorPalette="red"
          >
            <LuTrash2 />
          </IconButton>
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
                  This deletes the lesson and all its content blocks
                  permanently. This can't be undone.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="ghost">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  loading={deletingLesson}
                  onClick={() =>
                    deleteLesson({ variables: { id: lesson.id } }).then(() =>
                      history.back(),
                    )
                  }
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
    </>
  );

  return (
    <VStack align="stretch" gap="6">
      <LessonMetaEditor
        lesson={lesson}
        allLessons={allLessons}
        onSaved={() => refetch()}
        onDraftChange={setMetaDraft}
        actions={actions}
      >
        <Separator mb="5" />
        <HStack justify="space-between" mb="3">
          <Heading size="sm">Content blocks</Heading>
          <Button
            size="xs"
            variant="ghost"
            onClick={() =>
              setExpandSignal((prev) => ({
                open: !(prev?.open ?? false),
                token: (prev?.token ?? 0) + 1,
              }))
            }
          >
            {expandSignal?.open ? "Collapse all" : "Expand all"}
          </Button>
        </HStack>
        <VStack align="stretch" gap="3">
          {blockReorder.displayItems.map((block) => (
            <ContentBlockRow
              key={block.id}
              block={block}
              blockTypes={blockTypes}
              onSaved={() => refetch()}
              onDragStart={() => blockReorder.startDrag(block.id)}
              onDragEnd={blockReorder.endDrag}
              onDrop={() => blockReorder.onDropTarget(block.id)}
              onDraftChange={(patch) =>
                setBlockDrafts((prev) => ({ ...prev, [block.id]: patch }))
              }
              expandSignal={expandSignal}
            />
          ))}
          <NewBlockRow
            lessonId={lesson.id}
            nextOrder={nextOrder}
            blockTypes={blockTypes}
            onCreated={() => refetch()}
            onDraftChange={setNewBlockDraft}
          />
        </VStack>
      </LessonMetaEditor>

      <LessonPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        frontmatter={previewFrontmatter}
        blocks={previewBlocks}
      />
    </VStack>
  );
}
