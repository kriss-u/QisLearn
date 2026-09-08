import { and, eq } from "drizzle-orm";
import {
  codeSnapshot,
  contentBlock,
  lesson,
  lessonPrerequisite,
  lessonProgress,
  lessonTag,
  module_,
  quizAttempt,
  tag,
  track,
} from "@qislearn/db/schema";
import { GraphQLError } from "graphql";
import { createSchema } from "graphql-yoga";
import { JSONResolver } from "graphql-scalars";
import { db } from "./db.js";
import { requireAdmin, requireUser } from "./authz-guards.js";
import type { GraphQLContext } from "./context.js";

const LESSON_STATUSES = ["not-started", "in-progress", "completed"] as const;
type LessonStatusValue = (typeof LESSON_STATUSES)[number];

function toStatusValue(graphqlEnumValue: string): LessonStatusValue {
  // GraphQL enum values arrive as NOT_STARTED/IN_PROGRESS/COMPLETED; the
  // column stores the same free-text values Dexie used ("not-started", etc).
  const value = graphqlEnumValue.toLowerCase().replace(/_/g, "-");
  if (!(LESSON_STATUSES as readonly string[]).includes(value)) {
    throw new GraphQLError(`Invalid lesson status: ${graphqlEnumValue}`);
  }
  return value as LessonStatusValue;
}

function toEnumValue(value: string): string {
  return value.toUpperCase().replace(/-/g, "_");
}

function fromEnumValue(value: string): string {
  return value.toLowerCase().replace(/_/g, "-");
}

// Partial-update mutations (updateTrack/updateLesson/updateModule/...) take
// every field as optional: a field omitted from the GraphQL request arrives
// as `undefined` and should leave the column untouched, while an explicit
// `null` (only meaningful for moduleId) should clear it. This strips the
// `undefined` keys so Drizzle's `.set()` only touches what was actually sent.
function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) (result as Record<string, unknown>)[key] = value;
  }
  return result;
}

export const schema = createSchema<GraphQLContext>({
  typeDefs: /* GraphQL */ `
    scalar JSON

    type Query {
      health: String!
      me: User
      tracks: [Track!]!
      lesson(slug: String!): Lesson
      myLessonProgress: [LessonProgress!]!
      myCodeSnapshot(lessonSlug: String!, exerciseId: String!): CodeSnapshot
      myQuizAttempt(lessonSlug: String!, quizId: String!): QuizAttempt
      adminLesson(id: ID!): Lesson
      adminTags: [Tag!]!
    }

    type Mutation {
      setLessonProgress(lessonSlug: String!, status: LessonStatus!): LessonProgress!
      saveCodeSnapshot(
        lessonSlug: String!
        exerciseId: String!
        code: String!
        resultOk: Boolean
        resultMessages: [String!]
      ): CodeSnapshot!
      saveQuizAttempt(
        lessonSlug: String!
        quizId: String!
        selectedChoiceId: String!
        submitted: Boolean!
      ): QuizAttempt!
      deleteQuizAttempt(lessonSlug: String!, quizId: String!): Boolean!
      resetMyProgress: Boolean!

      createTrack(slug: String!, title: String!, order: Int!): Track!
      updateTrack(id: ID!, slug: String, title: String, order: Int): Track!

      createModule(trackId: ID!, slug: String!, title: String!, order: Int!): Module!
      updateModule(id: ID!, slug: String, title: String, order: Int): Module!
      deleteModule(id: ID!): Boolean!

      createLesson(
        trackId: ID!
        moduleId: ID
        slug: String!
        title: String!
        summary: String!
        layout: String!
        difficulty: LessonDifficulty!
        order: Int!
        estimatedMinutes: Int!
      ): Lesson!
      updateLesson(
        id: ID!
        trackId: ID
        moduleId: ID
        slug: String
        title: String
        summary: String
        layout: String
        difficulty: LessonDifficulty
        order: Int
        estimatedMinutes: Int
      ): Lesson!
      deleteLesson(id: ID!): Boolean!
      updateLessonPrerequisites(lessonId: ID!, prerequisiteLessonIds: [ID!]!): Lesson!

      createTag(slug: String!, label: String!): Tag!
      updateLessonTags(lessonId: ID!, tagIds: [ID!]!): Lesson!

      createContentBlock(lessonId: ID!, order: Int!, type: String!, data: JSON!): ContentBlock!
      updateContentBlock(id: ID!, order: Int, type: String, data: JSON): ContentBlock!
      deleteContentBlock(id: ID!): Boolean!
    }

    enum LessonStatus {
      NOT_STARTED
      IN_PROGRESS
      COMPLETED
    }

    type User {
      id: ID!
      email: String!
      name: String!
      role: String
    }

    type LessonProgress {
      lessonSlug: String!
      status: LessonStatus!
      updatedAt: String!
    }

    type CodeSnapshot {
      lessonSlug: String!
      exerciseId: String!
      code: String!
      resultOk: Boolean
      resultMessages: [String!]
      updatedAt: String!
    }

    type QuizAttempt {
      lessonSlug: String!
      quizId: String!
      selectedChoiceId: String!
      submitted: Boolean!
      updatedAt: String!
    }

    type Track {
      id: ID!
      slug: String!
      title: String!
      order: Int!
      lessons: [Lesson!]!
      modules: [Module!]!
    }

    type Module {
      id: ID!
      slug: String!
      title: String!
      order: Int!
      lessons: [Lesson!]!
    }

    type Tag {
      id: ID!
      slug: String!
      label: String!
    }

    enum LessonDifficulty {
      BEGINNER
      INTERMEDIATE
      ADVANCED
    }

    type Lesson {
      id: ID!
      slug: String!
      title: String!
      summary: String!
      layout: String!
      difficulty: LessonDifficulty!
      order: Int!
      estimatedMinutes: Int!
      track: Track!
      module: Module
      tags: [Tag!]!
      prerequisites: [Lesson!]!
      contentBlocks: [ContentBlock!]!
    }

    type ContentBlock {
      id: ID!
      order: Int!
      type: String!
      data: JSON!
    }
  `,
  resolvers: {
    JSON: JSONResolver,
    Query: {
      health: () => "ok",
      me: (_parent, _args, ctx) => ctx.user,
      tracks: () =>
        db.query.track.findMany({
          orderBy: (t, { asc }) => asc(t.order),
          with: {
            lessons: { orderBy: (l, { asc }) => asc(l.order) },
            modules: { orderBy: (m, { asc }) => asc(m.order) },
          },
        }),
      lesson: (_parent, args: { slug: string }) =>
        db.query.lesson.findFirst({
          where: eq(lesson.slug, args.slug),
          with: {
            track: true,
            module: true,
            tags: { with: { tag: true } },
            contentBlocks: { orderBy: (cb, { asc }) => asc(cb.order) },
            prerequisites: { with: { prerequisite: { with: { track: true } } } },
          },
        }),
      myLessonProgress: async (_parent, _args, ctx) => {
        const user = requireUser(ctx);
        const rows = await db.query.lessonProgress.findMany({ where: eq(lessonProgress.userId, user.id) });
        return rows.map((r) => ({ ...r, status: toEnumValue(r.status) }));
      },
      myCodeSnapshot: async (_parent, args: { lessonSlug: string; exerciseId: string }, ctx) => {
        const user = requireUser(ctx);
        return db.query.codeSnapshot.findFirst({
          where: and(
            eq(codeSnapshot.userId, user.id),
            eq(codeSnapshot.lessonSlug, args.lessonSlug),
            eq(codeSnapshot.exerciseId, args.exerciseId),
          ),
        });
      },
      myQuizAttempt: async (_parent, args: { lessonSlug: string; quizId: string }, ctx) => {
        const user = requireUser(ctx);
        return db.query.quizAttempt.findFirst({
          where: and(
            eq(quizAttempt.userId, user.id),
            eq(quizAttempt.lessonSlug, args.lessonSlug),
            eq(quizAttempt.quizId, args.quizId),
          ),
        });
      },
      adminLesson: (_parent, args: { id: string }, ctx) => {
        requireAdmin(ctx);
        return db.query.lesson.findFirst({
          where: eq(lesson.id, args.id),
          with: {
            track: true,
            module: true,
            tags: { with: { tag: true } },
            contentBlocks: { orderBy: (cb, { asc }) => asc(cb.order) },
            prerequisites: { with: { prerequisite: { with: { track: true } } } },
          },
        });
      },
      adminTags: (_parent, _args, ctx) => {
        requireAdmin(ctx);
        return db.query.tag.findMany({ orderBy: (t, { asc }) => asc(t.label) });
      },
    },
    Mutation: {
      setLessonProgress: async (_parent, args: { lessonSlug: string; status: string }, ctx) => {
        const user = requireUser(ctx);
        const nextStatus = toStatusValue(args.status);

        const existing = await db.query.lessonProgress.findFirst({
          where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonSlug, args.lessonSlug)),
        });
        // Never downgrade a completed lesson back to in-progress: this is
        // now the real source of truth (was previously just a client-side
        // guard in the zustand store).
        const finalStatus = existing?.status === "completed" && nextStatus === "in-progress" ? "completed" : nextStatus;

        const [row] = await db
          .insert(lessonProgress)
          .values({ userId: user.id, lessonSlug: args.lessonSlug, status: finalStatus })
          .onConflictDoUpdate({
            target: [lessonProgress.userId, lessonProgress.lessonSlug],
            set: { status: finalStatus, updatedAt: new Date() },
          })
          .returning();
        if (!row) throw new GraphQLError("Failed to save lesson progress.");
        return { ...row, status: toEnumValue(row.status) };
      },
      saveCodeSnapshot: async (
        _parent,
        args: {
          lessonSlug: string;
          exerciseId: string;
          code: string;
          resultOk?: boolean | null;
          resultMessages?: string[] | null;
        },
        ctx,
      ) => {
        const user = requireUser(ctx);
        const values = {
          userId: user.id,
          lessonSlug: args.lessonSlug,
          exerciseId: args.exerciseId,
          code: args.code,
          resultOk: args.resultOk ?? null,
          resultMessages: args.resultMessages ?? null,
        };
        const [row] = await db
          .insert(codeSnapshot)
          .values(values)
          .onConflictDoUpdate({
            target: [codeSnapshot.userId, codeSnapshot.lessonSlug, codeSnapshot.exerciseId],
            set: {
              code: values.code,
              resultOk: values.resultOk,
              resultMessages: values.resultMessages,
              updatedAt: new Date(),
            },
          })
          .returning();
        return row;
      },
      saveQuizAttempt: async (
        _parent,
        args: { lessonSlug: string; quizId: string; selectedChoiceId: string; submitted: boolean },
        ctx,
      ) => {
        const user = requireUser(ctx);
        const values = {
          userId: user.id,
          lessonSlug: args.lessonSlug,
          quizId: args.quizId,
          selectedChoiceId: args.selectedChoiceId,
          submitted: args.submitted,
          submittedAt: args.submitted ? new Date() : null,
        };
        const [row] = await db
          .insert(quizAttempt)
          .values(values)
          .onConflictDoUpdate({
            target: [quizAttempt.userId, quizAttempt.lessonSlug, quizAttempt.quizId],
            set: {
              selectedChoiceId: values.selectedChoiceId,
              submitted: values.submitted,
              submittedAt: values.submittedAt,
              updatedAt: new Date(),
            },
          })
          .returning();
        return row;
      },
      deleteQuizAttempt: async (_parent, args: { lessonSlug: string; quizId: string }, ctx) => {
        const user = requireUser(ctx);
        await db
          .delete(quizAttempt)
          .where(
            and(
              eq(quizAttempt.userId, user.id),
              eq(quizAttempt.lessonSlug, args.lessonSlug),
              eq(quizAttempt.quizId, args.quizId),
            ),
          );
        return true;
      },
      resetMyProgress: async (_parent, _args, ctx) => {
        const user = requireUser(ctx);
        await db.transaction(async (tx) => {
          await tx.delete(lessonProgress).where(eq(lessonProgress.userId, user.id));
          await tx.delete(codeSnapshot).where(eq(codeSnapshot.userId, user.id));
          await tx.delete(quizAttempt).where(eq(quizAttempt.userId, user.id));
        });
        return true;
      },

      createTrack: async (_parent, args: { slug: string; title: string; order: number }, ctx) => {
        requireAdmin(ctx);
        const [row] = await db.insert(track).values(args).returning();
        return row;
      },
      updateTrack: async (
        _parent,
        args: { id: string; slug?: string; title?: string; order?: number },
        ctx,
      ) => {
        requireAdmin(ctx);
        const { id, ...rest } = args;
        const [row] = await db.update(track).set(pickDefined(rest)).where(eq(track.id, id)).returning();
        if (!row) throw new GraphQLError("Track not found.");
        return row;
      },

      createModule: async (
        _parent,
        args: { trackId: string; slug: string; title: string; order: number },
        ctx,
      ) => {
        requireAdmin(ctx);
        const [row] = await db
          .insert(module_)
          .values({ trackId: args.trackId, slug: args.slug, title: args.title, order: args.order })
          .returning();
        return row;
      },
      updateModule: async (
        _parent,
        args: { id: string; slug?: string; title?: string; order?: number },
        ctx,
      ) => {
        requireAdmin(ctx);
        const { id, ...rest } = args;
        const [row] = await db.update(module_).set(pickDefined(rest)).where(eq(module_.id, id)).returning();
        if (!row) throw new GraphQLError("Module not found.");
        return row;
      },
      deleteModule: async (_parent, args: { id: string }, ctx) => {
        requireAdmin(ctx);
        await db.delete(module_).where(eq(module_.id, args.id));
        return true;
      },

      createLesson: async (
        _parent,
        args: {
          trackId: string;
          moduleId?: string | null;
          slug: string;
          title: string;
          summary: string;
          layout: string;
          difficulty: string;
          order: number;
          estimatedMinutes: number;
        },
        ctx,
      ) => {
        requireAdmin(ctx);
        const [row] = await db
          .insert(lesson)
          .values({
            trackId: args.trackId,
            moduleId: args.moduleId ?? null,
            slug: args.slug,
            title: args.title,
            summary: args.summary,
            layout: args.layout,
            difficulty: fromEnumValue(args.difficulty),
            order: args.order,
            estimatedMinutes: args.estimatedMinutes,
          })
          .returning();
        if (!row) throw new GraphQLError("Failed to create lesson.");
        return { ...row, difficulty: toEnumValue(row.difficulty) };
      },
      updateLesson: async (
        _parent,
        args: {
          id: string;
          trackId?: string;
          moduleId?: string | null;
          slug?: string;
          title?: string;
          summary?: string;
          layout?: string;
          difficulty?: string;
          order?: number;
          estimatedMinutes?: number;
        },
        ctx,
      ) => {
        requireAdmin(ctx);
        const { id, difficulty, ...rest } = args;
        const set = pickDefined({ ...rest, difficulty: difficulty !== undefined ? fromEnumValue(difficulty) : undefined });
        const [row] = await db.update(lesson).set(set).where(eq(lesson.id, id)).returning();
        if (!row) throw new GraphQLError("Lesson not found.");
        return { ...row, difficulty: toEnumValue(row.difficulty) };
      },
      deleteLesson: async (_parent, args: { id: string }, ctx) => {
        requireAdmin(ctx);
        await db.delete(lesson).where(eq(lesson.id, args.id));
        return true;
      },
      updateLessonPrerequisites: async (
        _parent,
        args: { lessonId: string; prerequisiteLessonIds: string[] },
        ctx,
      ) => {
        requireAdmin(ctx);
        await db.transaction(async (tx) => {
          await tx.delete(lessonPrerequisite).where(eq(lessonPrerequisite.lessonId, args.lessonId));
          if (args.prerequisiteLessonIds.length > 0) {
            await tx.insert(lessonPrerequisite).values(
              args.prerequisiteLessonIds.map((prerequisiteLessonId) => ({
                lessonId: args.lessonId,
                prerequisiteLessonId,
              })),
            );
          }
        });
        const row = await db.query.lesson.findFirst({
          where: eq(lesson.id, args.lessonId),
          with: {
            track: true,
            module: true,
            tags: { with: { tag: true } },
            contentBlocks: { orderBy: (cb, { asc }) => asc(cb.order) },
            prerequisites: { with: { prerequisite: { with: { track: true } } } },
          },
        });
        if (!row) throw new GraphQLError("Lesson not found.");
        return row;
      },

      createTag: async (_parent, args: { slug: string; label: string }, ctx) => {
        requireAdmin(ctx);
        const [row] = await db.insert(tag).values(args).returning();
        return row;
      },
      updateLessonTags: async (_parent, args: { lessonId: string; tagIds: string[] }, ctx) => {
        requireAdmin(ctx);
        await db.transaction(async (tx) => {
          await tx.delete(lessonTag).where(eq(lessonTag.lessonId, args.lessonId));
          if (args.tagIds.length > 0) {
            await tx.insert(lessonTag).values(args.tagIds.map((tagId) => ({ lessonId: args.lessonId, tagId })));
          }
        });
        const row = await db.query.lesson.findFirst({
          where: eq(lesson.id, args.lessonId),
          with: {
            track: true,
            module: true,
            tags: { with: { tag: true } },
            contentBlocks: { orderBy: (cb, { asc }) => asc(cb.order) },
            prerequisites: { with: { prerequisite: { with: { track: true } } } },
          },
        });
        if (!row) throw new GraphQLError("Lesson not found.");
        return row;
      },

      createContentBlock: async (
        _parent,
        args: { lessonId: string; order: number; type: string; data: Record<string, unknown> },
        ctx,
      ) => {
        requireAdmin(ctx);
        const [row] = await db.insert(contentBlock).values(args).returning();
        return row;
      },
      updateContentBlock: async (
        _parent,
        args: { id: string; order?: number; type?: string; data?: Record<string, unknown> },
        ctx,
      ) => {
        requireAdmin(ctx);
        const { id, ...rest } = args;
        const [row] = await db
          .update(contentBlock)
          .set(pickDefined(rest))
          .where(eq(contentBlock.id, id))
          .returning();
        if (!row) throw new GraphQLError("Content block not found.");
        return row;
      },
      deleteContentBlock: async (_parent, args: { id: string }, ctx) => {
        requireAdmin(ctx);
        await db.delete(contentBlock).where(eq(contentBlock.id, args.id));
        return true;
      },
    },
    Lesson: {
      difficulty: (parent: { difficulty: string }) => toEnumValue(parent.difficulty),
      tags: (parent: { tags?: Array<{ tag: unknown }> }) => (parent.tags ?? []).map((t) => t.tag),
      prerequisites: (parent: { prerequisites?: Array<{ prerequisite: unknown }> }) =>
        (parent.prerequisites ?? []).map((p) => p.prerequisite),
    },
    Module: {
      lessons: (parent: { id: string }) =>
        db.query.lesson.findMany({
          where: (l, { eq: eqOp }) => eqOp(l.moduleId, parent.id),
          orderBy: (l, { asc }) => asc(l.order),
        }),
    },
  },
});
