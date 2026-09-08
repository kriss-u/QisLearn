import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

export const track = pgTable("track", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

export const lesson = pgTable("lesson", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  trackId: uuid("track_id")
    .notNull()
    .references(() => track.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  layout: text("layout").notNull(),
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
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  track: one(track, { fields: [lesson.trackId], references: [track.id] }),
  contentBlocks: many(contentBlock),
  prerequisites: many(lessonPrerequisite, { relationName: "lessonPrerequisites" }),
  prerequisiteOf: many(lessonPrerequisite, { relationName: "lessonPrerequisiteOf" }),
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

export const contentBlockRelations = relations(contentBlock, ({ one }) => ({
  lesson: one(lesson, { fields: [contentBlock.lessonId], references: [lesson.id] }),
}));
