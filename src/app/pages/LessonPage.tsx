import { Box, Button, HStack, Skeleton } from "@chakra-ui/react";
import { Suspense, lazy, useEffect, useMemo, useRef } from "react";
import { LuArrowRight } from "react-icons/lu";
import { Link, Navigate, useParams } from "react-router";
import { getLesson, getNextLesson, loadLessonContent } from "../../content";
import { LessonLayout } from "../../components/lesson/LessonLayout";
import { LessonProvider } from "../../components/lesson/LessonContext";
import { mdxComponents } from "../../components/lesson/mdxComponents";
import { useProgressStore } from "../../store/progressStore";

export function LessonPage() {
  const { lessonId = "" } = useParams();
  const lesson = getLesson(lessonId);
  const setStatus = useProgressStore((s) => s.setStatus);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const LessonContent = useMemo(() => lazy(() => loadLessonContent(lessonId)), [lessonId]);

  useEffect(() => {
    if (!lesson) return;
    setStatus(lesson.id, "in-progress");
  }, [lesson, setStatus]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!lesson || !sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setStatus(lesson.id, "completed");
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [lesson, setStatus]);

  if (!lesson) {
    return <Navigate to="/" replace />;
  }

  const next = getNextLesson(lesson.id);

  return (
    <Box py={{ base: "6", md: "10" }}>
      <LessonProvider value={{ lessonId: lesson.id }}>
        <LessonLayout lesson={lesson}>
          <Suspense fallback={<Skeleton h="50vh" rounded="l3" />}>
            <LessonContent components={mdxComponents} />
          </Suspense>

          <Box ref={sentinelRef} h="1px" />

          <HStack justify="flex-end" mt="12" pt="6" borderTopWidth="1px" borderColor="border">
            <Button asChild colorPalette="quantum" size="lg">
              <Link to={next ? `/lesson/${next.id}` : "/"}>
                {next ? `Next: ${next.title}` : "Back to all lessons"}
                <LuArrowRight />
              </Link>
            </Button>
          </HStack>
        </LessonLayout>
      </LessonProvider>
    </Box>
  );
}
