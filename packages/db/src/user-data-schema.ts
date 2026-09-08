import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";
import { lesson } from "./content-schema.js";

// These three tables key off `lesson.slug` (stable across re-migrations),
// not `lesson.id` (a uuid the frontend never sees) — the frontend already
// identifies lessons by slug everywhere (LessonContext, routes), so this
// avoids a slug->uuid lookup on every progress/snapshot/quiz mutation.

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug")
      .notNull()
      .references(() => lesson.slug, { onDelete: "cascade" }),
    status: text("status").notNull().default("not-started"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonSlug] })],
);

export const codeSnapshot = pgTable(
  "code_snapshot",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug")
      .notNull()
      .references(() => lesson.slug, { onDelete: "cascade" }),
    exerciseId: text("exercise_id").notNull(),
    code: text("code").notNull(),
    resultOk: boolean("result_ok"),
    resultMessages: jsonb("result_messages").$type<string[]>(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonSlug, t.exerciseId] })],
);

export const quizAttempt = pgTable(
  "quiz_attempt",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug")
      .notNull()
      .references(() => lesson.slug, { onDelete: "cascade" }),
    quizId: text("quiz_id").notNull(),
    selectedChoiceId: text("selected_choice_id").notNull(),
    submitted: boolean("submitted").notNull().default(false),
    submittedAt: timestamp("submitted_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonSlug, t.quizId] })],
);

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(user, { fields: [lessonProgress.userId], references: [user.id] }),
  lesson: one(lesson, { fields: [lessonProgress.lessonSlug], references: [lesson.slug] }),
}));

export const codeSnapshotRelations = relations(codeSnapshot, ({ one }) => ({
  user: one(user, { fields: [codeSnapshot.userId], references: [user.id] }),
  lesson: one(lesson, { fields: [codeSnapshot.lessonSlug], references: [lesson.slug] }),
}));

export const quizAttemptRelations = relations(quizAttempt, ({ one }) => ({
  user: one(user, { fields: [quizAttempt.userId], references: [user.id] }),
  lesson: one(lesson, { fields: [quizAttempt.lessonSlug], references: [lesson.slug] }),
}));
