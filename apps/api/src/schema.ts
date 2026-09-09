import { and, eq, inArray } from "drizzle-orm";
import {
  codeSnapshot,
  contentBlock,
  course,
  courseOrganization,
  lesson,
  lessonPrerequisite,
  lessonProgress,
  lessonTag,
  member,
  module_,
  quizAttempt,
  tag,
  track,
  widget,
  widgetCategory,
  widgetWidgetCategory,
} from "@qislearn/db/schema";
import { GraphQLError } from "graphql";
import { createSchema } from "graphql-yoga";
import { JSONResolver } from "graphql-scalars";
import { ZodError } from "zod";
import { db } from "./db.js";
import { requireAdmin, requireCourseOffered, requireOrgAdmin, requireUser } from "./authz-guards.js";
import { CONTENT_BLOCK_REGISTRY, validateContentBlockData } from "./content-block-registry.js";
import { LESSON_LAYOUTS, LESSON_LAYOUT_VALUES } from "./lesson-layouts.js";
import { getLessonMarkdownContent } from "./lesson-content.js";
import { suggestLessonQuestions } from "./lesson-qa.js";
import type { GraphQLContext } from "./context.js";

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}

function validateLayout(layout: string) {
  if (!LESSON_LAYOUT_VALUES.includes(layout)) {
    badInput(`Invalid lesson layout: ${layout}. Must be one of ${LESSON_LAYOUT_VALUES.join(", ")}.`);
  }
}

function validateBlockData(type: string, data: Record<string, unknown>): Record<string, unknown> {
  try {
    return validateContentBlockData(type, data);
  } catch (err) {
    if (err instanceof ZodError) {
      badInput(`Invalid data for block type "${type}": ${err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    }
    if (err instanceof Error) badInput(err.message);
    throw err;
  }
}

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

// FieldKind values are camelCase in TS ("longText") and SCREAMING_SNAKE in
// GraphQL ("LONG_TEXT"); this generically converts one to the other.
function toFieldKindEnum(kind: string): string {
  return kind.replace(/([A-Z])/g, "_$1").toUpperCase();
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

// Course ids the viewer may see: every course for a site superadmin, else
// whatever's been offered to their org (falling back off the session to
// any membership on record — see myCourses's own comment on why session's
// activeOrganizationId can't always be trusted to be set yet).
async function entitledCourseIds(ctx: GraphQLContext): Promise<string[] | "all"> {
  const user = requireUser(ctx);
  if (user.role === "admin") return "all";
  const orgId =
    ctx.session?.activeOrganizationId ??
    (await db.query.member.findFirst({ where: eq(member.userId, user.id) }))?.organizationId;
  if (!orgId) return [];
  const rows = await db.query.courseOrganization.findMany({ where: eq(courseOrganization.organizationId, orgId) });
  return rows.map((r) => r.courseId);
}

// Shapes a `widget` row (+ its joined categories) into the GraphQL Widget
// type, merging in CONTENT_BLOCK_REGISTRY's fields/schema by key — shared
// by the `widgets` query and the `updateWidget` mutation's return value.
function toWidgetPayload(
  row: { key: string; label: string; description: string | null; implemented: boolean },
  categories: Array<{ id: string; slug: string; label: string }>,
) {
  const registryEntry = CONTENT_BLOCK_REGISTRY.find((e) => e.type === row.key);
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    implemented: row.implemented && Boolean(registryEntry),
    categories,
    fields: registryEntry?.fields ?? [],
  };
}

// Every track, each scoped to just one course's lessons — `dropEmpty`
// controls whether a track with none of this course's lessons yet is kept
// (admin authoring, so "add the first lesson under an existing track"
// works for a brand-new course) or dropped (browsing views, where an empty
// track is just noise).
async function tracksForCourse(courseId: string, dropEmpty: boolean) {
  const allTracks = await db.query.track.findMany({
    orderBy: (t, { asc }) => asc(t.order),
    with: {
      lessons: { orderBy: (l, { asc }) => asc(l.order) },
      modules: { orderBy: (m, { asc }) => asc(m.order) },
    },
  });
  const scoped = allTracks.map((t) => ({ ...t, lessons: t.lessons.filter((l) => l.courseId === courseId) }));
  return dropEmpty ? scoped.filter((t) => t.lessons.length > 0) : scoped;
}

export const schema = createSchema<GraphQLContext>({
  typeDefs: /* GraphQL */ `
    scalar JSON

    type Query {
      health: String!
      me: User
      tracks(courseId: ID): [Track!]!
      courses: [Course!]!
      course(slug: String!): Course
      myCourses: [Course!]!
      lesson(slug: String!): Lesson
      myLessonProgress: [LessonProgress!]!
      myCodeSnapshot(lessonSlug: String!, exerciseId: String!): CodeSnapshot
      myQuizAttempt(lessonSlug: String!, quizId: String!): QuizAttempt
      adminLesson(id: ID!): Lesson
      adminTags: [Tag!]!
      widgets: [Widget!]!
      widgetCategories: [WidgetCategory!]!
      adminLessonLayouts: [LessonLayoutSpec!]!
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

      createCourse(slug: String!, title: String!, order: Int!): Course!
      updateCourse(id: ID!, slug: String, title: String, order: Int): Course!
      offerCourse(courseId: ID!, organizationId: ID!): Boolean!
      unofferCourse(courseId: ID!, organizationId: ID!): Boolean!

      createModule(trackId: ID!, slug: String!, title: String!, order: Int!): Module!
      updateModule(id: ID!, slug: String, title: String, order: Int): Module!
      deleteModule(id: ID!): Boolean!

      createLesson(
        courseId: ID!
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
        courseId: ID
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

      # No createWidget: a new widget always needs real code (a component +
      # field spec in CONTENT_BLOCK_REGISTRY) to be worth anything, so new
      # catalog rows still come from the seed script. Categories are pure
      # metadata, safe to manage here without touching code.
      updateWidget(key: ID!, label: String, description: String, implemented: Boolean, categoryIds: [ID!]): Widget!
      deleteWidget(key: ID!): Boolean!
      createWidgetCategory(slug: String!, label: String!): WidgetCategory!
      updateWidgetCategory(id: ID!, slug: String, label: String): WidgetCategory!
      deleteWidgetCategory(id: ID!): Boolean!

      suggestLessonQuestions(lessonSlug: String!): [String!]!
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

    """
    A top-level offering (e.g. "Quantum Computing"). Associates directly
    with lessons, not tracks — a track ("Math", "Qubits") can be reused
    across more than one course, so \`tracks\` here is derived from this
    course's lessons rather than a stored relation.
    """
    type Course {
      id: ID!
      slug: String!
      title: String!
      order: Int!
      tracks: [Track!]!
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
      course: Course!
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

    enum FieldKind {
      STRING
      LONG_TEXT
      MARKDOWN
      INLINE_MATH
      NUMBER
      BOOLEAN
      STRING_ARRAY
      NUMBER_ARRAY
      CIRCUIT
      QUIZ_CHOICES
      VISUALIZATION_VIEWS
      MATRIX_PRESETS
    }

    type ContentBlockFieldSpec {
      name: String!
      label: String!
      kind: FieldKind!
      required: Boolean!
    }

    type WidgetCategory {
      id: ID!
      slug: String!
      label: String!
    }

    """
    A catalog entry for an authorable content-block type. \`implemented:
    false\` means it's cataloged (so authors can browse/plan around it) but
    has no working component/field-spec yet — \`fields\` is empty and
    placing it renders a "not implemented yet" placeholder on the lesson.
    """
    type Widget {
      key: String!
      label: String!
      description: String
      implemented: Boolean!
      categories: [WidgetCategory!]!
      fields: [ContentBlockFieldSpec!]!
    }

    type LessonLayoutSpec {
      value: String!
      label: String!
    }
  `,
  resolvers: {
    JSON: JSONResolver,
    Query: {
      health: () => "ok",
      me: (_parent, _args, ctx) => ctx.user,
      // Requires login (see requireUser inside entitledCourseIds) — a
      // signed-out visitor can no longer browse course content at all;
      // this is also what the admin panel's AdminTracks query hits, which
      // is fine since a site superadmin's entitledCourseIds is "all".
      tracks: async (_parent, args: { courseId?: string }, ctx) => {
        if (args.courseId) {
          // Scoped to one course (admin's CourseDetailPage, or the
          // student-facing course-grouped home/sidebar via Course.tracks
          // below). requireCourseOffered has its own admin bypass; admins
          // keep empty tracks (so "add the first lesson" works on a
          // brand-new course), everyone else gets them dropped.
          const courseId = args.courseId;
          await requireCourseOffered(ctx, courseId);
          return tracksForCourse(courseId, ctx.user?.role !== "admin");
        }
        const allTracks = await db.query.track.findMany({
          orderBy: (t, { asc }) => asc(t.order),
          with: {
            lessons: { orderBy: (l, { asc }) => asc(l.order) },
            modules: { orderBy: (m, { asc }) => asc(m.order) },
          },
        });
        const courseIds = await entitledCourseIds(ctx);
        if (courseIds === "all") return allTracks;
        const allowed = new Set(courseIds);
        return allTracks
          .map((t) => ({ ...t, lessons: t.lessons.filter((l) => allowed.has(l.courseId)) }))
          .filter((t) => t.lessons.length > 0);
      },
      courses: () => db.query.course.findMany({ orderBy: (c, { asc }) => asc(c.order) }),
      course: (_parent, args: { slug: string }) => db.query.course.findFirst({ where: eq(course.slug, args.slug) }),
      myCourses: async (_parent, _args, ctx) => {
        const courseIds = await entitledCourseIds(ctx);
        if (courseIds === "all") return db.query.course.findMany({ orderBy: (c, { asc }) => asc(c.order) });
        if (courseIds.length === 0) return [];
        const rows = await db.query.course.findMany({ where: inArray(course.id, courseIds) });
        return rows.sort((a, b) => a.order - b.order);
      },
      lesson: async (_parent, args: { slug: string }, ctx) => {
        // Requires login (requireCourseOffered throws UNAUTHENTICATED via
        // requireUser for a signed-out visitor) — course content is no
        // longer publicly browsable at all.
        const row = await db.query.lesson.findFirst({
          where: eq(lesson.slug, args.slug),
          with: {
            course: true,
            track: true,
            module: true,
            tags: { with: { tag: true } },
            contentBlocks: { orderBy: (cb, { asc }) => asc(cb.order) },
            prerequisites: { with: { prerequisite: { with: { track: true } } } },
          },
        });
        if (row) await requireCourseOffered(ctx, row.courseId);
        return row;
      },
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
            course: true,
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
      widgets: async (_parent, _args, ctx) => {
        requireAdmin(ctx);
        const rows = await db.query.widget.findMany({
          orderBy: (w, { asc }) => asc(w.order),
          with: { categories: { with: { category: true } } },
        });
        return rows.map((row) => toWidgetPayload(row, row.categories.map((c) => c.category)));
      },
      widgetCategories: (_parent, _args, ctx) => {
        requireAdmin(ctx);
        return db.query.widgetCategory.findMany({ orderBy: (c, { asc }) => asc(c.label) });
      },
      adminLessonLayouts: (_parent, _args, ctx) => {
        requireAdmin(ctx);
        return LESSON_LAYOUTS;
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

      createCourse: async (_parent, args: { slug: string; title: string; order: number }, ctx) => {
        requireAdmin(ctx);
        const [row] = await db.insert(course).values(args).returning();
        return row;
      },
      updateCourse: async (
        _parent,
        args: { id: string; slug?: string; title?: string; order?: number },
        ctx,
      ) => {
        requireAdmin(ctx);
        const { id, ...rest } = args;
        const [row] = await db.update(course).set(pickDefined(rest)).where(eq(course.id, id)).returning();
        if (!row) throw new GraphQLError("Course not found.");
        return row;
      },
      offerCourse: async (_parent, args: { courseId: string; organizationId: string }, ctx) => {
        await requireOrgAdmin(ctx, args.organizationId);
        await db
          .insert(courseOrganization)
          .values({ courseId: args.courseId, organizationId: args.organizationId })
          .onConflictDoNothing();
        await ctx.authz.write({
          user: `organization:${args.organizationId}`,
          relation: "offered_to",
          object: `course:${args.courseId}`,
        });
        return true;
      },
      unofferCourse: async (_parent, args: { courseId: string; organizationId: string }, ctx) => {
        await requireOrgAdmin(ctx, args.organizationId);
        await db
          .delete(courseOrganization)
          .where(
            and(
              eq(courseOrganization.courseId, args.courseId),
              eq(courseOrganization.organizationId, args.organizationId),
            ),
          );
        await ctx.authz.delete({
          user: `organization:${args.organizationId}`,
          relation: "offered_to",
          object: `course:${args.courseId}`,
        });
        return true;
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
          courseId: string;
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
        validateLayout(args.layout);
        const [row] = await db
          .insert(lesson)
          .values({
            courseId: args.courseId,
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
          courseId?: string;
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
        if (args.layout !== undefined) validateLayout(args.layout);
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
            course: true,
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
            course: true,
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
        const data = validateBlockData(args.type, args.data);
        const [row] = await db.insert(contentBlock).values({ ...args, data }).returning();
        return row;
      },
      updateContentBlock: async (
        _parent,
        args: { id: string; order?: number; type?: string; data?: Record<string, unknown> },
        ctx,
      ) => {
        requireAdmin(ctx);
        const { id, ...rest } = args;
        if (rest.data !== undefined) {
          const existing = await db.query.contentBlock.findFirst({ where: eq(contentBlock.id, id) });
          if (!existing) throw new GraphQLError("Content block not found.");
          rest.data = validateBlockData(rest.type ?? existing.type, rest.data);
        }
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

      updateWidget: async (
        _parent,
        args: {
          key: string;
          label?: string;
          description?: string | null;
          implemented?: boolean;
          categoryIds?: string[];
        },
        ctx,
      ) => {
        requireAdmin(ctx);
        const existing = await db.query.widget.findFirst({ where: eq(widget.key, args.key) });
        if (!existing) throw new GraphQLError("Widget not found.");
        const { key, categoryIds, ...rest } = args;
        const set = pickDefined(rest);
        if (Object.keys(set).length > 0) {
          await db.update(widget).set(set).where(eq(widget.id, existing.id));
        }
        if (categoryIds !== undefined) {
          await db.transaction(async (tx) => {
            await tx.delete(widgetWidgetCategory).where(eq(widgetWidgetCategory.widgetId, existing.id));
            if (categoryIds.length > 0) {
              await tx
                .insert(widgetWidgetCategory)
                .values(categoryIds.map((categoryId) => ({ widgetId: existing.id, categoryId })));
            }
          });
        }
        const row = await db.query.widget.findFirst({
          where: eq(widget.id, existing.id),
          with: { categories: { with: { category: true } } },
        });
        if (!row) throw new GraphQLError("Widget not found.");
        return toWidgetPayload(row, row.categories.map((c) => c.category));
      },
      deleteWidget: async (_parent, args: { key: string }, ctx) => {
        requireAdmin(ctx);
        await db.delete(widget).where(eq(widget.key, args.key));
        return true;
      },
      createWidgetCategory: async (_parent, args: { slug: string; label: string }, ctx) => {
        requireAdmin(ctx);
        const [row] = await db.insert(widgetCategory).values(args).returning();
        return row;
      },
      updateWidgetCategory: async (_parent, args: { id: string; slug?: string; label?: string }, ctx) => {
        requireAdmin(ctx);
        const { id, ...rest } = args;
        const [row] = await db.update(widgetCategory).set(pickDefined(rest)).where(eq(widgetCategory.id, id)).returning();
        if (!row) throw new GraphQLError("Widget category not found.");
        return row;
      },
      deleteWidgetCategory: async (_parent, args: { id: string }, ctx) => {
        requireAdmin(ctx);
        await db.delete(widgetCategory).where(eq(widgetCategory.id, args.id));
        return true;
      },

      suggestLessonQuestions: async (_parent, args: { lessonSlug: string }, ctx) => {
        requireUser(ctx);
        const lessonContent = await getLessonMarkdownContent(args.lessonSlug);
        return suggestLessonQuestions(lessonContent);
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
    Course: {
      // Derived, not stored: the distinct tracks used by this course's
      // lessons — a track can belong to more than one course this way.
      // Entitlement-checked here (not just trusted from whichever query
      // produced this Course object) so this field is safe to select from
      // *any* query, including the unfiltered public `courses` listing —
      // it never leaks a non-entitled course's lesson content.
      tracks: async (parent: { id: string }, _args, ctx) => {
        await requireCourseOffered(ctx, parent.id);
        return tracksForCourse(parent.id, true);
      },
    },
    ContentBlockFieldSpec: {
      kind: (parent: { kind: string }) => toFieldKindEnum(parent.kind),
    },
  },
});
