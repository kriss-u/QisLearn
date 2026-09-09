import { Box, Button, Field, HStack, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  useAdminCourseTracksQuery,
  useAdminCoursesQuery,
  useCreateLessonMutation,
  useCreateTrackMutation,
  useUpdateLessonMutation,
  useUpdateTrackMutation,
  type AdminCourseTracksQuery,
} from "@qislearn/graphql-schema";
import { AdminLoading } from "./AdminLoading";
import { DragHandle } from "./DragHandle";
import { spacedOrders, useDragReorder } from "./useDragReorder";

type Track = AdminCourseTracksQuery["tracks"][number];
type Lesson = Track["lessons"][number];

function NewTrackForm({ nextOrder, onCreated }: { nextOrder: number; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [createTrack, { loading }] = useCreateTrackMutation();

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Add track
      </Button>
    );
  }

  async function handleSubmit() {
    await createTrack({ variables: { slug, title, order: nextOrder } });
    setOpen(false);
    setSlug("");
    setTitle("");
    onCreated();
  }

  return (
    <VStack align="stretch" gap="2" borderWidth="1px" borderColor="border" rounded="l2" p="3" maxW="sm">
      <Field.Root>
        <Field.Label fontSize="xs">Title</Field.Label>
        <Input size="sm" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field.Root>
      <Field.Root>
        <Field.Label fontSize="xs">Slug</Field.Label>
        <Input size="sm" fontFamily="mono" value={slug} onChange={(e) => setSlug(e.target.value)} />
      </Field.Root>
      <Text fontSize="xs" color="fg.muted">
        Tracks are shared across courses — new ones are added to the end (drag to reorder afterward).
      </Text>
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

function NewLessonForm({
  courseId,
  trackId,
  nextOrder,
  onCreated,
}: {
  courseId: string;
  trackId: string;
  nextOrder: number;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
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
        courseId,
        trackId,
        slug,
        title,
        summary: "",
        layout: "standard",
        difficulty: "BEGINNER",
        order: nextOrder,
        estimatedMinutes: 10,
      },
    });
    setOpen(false);
    setSlug("");
    setTitle("");
    onCreated();
  }

  return (
    <VStack align="stretch" gap="2" borderWidth="1px" borderColor="border" rounded="l2" p="3">
      <HStack>
        <Field.Root>
          <Field.Label fontSize="xs">Title</Field.Label>
          <Input size="sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="xs">Slug</Field.Label>
          <Input size="sm" fontFamily="mono" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field.Root>
      </HStack>
      <Text fontSize="xs" color="fg.muted">
        Added to the end of the track (drag to reorder afterward). Summary, layout, difficulty, and everything else
        can be filled in on the lesson's editor page after creating it.
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

function LessonRow({
  lesson,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  lesson: Lesson;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  return (
    <HStack
      ref={rowRef}
      justify="space-between"
      px="3"
      py="2"
      rounded="l2"
      borderWidth="1px"
      borderColor="border"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <HStack gap="3">
        <DragHandle onDragStart={onDragStart} onDragEnd={onDragEnd} rowRef={rowRef} />
        <Text fontSize="sm">{lesson.title}</Text>
        <Text fontSize="xs" color="fg.muted">
          {lesson.difficulty.toLowerCase()}
        </Text>
      </HStack>
      <Link to={`/admin/lessons/${lesson.id}`}>
        <Text fontSize="sm" textDecoration="underline">
          Edit
        </Text>
      </Link>
    </HStack>
  );
}

function TrackSection({
  courseId,
  track,
  onDragStart,
  onDragEnd,
  onDrop,
  onChanged,
}: {
  courseId: string;
  track: Track;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onChanged: () => void;
}) {
  const [updateLesson] = useUpdateLessonMutation();
  const headingRef = useRef<HTMLDivElement>(null);

  const lessonReorder = useDragReorder(
    track.lessons,
    (l) => l.id,
    (orderedIds) => {
      const newOrders = spacedOrders(orderedIds.length);
      const updates = orderedIds
        .map((id, i) => ({ id, order: newOrders[i]! }))
        .filter(({ id, order }) => track.lessons.find((l) => l.id === id)?.order !== order);
      return Promise.all(updates.map(({ id, order }) => updateLesson({ variables: { id, order } }))).then(() =>
        onChanged(),
      );
    },
  );

  const nextLessonOrder = track.lessons.length > 0 ? Math.max(...track.lessons.map((l) => l.order)) + 100 : 100;

  return (
    <Box ref={headingRef} onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <HStack mb="3">
        <DragHandle onDragStart={onDragStart} onDragEnd={onDragEnd} rowRef={headingRef} />
        <Heading size="md">{track.title}</Heading>
      </HStack>
      <VStack align="stretch" gap="1" mb="3">
        {lessonReorder.displayItems.map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            onDragStart={() => lessonReorder.startDrag(lesson.id)}
            onDragEnd={lessonReorder.endDrag}
            onDrop={() => lessonReorder.onDropTarget(lesson.id)}
          />
        ))}
      </VStack>
      <NewLessonForm courseId={courseId} trackId={track.id} nextOrder={nextLessonOrder} onCreated={onChanged} />
    </Box>
  );
}

export default function CourseDetailPage() {
  const { courseSlug } = useParams();
  const { data: coursesData, loading: coursesLoading } = useAdminCoursesQuery();
  const course = coursesData?.courses.find((c) => c.slug === courseSlug);

  const { data, loading, refetch } = useAdminCourseTracksQuery({
    variables: { courseId: course?.id ?? "" },
    skip: !course,
  });
  const [updateTrack] = useUpdateTrackMutation();

  const tracks = data?.tracks ?? [];

  const trackReorder = useDragReorder(
    tracks,
    (t) => t.id,
    (orderedIds) => {
      const newOrders = spacedOrders(orderedIds.length);
      const updates = orderedIds
        .map((id, i) => ({ id, order: newOrders[i]! }))
        .filter(({ id, order }) => tracks.find((t) => t.id === id)?.order !== order);
      return Promise.all(updates.map(({ id, order }) => updateTrack({ variables: { id, order } }))).then(() =>
        refetch(),
      );
    },
  );

  if (coursesLoading || loading) return <AdminLoading label="Loading course…" />;
  if (!course) return <Text>Course not found.</Text>;

  const nextTrackOrder = tracks.length > 0 ? Math.max(...tracks.map((t) => t.order)) + 100 : 100;

  return (
    <VStack align="stretch" gap="8">
      <HStack justify="space-between">
        <Heading size="lg">{course.title}</Heading>
        <Link to="/admin">
          <Text fontSize="sm" textDecoration="underline">
            All courses
          </Text>
        </Link>
      </HStack>

      {trackReorder.displayItems.map((track) => (
        <TrackSection
          key={track.id}
          courseId={course.id}
          track={track}
          onDragStart={() => trackReorder.startDrag(track.id)}
          onDragEnd={trackReorder.endDrag}
          onDrop={() => trackReorder.onDropTarget(track.id)}
          onChanged={() => refetch()}
        />
      ))}

      <NewTrackForm nextOrder={nextTrackOrder} onCreated={() => refetch()} />
    </VStack>
  );
}
