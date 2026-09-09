import { Button, Field, HStack, Heading, Input, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router";
import { useAdminCoursesQuery, useCreateCourseMutation } from "@qislearn/graphql-schema";
import { AdminLoading } from "./AdminLoading";

function NewCourseForm({ nextOrder, onCreated }: { nextOrder: number; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [createCourse, { loading }] = useCreateCourseMutation();

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Add course
      </Button>
    );
  }

  async function handleSubmit() {
    await createCourse({ variables: { slug, title, order: nextOrder } });
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

export default function AdminHome() {
  const { data, loading, refetch } = useAdminCoursesQuery();
  const courses = data?.courses ?? [];

  if (loading) return <AdminLoading label="Loading courses…" />;

  const nextCourseOrder = courses.length > 0 ? Math.max(...courses.map((c) => c.order)) + 100 : 100;

  return (
    <VStack align="stretch" gap="8">
      <Heading size="lg">Courses</Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="4">
        {courses.map((course) => (
          <Link key={course.id} to={`/admin/courses/${course.slug}`}>
            <VStack
              align="stretch"
              gap="2"
              borderWidth="1px"
              borderColor="border"
              rounded="l2"
              p="4"
              h="full"
              _hover={{ borderColor: "colorPalette.solid" }}
              colorPalette="quantum"
            >
              <Text fontWeight="medium">{course.title}</Text>
            </VStack>
          </Link>
        ))}
      </SimpleGrid>

      <NewCourseForm nextOrder={nextCourseOrder} onCreated={() => refetch()} />
    </VStack>
  );
}
