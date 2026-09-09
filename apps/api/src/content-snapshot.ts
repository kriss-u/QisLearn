import { eq, notInArray } from "drizzle-orm";
import {
  contentBlock,
  course,
  lesson,
  lessonPrerequisite,
  lessonTag,
  module_,
  tag,
  track,
  widget,
  widgetCategory,
  widgetWidgetCategory,
} from "@qislearn/db/schema";
import { db } from "./db.js";

// The full "content" model (course/track/module/lesson/content_block/tag/
// widget/widget_category) as a natural-key-keyed JSON document — everything
// a course-generic Postgres row references by uuid here instead references
// its slug/key, so a snapshot taken on one database is meaningful diffed or
// restored against another (uuids are per-database, slugs aren't). Excludes
// course_organization (entitlement) and every user-data table
// (lesson_progress/code_snapshot/quiz_attempt, better-auth's own tables) —
// this is "content", not "who has it" or "who's using it".
export interface ContentSnapshot {
  version: 1;
  courses: { slug: string; title: string; order: number }[];
  tracks: { slug: string; title: string; order: number }[];
  modules: { slug: string; trackSlug: string; title: string; order: number }[];
  tags: { slug: string; label: string }[];
  widgetCategories: { slug: string; label: string }[];
  widgets: {
    key: string;
    label: string;
    description: string | null;
    implemented: boolean;
    order: number;
    categorySlugs: string[];
  }[];
  lessons: {
    slug: string;
    courseSlug: string;
    trackSlug: string;
    moduleSlug: string | null;
    order: number;
    title: string;
    summary: string;
    layout: string;
    difficulty: string;
    estimatedMinutes: number;
    tagSlugs: string[];
    prerequisiteSlugs: string[];
    contentBlocks: { order: number; type: string; data: Record<string, unknown> }[];
  }[];
}

function byKey<T>(keyOf: (item: T) => string) {
  return (a: T, b: T) => keyOf(a).localeCompare(keyOf(b));
}

export async function buildContentSnapshot(): Promise<ContentSnapshot> {
  const [
    courses,
    tracks,
    modules,
    tags,
    categories,
    widgets,
    categoryLinks,
    lessons,
    lessonTags,
    lessonPrereqs,
    blocks,
  ] = await Promise.all([
    db.select().from(course),
    db.select().from(track),
    db.select().from(module_),
    db.select().from(tag),
    db.select().from(widgetCategory),
    db.select().from(widget),
    db.select().from(widgetWidgetCategory),
    db.select().from(lesson),
    db.select().from(lessonTag),
    db.select().from(lessonPrerequisite),
    db.select().from(contentBlock),
  ]);

  const courseSlugById = new Map(courses.map((c) => [c.id, c.slug]));
  const trackSlugById = new Map(tracks.map((t) => [t.id, t.slug]));
  const moduleSlugById = new Map(modules.map((m) => [m.id, m.slug]));
  const tagSlugById = new Map(tags.map((t) => [t.id, t.slug]));
  const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));
  const lessonSlugById = new Map(lessons.map((l) => [l.id, l.slug]));

  const categorySlugsByWidgetId = new Map<string, string[]>();
  for (const link of categoryLinks) {
    const slug = categorySlugById.get(link.categoryId);
    if (!slug) continue;
    categorySlugsByWidgetId.set(link.widgetId, [...(categorySlugsByWidgetId.get(link.widgetId) ?? []), slug]);
  }

  const tagSlugsByLessonId = new Map<string, string[]>();
  for (const lt of lessonTags) {
    const slug = tagSlugById.get(lt.tagId);
    if (!slug) continue;
    tagSlugsByLessonId.set(lt.lessonId, [...(tagSlugsByLessonId.get(lt.lessonId) ?? []), slug]);
  }

  const prerequisiteSlugsByLessonId = new Map<string, string[]>();
  for (const p of lessonPrereqs) {
    const slug = lessonSlugById.get(p.prerequisiteLessonId);
    if (!slug) continue;
    prerequisiteSlugsByLessonId.set(p.lessonId, [...(prerequisiteSlugsByLessonId.get(p.lessonId) ?? []), slug]);
  }

  const blocksByLessonId = new Map<string, (typeof blocks)[number][]>();
  for (const b of blocks) {
    blocksByLessonId.set(b.lessonId, [...(blocksByLessonId.get(b.lessonId) ?? []), b]);
  }

  return {
    version: 1,
    courses: courses.map((c) => ({ slug: c.slug, title: c.title, order: c.order })).sort(byKey((c) => c.slug)),
    tracks: tracks.map((t) => ({ slug: t.slug, title: t.title, order: t.order })).sort(byKey((t) => t.slug)),
    modules: modules
      .map((m) => ({ slug: m.slug, trackSlug: trackSlugById.get(m.trackId) ?? "", title: m.title, order: m.order }))
      .sort(byKey((m) => m.slug)),
    tags: tags.map((t) => ({ slug: t.slug, label: t.label })).sort(byKey((t) => t.slug)),
    widgetCategories: categories.map((c) => ({ slug: c.slug, label: c.label })).sort(byKey((c) => c.slug)),
    widgets: widgets
      .map((w) => ({
        key: w.key,
        label: w.label,
        description: w.description,
        implemented: w.implemented,
        order: w.order,
        categorySlugs: (categorySlugsByWidgetId.get(w.id) ?? []).sort(),
      }))
      .sort(byKey((w) => w.key)),
    lessons: lessons
      .map((l) => ({
        slug: l.slug,
        courseSlug: courseSlugById.get(l.courseId) ?? "",
        trackSlug: trackSlugById.get(l.trackId) ?? "",
        moduleSlug: l.moduleId ? (moduleSlugById.get(l.moduleId) ?? null) : null,
        order: l.order,
        title: l.title,
        summary: l.summary,
        layout: l.layout,
        difficulty: l.difficulty,
        estimatedMinutes: l.estimatedMinutes,
        tagSlugs: (tagSlugsByLessonId.get(l.id) ?? []).sort(),
        prerequisiteSlugs: (prerequisiteSlugsByLessonId.get(l.id) ?? []).sort(),
        contentBlocks: (blocksByLessonId.get(l.id) ?? [])
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((b) => ({ order: b.order, type: b.type, data: b.data })),
      }))
      .sort(byKey((l) => l.slug)),
  };
}

export interface EntityChange {
  entityType: "course" | "track" | "module" | "tag" | "widgetCategory" | "widget" | "lesson";
  key: string;
  change: "create" | "update" | "delete";
  before?: unknown;
  after?: unknown;
}

export interface SnapshotDiff {
  counts: Record<string, { create: number; update: number; delete: number; unchanged: number }>;
  changes: EntityChange[];
}

function diffList<T>(
  entityType: EntityChange["entityType"],
  keyOf: (item: T) => string,
  current: T[],
  incoming: T[],
  changes: EntityChange[],
  counts: SnapshotDiff["counts"],
) {
  const currentByKey = new Map(current.map((item) => [keyOf(item), item]));
  const incomingByKey = new Map(incoming.map((item) => [keyOf(item), item]));
  counts[entityType] = { create: 0, update: 0, delete: 0, unchanged: 0 };
  const tally = counts[entityType]!;

  for (const [key, item] of incomingByKey) {
    const existing = currentByKey.get(key);
    if (!existing) {
      changes.push({ entityType, key, change: "create", after: item });
      tally.create++;
    } else if (JSON.stringify(existing) !== JSON.stringify(item)) {
      changes.push({ entityType, key, change: "update", before: existing, after: item });
      tally.update++;
    } else {
      tally.unchanged++;
    }
  }
  for (const [key, item] of currentByKey) {
    if (!incomingByKey.has(key)) {
      changes.push({ entityType, key, change: "delete", before: item });
      tally.delete++;
    }
  }
}

export function diffContentSnapshot(current: ContentSnapshot, incoming: ContentSnapshot): SnapshotDiff {
  const changes: EntityChange[] = [];
  const counts: SnapshotDiff["counts"] = {};
  diffList("course", (c) => c.slug, current.courses, incoming.courses, changes, counts);
  diffList("track", (t) => t.slug, current.tracks, incoming.tracks, changes, counts);
  diffList("module", (m) => m.slug, current.modules, incoming.modules, changes, counts);
  diffList("tag", (t) => t.slug, current.tags, incoming.tags, changes, counts);
  diffList("widgetCategory", (c) => c.slug, current.widgetCategories, incoming.widgetCategories, changes, counts);
  diffList("widget", (w) => w.key, current.widgets, incoming.widgets, changes, counts);
  diffList("lesson", (l) => l.slug, current.lessons, incoming.lessons, changes, counts);
  return { counts, changes };
}

/** Throws with a clear message if `snapshot` references a slug it doesn't itself define. */
function validateSnapshot(snapshot: ContentSnapshot) {
  const courseSlugs = new Set(snapshot.courses.map((c) => c.slug));
  const trackSlugs = new Set(snapshot.tracks.map((t) => t.slug));
  const moduleSlugs = new Set(snapshot.modules.map((m) => m.slug));
  const tagSlugs = new Set(snapshot.tags.map((t) => t.slug));
  const categorySlugs = new Set(snapshot.widgetCategories.map((c) => c.slug));
  const lessonSlugs = new Set(snapshot.lessons.map((l) => l.slug));

  for (const m of snapshot.modules) {
    if (!trackSlugs.has(m.trackSlug)) throw new Error(`Module "${m.slug}" references unknown track "${m.trackSlug}".`);
  }
  for (const w of snapshot.widgets) {
    for (const cs of w.categorySlugs) {
      if (!categorySlugs.has(cs)) throw new Error(`Widget "${w.key}" references unknown category "${cs}".`);
    }
  }
  for (const l of snapshot.lessons) {
    if (!courseSlugs.has(l.courseSlug)) throw new Error(`Lesson "${l.slug}" references unknown course "${l.courseSlug}".`);
    if (!trackSlugs.has(l.trackSlug)) throw new Error(`Lesson "${l.slug}" references unknown track "${l.trackSlug}".`);
    if (l.moduleSlug && !moduleSlugs.has(l.moduleSlug)) {
      throw new Error(`Lesson "${l.slug}" references unknown module "${l.moduleSlug}".`);
    }
    for (const ts of l.tagSlugs) {
      if (!tagSlugs.has(ts)) throw new Error(`Lesson "${l.slug}" references unknown tag "${ts}".`);
    }
    for (const ps of l.prerequisiteSlugs) {
      if (!lessonSlugs.has(ps)) throw new Error(`Lesson "${l.slug}" references unknown prerequisite "${ps}".`);
    }
  }
}

/**
 * Applies `incoming` to the database: every entity in it is upserted by its
 * natural key (never by uuid — those are per-database). With `prune: true`,
 * anything NOT in `incoming` is also deleted (FK cascades take care of each
 * deleted row's own children — content_block/lesson_tag/lesson_prerequisite/
 * widget_widget_category). Without `prune`, restoring only ever adds/updates,
 * never removes — the safe default for "merge this snapshot in".
 *
 * Returns the diff between the database's state *before* this ran and
 * `incoming`, i.e. a summary of what this restore just did.
 */
export async function restoreContentSnapshot(
  incoming: ContentSnapshot,
  options: { prune: boolean },
): Promise<SnapshotDiff> {
  validateSnapshot(incoming);
  const before = await buildContentSnapshot();
  const diff = diffContentSnapshot(before, incoming);

  await db.transaction(async (tx) => {
    const courseIdBySlug = new Map<string, string>();
    for (const c of incoming.courses) {
      const [row] = await tx
        .insert(course)
        .values(c)
        .onConflictDoUpdate({ target: course.slug, set: { title: c.title, order: c.order } })
        .returning({ id: course.id, slug: course.slug });
      courseIdBySlug.set(row!.slug, row!.id);
    }

    const trackIdBySlug = new Map<string, string>();
    for (const t of incoming.tracks) {
      const [row] = await tx
        .insert(track)
        .values(t)
        .onConflictDoUpdate({ target: track.slug, set: { title: t.title, order: t.order } })
        .returning({ id: track.id, slug: track.slug });
      trackIdBySlug.set(row!.slug, row!.id);
    }

    const tagIdBySlug = new Map<string, string>();
    for (const t of incoming.tags) {
      const [row] = await tx
        .insert(tag)
        .values(t)
        .onConflictDoUpdate({ target: tag.slug, set: { label: t.label } })
        .returning({ id: tag.id, slug: tag.slug });
      tagIdBySlug.set(row!.slug, row!.id);
    }

    const categoryIdBySlug = new Map<string, string>();
    for (const c of incoming.widgetCategories) {
      const [row] = await tx
        .insert(widgetCategory)
        .values(c)
        .onConflictDoUpdate({ target: widgetCategory.slug, set: { label: c.label } })
        .returning({ id: widgetCategory.id, slug: widgetCategory.slug });
      categoryIdBySlug.set(row!.slug, row!.id);
    }

    const moduleIdBySlug = new Map<string, string>();
    for (const m of incoming.modules) {
      const trackId = trackIdBySlug.get(m.trackSlug)!;
      const [row] = await tx
        .insert(module_)
        .values({ slug: m.slug, trackId, title: m.title, order: m.order })
        .onConflictDoUpdate({ target: module_.slug, set: { trackId, title: m.title, order: m.order } })
        .returning({ id: module_.id, slug: module_.slug });
      moduleIdBySlug.set(row!.slug, row!.id);
    }

    const widgetIdByKey = new Map<string, string>();
    for (const w of incoming.widgets) {
      const [row] = await tx
        .insert(widget)
        .values({ key: w.key, label: w.label, description: w.description, implemented: w.implemented, order: w.order })
        .onConflictDoUpdate({
          target: widget.key,
          set: { label: w.label, description: w.description, implemented: w.implemented, order: w.order },
        })
        .returning({ id: widget.id, key: widget.key });
      widgetIdByKey.set(row!.key, row!.id);

      await tx.delete(widgetWidgetCategory).where(eq(widgetWidgetCategory.widgetId, row!.id));
      const categoryIds = w.categorySlugs.map((s) => categoryIdBySlug.get(s)!).filter(Boolean);
      if (categoryIds.length > 0) {
        await tx.insert(widgetWidgetCategory).values(categoryIds.map((categoryId) => ({ widgetId: row!.id, categoryId })));
      }
    }

    const lessonIdBySlug = new Map<string, string>();
    for (const l of incoming.lessons) {
      const [row] = await tx
        .insert(lesson)
        .values({
          slug: l.slug,
          courseId: courseIdBySlug.get(l.courseSlug)!,
          trackId: trackIdBySlug.get(l.trackSlug)!,
          moduleId: l.moduleSlug ? (moduleIdBySlug.get(l.moduleSlug) ?? null) : null,
          order: l.order,
          title: l.title,
          summary: l.summary,
          layout: l.layout,
          difficulty: l.difficulty,
          estimatedMinutes: l.estimatedMinutes,
        })
        .onConflictDoUpdate({
          target: lesson.slug,
          set: {
            courseId: courseIdBySlug.get(l.courseSlug)!,
            trackId: trackIdBySlug.get(l.trackSlug)!,
            moduleId: l.moduleSlug ? (moduleIdBySlug.get(l.moduleSlug) ?? null) : null,
            order: l.order,
            title: l.title,
            summary: l.summary,
            layout: l.layout,
            difficulty: l.difficulty,
            estimatedMinutes: l.estimatedMinutes,
          },
        })
        .returning({ id: lesson.id, slug: lesson.slug });
      lessonIdBySlug.set(row!.slug, row!.id);
    }

    for (const l of incoming.lessons) {
      const lessonId = lessonIdBySlug.get(l.slug)!;

      await tx.delete(lessonTag).where(eq(lessonTag.lessonId, lessonId));
      const tagIds = l.tagSlugs.map((s) => tagIdBySlug.get(s)!).filter(Boolean);
      if (tagIds.length > 0) {
        await tx.insert(lessonTag).values(tagIds.map((tagId) => ({ lessonId, tagId })));
      }

      await tx.delete(lessonPrerequisite).where(eq(lessonPrerequisite.lessonId, lessonId));
      const prereqIds = l.prerequisiteSlugs.map((s) => lessonIdBySlug.get(s)!).filter(Boolean);
      if (prereqIds.length > 0) {
        await tx
          .insert(lessonPrerequisite)
          .values(prereqIds.map((prerequisiteLessonId) => ({ lessonId, prerequisiteLessonId })));
      }

      await tx.delete(contentBlock).where(eq(contentBlock.lessonId, lessonId));
      if (l.contentBlocks.length > 0) {
        await tx.insert(contentBlock).values(l.contentBlocks.map((b) => ({ lessonId, order: b.order, type: b.type, data: b.data })));
      }
    }

    if (options.prune) {
      const keepLessonSlugs = incoming.lessons.map((l) => l.slug);
      await tx.delete(lesson).where(keepLessonSlugs.length > 0 ? notInArray(lesson.slug, keepLessonSlugs) : undefined);

      const keepModuleSlugs = incoming.modules.map((m) => m.slug);
      await tx.delete(module_).where(keepModuleSlugs.length > 0 ? notInArray(module_.slug, keepModuleSlugs) : undefined);

      const keepTrackSlugs = incoming.tracks.map((t) => t.slug);
      await tx.delete(track).where(keepTrackSlugs.length > 0 ? notInArray(track.slug, keepTrackSlugs) : undefined);

      const keepCourseSlugs = incoming.courses.map((c) => c.slug);
      await tx.delete(course).where(keepCourseSlugs.length > 0 ? notInArray(course.slug, keepCourseSlugs) : undefined);

      const keepTagSlugs = incoming.tags.map((t) => t.slug);
      await tx.delete(tag).where(keepTagSlugs.length > 0 ? notInArray(tag.slug, keepTagSlugs) : undefined);

      const keepWidgetKeys = incoming.widgets.map((w) => w.key);
      await tx.delete(widget).where(keepWidgetKeys.length > 0 ? notInArray(widget.key, keepWidgetKeys) : undefined);

      const keepCategorySlugs = incoming.widgetCategories.map((c) => c.slug);
      await tx
        .delete(widgetCategory)
        .where(keepCategorySlugs.length > 0 ? notInArray(widgetCategory.slug, keepCategorySlugs) : undefined);
    }
  });

  return diff;
}
