import { Badge, Box, Button, Field, HStack, Heading, IconButton, Input, Switch, Text, VStack, Wrap } from "@chakra-ui/react";
import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import {
  useCreateWidgetCategoryMutation,
  useDeleteWidgetCategoryMutation,
  useDeleteWidgetMutation,
  useUpdateWidgetCategoryMutation,
  useUpdateWidgetMutation,
  useWidgetCategoriesQuery,
  useWidgetsQuery,
  type WidgetCategoriesQuery,
  type WidgetsQuery,
} from "@qislearn/graphql-schema";
import { AdminLoading } from "./AdminLoading";

type Widget = WidgetsQuery["widgets"][number];
type WidgetCategory = WidgetCategoriesQuery["widgetCategories"][number];

function NewCategoryForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [createCategory, { loading }] = useCreateWidgetCategoryMutation();

  if (!open) {
    return (
      <Button size="xs" variant="outline" onClick={() => setOpen(true)}>
        Add category
      </Button>
    );
  }

  async function handleSubmit() {
    await createCategory({ variables: { slug, label } });
    setOpen(false);
    setSlug("");
    setLabel("");
    onCreated();
  }

  return (
    <HStack borderWidth="1px" borderColor="border" rounded="l2" p="2" gap="2">
      <Input size="xs" placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
      <Input
        size="xs"
        fontFamily="mono"
        placeholder="slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <Button size="xs" colorPalette="quantum" onClick={handleSubmit} loading={loading} disabled={!slug || !label}>
        Save
      </Button>
      <Button size="xs" variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </HStack>
  );
}

function CategoryManager({ categories, onChanged }: { categories: WidgetCategory[]; onChanged: () => void }) {
  const [updateCategory] = useUpdateWidgetCategoryMutation();
  const [deleteCategory] = useDeleteWidgetCategoryMutation();
  const [editing, setEditing] = useState<Record<string, string>>({});

  async function commitRename(category: WidgetCategory) {
    const label = editing[category.id];
    if (label === undefined || label === category.label) return;
    await updateCategory({ variables: { id: category.id, label } });
    onChanged();
  }

  return (
    <VStack align="stretch" gap="3">
      <Heading size="sm">Categories</Heading>
      <Wrap gap="2">
        {categories.map((category) => (
          <HStack key={category.id} borderWidth="1px" borderColor="border" rounded="l2" pl="2" pr="1" py="1" gap="1">
            <Input
              size="xs"
              variant="flushed"
              value={editing[category.id] ?? category.label}
              onChange={(e) => setEditing((prev) => ({ ...prev, [category.id]: e.target.value }))}
              onBlur={() => commitRename(category)}
              maxW="28"
            />
            <IconButton
              size="2xs"
              variant="ghost"
              colorPalette="red"
              aria-label={`Delete ${category.label}`}
              onClick={async () => {
                await deleteCategory({ variables: { id: category.id } });
                onChanged();
              }}
            >
              <LuTrash2 />
            </IconButton>
          </HStack>
        ))}
      </Wrap>
      <NewCategoryForm onCreated={onChanged} />
    </VStack>
  );
}

function WidgetRow({
  widget,
  categories,
  onChanged,
}: {
  widget: Widget;
  categories: WidgetCategory[];
  onChanged: () => void;
}) {
  const [updateWidget] = useUpdateWidgetMutation();
  const [deleteWidget] = useDeleteWidgetMutation();
  const [label, setLabel] = useState(widget.label);
  const [description, setDescription] = useState(widget.description ?? "");
  const categoryIds = new Set(widget.categories.map((c) => c.id));

  async function commitLabel() {
    if (label === widget.label) return;
    await updateWidget({ variables: { key: widget.key, label } });
    onChanged();
  }

  async function commitDescription() {
    if (description === (widget.description ?? "")) return;
    await updateWidget({ variables: { key: widget.key, description: description || null } });
    onChanged();
  }

  async function toggleCategory(categoryId: string) {
    const next = categoryIds.has(categoryId)
      ? [...categoryIds].filter((id) => id !== categoryId)
      : [...categoryIds, categoryId];
    await updateWidget({ variables: { key: widget.key, categoryIds: next } });
    onChanged();
  }

  return (
    <Box borderWidth="1px" borderColor="border" rounded="l2" p="4">
      <VStack align="stretch" gap="3">
        <HStack justify="space-between">
          <HStack gap="3">
            <Text fontFamily="mono" fontSize="xs" color="fg.muted">
              {widget.key}
            </Text>
            {!widget.implemented && (
              <Badge size="sm" colorPalette="orange">
                Not implemented
              </Badge>
            )}
          </HStack>
          <HStack gap="4">
            <Switch.Root
              size="sm"
              checked={widget.implemented}
              onCheckedChange={async () => {
                await updateWidget({ variables: { key: widget.key, implemented: !widget.implemented } });
                onChanged();
              }}
            >
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label fontSize="xs">Implemented</Switch.Label>
            </Switch.Root>
            <IconButton
              size="xs"
              variant="ghost"
              colorPalette="red"
              aria-label={`Delete ${widget.label}`}
              onClick={async () => {
                await deleteWidget({ variables: { key: widget.key } });
                onChanged();
              }}
            >
              <LuTrash2 />
            </IconButton>
          </HStack>
        </HStack>

        <HStack gap="4">
          <Field.Root flex="1">
            <Field.Label fontSize="xs">Label</Field.Label>
            <Input size="sm" value={label} onChange={(e) => setLabel(e.target.value)} onBlur={commitLabel} />
          </Field.Root>
        </HStack>

        <Field.Root>
          <Field.Label fontSize="xs">Description</Field.Label>
          <Input
            size="sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={commitDescription}
          />
        </Field.Root>

        <Box>
          <Text fontSize="xs" color="fg.muted" mb="1.5">
            Categories
          </Text>
          <Wrap gap="1.5">
            {categories.map((category) => {
              const active = categoryIds.has(category.id);
              return (
                <Badge
                  key={category.id}
                  as="button"
                  size="sm"
                  cursor="pointer"
                  variant={active ? "solid" : "outline"}
                  colorPalette={active ? "quantum" : "gray"}
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.label}
                </Badge>
              );
            })}
            {categories.length === 0 && (
              <Text fontSize="xs" color="fg.muted">
                No categories yet — add one below.
              </Text>
            )}
          </Wrap>
        </Box>

        {widget.fields.length > 0 && (
          <Text fontSize="xs" color="fg.muted">
            Fields: {widget.fields.map((f) => f.name).join(", ")}
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export default function WidgetsPage() {
  const { data: widgetsData, loading: widgetsLoading, refetch: refetchWidgets } = useWidgetsQuery();
  const { data: categoriesData, loading: categoriesLoading, refetch: refetchCategories } = useWidgetCategoriesQuery();

  if (widgetsLoading || categoriesLoading) return <AdminLoading label="Loading widgets…" />;

  const widgets = widgetsData?.widgets ?? [];
  const categories = categoriesData?.widgetCategories ?? [];

  function refetchAll() {
    refetchWidgets();
    refetchCategories();
  }

  return (
    <VStack align="stretch" gap="8">
      <Heading size="lg">Widgets</Heading>
      <Text fontSize="sm" color="fg.muted">
        The catalog of authorable content-block types offered in the lesson editor. A new widget's code has to be
        written first — this page only edits the catalog entry (label, description, category, and whether it's
        marked implemented) for widgets that already exist in code.
      </Text>

      <CategoryManager categories={categories} onChanged={refetchAll} />

      <VStack align="stretch" gap="3">
        {widgets.map((widget) => (
          <WidgetRow key={widget.key} widget={widget} categories={categories} onChanged={refetchAll} />
        ))}
      </VStack>
    </VStack>
  );
}
