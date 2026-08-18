import { Box, Button, CloseButton, Container, Dialog, HStack, Portal, Skeleton, Text } from "@chakra-ui/react";
import { Suspense, lazy, useMemo, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { Navigate, useNavigate, useParams, type MetaFunction } from "react-router";
import { getLesson, getNextLesson, loadLessonContent } from "../../content";
import type { LessonFrontmatter } from "../../content/schema";
import { LessonLayout, getLessonMaxWidth } from "../../components/lesson/LessonLayout";
import { LessonProvider } from "../../components/lesson/LessonContext";
import { PrerequisitesList } from "../../components/lesson/PrerequisitesList";
import { LessonProgressProvider, useLessonProgress } from "../../components/lesson/LessonProgressContext";
import { mdxComponents } from "../../components/lesson/mdxComponents";
import { useProgressStore } from "../../store/progressStore";
import { SITE_URL, buildPageMeta } from "../../lib/seo";

export const meta: MetaFunction = ({ params }) => {
  const lesson = getLesson(params.lessonId ?? "");
  if (!lesson) return buildPageMeta({ title: "QisLearn", description: "QisLearn lesson.", path: "/" });

  const path = `/lesson/${lesson.id}`;
  const title = `${lesson.title} — QisLearn`;
  return buildPageMeta({
    title,
    description: lesson.summary,
    path,
    ldJson: {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: lesson.title,
      description: lesson.summary,
      url: `${SITE_URL}${path}`,
      isPartOf: { "@type": "Course", name: "QisLearn", url: SITE_URL },
      learningResourceType: "Lesson",
      timeRequired: `PT${lesson.estimatedMinutes}M`,
      educationalLevel: lesson.track,
    },
  });
};

function LessonNextAction({ lessonId, next }: { lessonId: string; next: LessonFrontmatter | undefined }) {
  const navigate = useNavigate();
  const setStatus = useProgressStore((s) => s.setStatus);
  const { allExercisesCorrect, contentReady } = useLessonProgress();
  const [warnOpen, setWarnOpen] = useState(false);

  const destination = next ? `/lesson/${next.id}` : "/";
  const label = next ? `Next: ${next.title}` : "Back to all lessons";

  function proceed(completed: boolean) {
    setStatus(lessonId, completed ? "completed" : "in-progress");
    setWarnOpen(false);
    navigate(destination);
  }

  function handleClick() {
    if (allExercisesCorrect) {
      proceed(true);
      return;
    }
    setWarnOpen(true);
  }

  return (
    <>
      <Button
        colorPalette="quantum"
        size="lg"
        disabled={!contentReady}
        onClick={handleClick}
        w={{ base: "full", sm: "auto" }}
        minW="0"
      >
        <Text as="span" truncate minW="0">
          {label}
        </Text>
        <LuArrowRight />
      </Button>

      <Dialog.Root open={warnOpen} onOpenChange={(d) => setWarnOpen(d.open)} placement="center" role="alertdialog">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content rounded="l3">
              <Dialog.Header>
                <Dialog.Title>Exercises incomplete</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text color="fg.muted">
                  You haven't correctly completed all the exercises in this lesson yet. If you continue
                  now, it'll stay marked as in progress instead of done. Continue anyway?
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="ghost">Stay and finish up</Button>
                </Dialog.ActionTrigger>
                <Button colorPalette="quantum" onClick={() => proceed(false)}>
                  Continue anyway
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
}

export default function LessonPage() {
  const { lessonId = "" } = useParams();
  const lesson = getLesson(lessonId);

  const LessonContent = useMemo(() => lazy(() => loadLessonContent(lessonId)), [lessonId]);

  if (!lesson) {
    return <Navigate to="/" replace />;
  }

  const next = getNextLesson(lesson.id);

  return (
    <Box py={{ base: "6", md: "10" }}>
      <LessonProvider value={{ lessonId: lesson.id }}>
        <LessonProgressProvider lessonId={lesson.id}>
          <LessonLayout lesson={lesson}>
            <PrerequisitesList prerequisiteIds={lesson.prerequisites} />
            <Suspense key={lesson.id} fallback={<Skeleton h="50vh" rounded="l3" />}>
              <LessonContent components={mdxComponents} />
            </Suspense>
          </LessonLayout>

          <Container className="no-print" maxW={getLessonMaxWidth(lesson.layout)} px="0">
            <HStack justify="flex-end" mt="12" pt="6" borderTopWidth="1px" borderColor="border">
              <LessonNextAction lessonId={lesson.id} next={next} />
            </HStack>
          </Container>
        </LessonProgressProvider>
      </LessonProvider>
    </Box>
  );
}
