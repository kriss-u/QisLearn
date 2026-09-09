import { relations, sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth-schema.js";

// UUIDv7 (Postgres 18 builtin, no extension) instead of v4/gen_random_uuid:
// its leading bytes are a millisecond timestamp, so ids sort roughly by
// creation order — better b-tree insert locality than random v4, and a
// `select ... order by id` or a plain filename/dump ordering already reads
// newest-last, which matters for a content-heavy schema that gets seeded,
// diffed, and shared between local dev databases a lot more than most
// tables here get random-access lookups by id.
const uuidv7 = () => sql`uuidv7()`;

// Top-level offering (e.g. "Quantum Computing", future "LLM Development").
// Associates directly with `lesson`, not `track`: a track ("Math", "Qubits")
// is a reusable grouping that can appear under more than one course, so
// which tracks "belong to" a course is derived from the courses's lessons
// rather than stored as a track->course FK (see `courseTracks` query).
export const course = pgTable("course", {
  id: uuid("id").primaryKey().default(uuidv7()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

// Which organizations a course has been offered to (entitlement). The
// actual authorization check is done via OpenFGA (packages/authz/model.fga
// `course#offered_to`) — this table is the source of truth for listing
// ("which courses does org X have") and is kept in sync with the FGA tuple
// on every offer/un-offer.
export const courseOrganization = pgTable(
  "course_organization",
  {
    courseId: uuid("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.courseId, t.organizationId] })],
);

export const track = pgTable("track", {
  id: uuid("id").primaryKey().default(uuidv7()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

// Optional grouping level between track and lesson (e.g. a track with many
// lessons split into "Module 1: Qubits", "Module 2: Gates", ...). Nullable
// on `lesson.moduleId` below: a track can mix grouped and ungrouped lessons,
// and none of the existing 22 migrated lessons belong to a module yet.
export const module_ = pgTable("module", {
  id: uuid("id").primaryKey().default(uuidv7()),
  trackId: uuid("track_id")
    .notNull()
    .references(() => track.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

// Free text, not a pg enum, matching content_block.type's convention below:
// the set is small and stable in practice, but an enum forces a migration
// to change it and gains little over app-layer (zod) validation.
export const lessonDifficulties = ["beginner", "intermediate", "advanced"] as const;

export const lesson = pgTable("lesson", {
  id: uuid("id").primaryKey().default(uuidv7()),
  slug: text("slug").notNull().unique(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  trackId: uuid("track_id")
    .notNull()
    .references(() => track.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").references(() => module_.id, { onDelete: "set null" }),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  layout: text("layout").notNull(),
  difficulty: text("difficulty").notNull().default("beginner"),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  // Nullable = global/public content; per-org content scoping is an open
  // question (docs/BACKEND_PLAN.md §10), left unresolved rather than forced here.
  orgId: text("org_id"),
});

export const lessonPrerequisite = pgTable(
  "lesson_prerequisite",
  {
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    prerequisiteLessonId: uuid("prerequisite_lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.lessonId, t.prerequisiteLessonId] })],
);

// Cross-cutting topics ("superposition", "entanglement", "algorithms", ...),
// independent of a lesson's track/module position — for search/filter, not
// sequencing (that's still track/module/lesson `order`).
export const tag = pgTable("tag", {
  id: uuid("id").primaryKey().default(uuidv7()),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
});

export const lessonTag = pgTable(
  "lesson_tag",
  {
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.lessonId, t.tagId] })],
);

// `type` is the lesson-authoring component's tag name ("markdown" for plain
// prose, otherwise the exact MDX JSX name — "Visualization", "OracleFigure",
// etc, see apps/web/src/components/lesson/mdxComponents.ts). Left as free
// text rather than a fixed enum: lesson authors add new one-off interactive
// widgets fairly often, and each addition shouldn't require a DB migration.
export const contentBlock = pgTable("content_block", {
  id: uuid("id").primaryKey().default(uuidv7()),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  type: text("type").notNull(),
  data: jsonb("data").notNull().$type<Record<string, unknown>>(),
});

// Catalog of authorable widget types, for the admin content-block picker.
// `key` matches `content_block.type` and the `CONTENT_BLOCK_REGISTRY` type
// string (apps/api/src/content-block-registry.ts) when a component exists;
// `implemented: false` means the widget is cataloged (so authors can see
// it's planned and place it) but has no working component/field-spec yet —
// the lesson renderer shows a "not implemented yet" placeholder for it.
export const widget = pgTable("widget", {
  id: uuid("id").primaryKey().default(uuidv7()),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  description: text("description"),
  implemented: boolean("implemented").notNull().default(false),
  order: integer("order").notNull(),
});

export const widgetCategory = pgTable("widget_category", {
  id: uuid("id").primaryKey().default(uuidv7()),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
});

export const widgetWidgetCategory = pgTable(
  "widget_widget_category",
  {
    widgetId: uuid("widget_id")
      .notNull()
      .references(() => widget.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => widgetCategory.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.widgetId, t.categoryId] })],
);

export const courseRelations = relations(course, ({ many }) => ({
  lessons: many(lesson),
  offeredTo: many(courseOrganization),
}));

export const courseOrganizationRelations = relations(courseOrganization, ({ one }) => ({
  course: one(course, { fields: [courseOrganization.courseId], references: [course.id] }),
  organization: one(organization, {
    fields: [courseOrganization.organizationId],
    references: [organization.id],
  }),
}));

export const widgetRelations = relations(widget, ({ many }) => ({
  categories: many(widgetWidgetCategory),
}));

export const widgetCategoryRelations = relations(widgetCategory, ({ many }) => ({
  widgets: many(widgetWidgetCategory),
}));

export const widgetWidgetCategoryRelations = relations(widgetWidgetCategory, ({ one }) => ({
  widget: one(widget, { fields: [widgetWidgetCategory.widgetId], references: [widget.id] }),
  category: one(widgetCategory, {
    fields: [widgetWidgetCategory.categoryId],
    references: [widgetCategory.id],
  }),
}));

export const trackRelations = relations(track, ({ many }) => ({
  lessons: many(lesson),
  modules: many(module_),
}));

export const moduleRelations = relations(module_, ({ one, many }) => ({
  track: one(track, { fields: [module_.trackId], references: [track.id] }),
  lessons: many(lesson),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  course: one(course, { fields: [lesson.courseId], references: [course.id] }),
  track: one(track, { fields: [lesson.trackId], references: [track.id] }),
  module: one(module_, { fields: [lesson.moduleId], references: [module_.id] }),
  contentBlocks: many(contentBlock),
  prerequisites: many(lessonPrerequisite, { relationName: "lessonPrerequisites" }),
  prerequisiteOf: many(lessonPrerequisite, { relationName: "lessonPrerequisiteOf" }),
  tags: many(lessonTag),
}));

export const lessonPrerequisiteRelations = relations(lessonPrerequisite, ({ one }) => ({
  lesson: one(lesson, {
    fields: [lessonPrerequisite.lessonId],
    references: [lesson.id],
    relationName: "lessonPrerequisites",
  }),
  prerequisite: one(lesson, {
    fields: [lessonPrerequisite.prerequisiteLessonId],
    references: [lesson.id],
    relationName: "lessonPrerequisiteOf",
  }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  lessons: many(lessonTag),
}));

export const lessonTagRelations = relations(lessonTag, ({ one }) => ({
  lesson: one(lesson, { fields: [lessonTag.lessonId], references: [lesson.id] }),
  tag: one(tag, { fields: [lessonTag.tagId], references: [tag.id] }),
}));

export const contentBlockRelations = relations(contentBlock, ({ one }) => ({
  lesson: one(lesson, { fields: [contentBlock.lessonId], references: [lesson.id] }),
}));
