import { Box, Button, Container, HStack, Heading, Switch, Text, VStack } from "@chakra-ui/react";
import { Link, Navigate } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useCoursesQuery, useMyCoursesQuery, useOfferCourseMutation, useUnofferCourseMutation } from "@qislearn/graphql-schema";
import { useActiveOrganization, useSession } from "../../lib/authClient";
import { requireSession } from "../../lib/session.server";
import { AuthMenu } from "../../components/layout/AuthMenu";
import { Logo } from "../../components/ui/Logo";
import { buildPageMeta } from "../../lib/seo";

export const meta: MetaFunction = () =>
  buildPageMeta({ title: "My courses — QisLearn", description: "Choose which courses to study.", path: "/courses" });

export async function loader({ request }: LoaderFunctionArgs) {
  await requireSession(request, "/courses");
  return null;
}

// Works identically for a personal org (the signed-in user is its sole
// admin — see packages/db/src/auth-schema.ts's `isPersonal` comment) and a
// real team org: this page never surfaces the "organization" concept
// itself, just "which courses am I studying" — one code path for both.
export default function CoursesPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const { data: activeOrg, isPending: orgPending } = useActiveOrganization();
  const { data: coursesData, loading: coursesLoading } = useCoursesQuery();
  const { data: myCoursesData, loading: myCoursesLoading, refetch } = useMyCoursesQuery();
  const [offerCourse] = useOfferCourseMutation();
  const [unofferCourse] = useUnofferCourseMutation();

  if (sessionPending || orgPending) return null;
  if (!session) return <Navigate to="/login?redirect=/courses" replace />;

  const organizationId = activeOrg?.id;
  const courses = coursesData?.courses ?? [];
  const offeredIds = new Set((myCoursesData?.myCourses ?? []).map((c) => c.id));
  const hasSelection = offeredIds.size > 0;

  async function handleToggle(courseId: string, offered: boolean) {
    if (!organizationId) return;
    if (offered) {
      await unofferCourse({ variables: { courseId, organizationId } });
    } else {
      await offerCourse({ variables: { courseId, organizationId } });
    }
    await refetch();
  }

  return (
    <Container maxW="md" py={{ base: "10", md: "16" }}>
      <VStack align="stretch" gap="6">
        <HStack justify="space-between">
          <Link to="/" aria-label="QisLearn">
            <Logo boxSize="9" />
          </Link>
          <AuthMenu />
        </HStack>

        <Heading size="lg">My courses</Heading>
        <Text fontSize="sm" color="fg.muted">
          Turn on the courses you want to study — everyone in your organization sees the same list.
        </Text>

        {(coursesLoading || myCoursesLoading) && <Text fontSize="sm">Loading…</Text>}

        <VStack align="stretch" gap="2">
          {courses.map((course) => (
            <Box
              key={course.id}
              borderWidth="1px"
              borderColor="border"
              rounded="l2"
              p="3"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize="sm">{course.title}</Text>
              <Switch.Root
                checked={offeredIds.has(course.id)}
                onCheckedChange={() => handleToggle(course.id, offeredIds.has(course.id))}
                disabled={!organizationId}
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            </Box>
          ))}
        </VStack>

        <HStack justify="flex-end">
          <Button asChild colorPalette="quantum" disabled={!hasSelection}>
            <Link to="/">Continue</Link>
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}
