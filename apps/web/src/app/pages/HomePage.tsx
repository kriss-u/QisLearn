import { Card, Container, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Link, redirect, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { getMyCourseList, GraphQLRequestError } from "../../content";
import { AuthMenu } from "../../components/layout/AuthMenu";
import { Logo } from "../../components/ui/Logo";
import { buildPageMeta } from "../../lib/seo";

// The landing dashboard — deliberately its own bare screen (see root.tsx's
// isBareScreen), not wrapped in the learning app's sidebar shell. The
// sidebar only makes sense once you're actually inside a course; this page
// is where you pick which one, even when there's only one to pick (a
// direct link, not an auto-redirect — this is real rendered content, not
// a waypoint). Deliberately generic: never assumes there's exactly one
// course, or what any of them are about.
export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("cookie") ?? undefined;
  let courses;
  try {
    courses = await getMyCourseList(cookie);
  } catch (err) {
    if (err instanceof GraphQLRequestError && err.code === "UNAUTHENTICATED") {
      throw redirect("/login?redirect=/");
    }
    throw err;
  }
  if (courses.length === 0) throw redirect("/courses");
  return { courses };
}

export const meta: MetaFunction = () =>
  buildPageMeta({ title: "Your courses — QisLearn", description: "Pick a course to continue.", path: "/" });

export default function HomePage() {
  const { courses } = useLoaderData<typeof loader>();

  return (
    <Container maxW={{ base: "6xl", "2xl": "8xl" }} py={{ base: "6", md: "10" }}>
      <HStack justify="space-between" mb="10">
        <HStack gap="3">
          <Logo boxSize="10" />
          <Heading size="2xl" letterSpacing="tight">
            Your courses
          </Heading>
        </HStack>
        <AuthMenu />
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="5">
        {courses.map((course) => (
          <Link key={course.slug} to={`/course/${course.slug}`}>
            <Card.Root
              h="full"
              colorPalette="quantum"
              variant="elevated"
              bg="bg.glass"
              backdropFilter="blur(12px)"
              boxShadow="glass"
              _hover={{ borderColor: "colorPalette.solid", transform: "translateY(-3px)", boxShadow: "glow" }}
              borderWidth="1px"
              borderColor="border.glass"
            >
              <Card.Body>
                <VStack align="stretch" gap="1">
                  <Card.Title fontSize="lg">{course.title}</Card.Title>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Link>
        ))}
      </SimpleGrid>

      <Text fontSize="sm" color="fg.muted" mt="8">
        <Link to="/courses" style={{ textDecoration: "underline" }}>
          Manage courses
        </Link>
      </Text>
    </Container>
  );
}
