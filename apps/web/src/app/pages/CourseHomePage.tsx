import { Container, Heading } from "@chakra-ui/react";
import { redirect, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { getCourseGroup, GraphQLRequestError } from "../../content";
import { CourseTrackGrid } from "../../components/lesson/CourseTrackGrid";
import { SITE_URL, buildPageMeta } from "../../lib/seo";

// Reached from HomePage's picker when a viewer has more than one course.
// No hardcoded subject-matter copy here — the course's own title/tracks/
// lessons are the entire content, same as HomePage's single-course case
// (both render via CourseTrackGrid).
export async function loader({ params, request }: LoaderFunctionArgs) {
  const courseSlug = params.courseSlug ?? "";
  const cookie = request.headers.get("cookie") ?? undefined;
  try {
    const course = await getCourseGroup(courseSlug, cookie);
    if (!course) throw redirect("/courses");
    return { course };
  } catch (err) {
    if (err instanceof GraphQLRequestError) {
      if (err.code === "UNAUTHENTICATED") throw redirect(`/login?redirect=/course/${courseSlug}`);
      if (err.code === "FORBIDDEN") throw redirect("/courses");
    }
    throw err;
  }
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
  const course = loaderData?.course;
  if (!course) return buildPageMeta({ title: "QisLearn", description: "QisLearn.", path: "/" });

  const lessons = course.tracks.flatMap((track) => track.lessons);
  const path = `/course/${course.slug}`;
  return buildPageMeta({
    title: `${course.title} — QisLearn`,
    description: course.title,
    path,
    ldJson: {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      url: `${SITE_URL}${path}`,
      provider: { "@type": "Organization", name: "QisLearn", url: SITE_URL },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT" + lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0) + "M",
      },
      hasPart: lessons.map((lesson) => ({
        "@type": "LearningResource",
        name: lesson.title,
        description: lesson.summary,
        url: `${SITE_URL}/lesson/${lesson.id}`,
      })),
    },
  });
};

export default function CourseHomePage() {
  const { course } = useLoaderData<typeof loader>();

  return (
    <Container maxW={{ base: "6xl", "2xl": "8xl" }} px="0" py={{ base: "6", md: "10" }}>
      <Heading size="2xl" mb="10" letterSpacing="tight">
        {course.title}
      </Heading>
      <CourseTrackGrid course={course} />
    </Container>
  );
}
