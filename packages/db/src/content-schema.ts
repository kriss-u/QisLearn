import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

export const track = pgTable("track", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

// Optional grouping level between track and lesson (e.g. a track with many
// lessons split into "Module 1: Qubits", "Module 2: Gates", ...). Nullable
// on `lesson.moduleId` below: a track can mix grouped and ungrouped lessons,
// and none of the existing 22 migrated lessons belong to a module yet.
export const module_ = pgTable("module", {
  id: uuid("id").primaryKey().defaultRandom(),
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
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
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
  id: uuid("id").primaryKey().defaultRandom(),
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
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  type: text("type").notNull(),
  data: jsonb("data").notNull().$type<Record<string, unknown>>(),
});

export const trackRelations = relations(track, ({ many }) => ({
  lessons: many(lesson),
  modules: many(module_),
}));

export const moduleRelations = relations(module_, ({ one, many }) => ({
  track: one(track, { fields: [module_.trackId], references: [track.id] }),
  lessons: many(lesson),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
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
