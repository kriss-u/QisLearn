import { graphqlRequest, GraphQLRequestError } from "../lib/graphqlClient";

export { GraphQLRequestError };
import type { LessonLayout } from "./schema";

export interface LessonSummary {
  id: string;
  title: string;
  summary: string;
  layout: LessonLayout;
  order: number;
  estimatedMinutes: number;
  track: string;
}

export interface TrackGroup {
  slug: string;
  title: string;
  order: number;
  lessons: LessonSummary[];
}

export interface CourseGroup {
  slug: string;
  title: string;
  order: number;
  tracks: TrackGroup[];
}

export interface ContentBlockData {
  id: string;
  order: number;
  type: string;
  data: Record<string, unknown>;
}

export interface LessonDetail extends LessonSummary {
  prerequisites: LessonSummary[];
  contentBlocks: ContentBlockData[];
}

const TRACKS_QUERY = /* GraphQL */ `
  query Tracks {
    tracks {
      slug
      title
      order
      lessons {
        slug
        title
        summary
        layout
        order
        estimatedMinutes
      }
    }
  }
`;

const COURSE_GROUPS_QUERY = /* GraphQL */ `
  query MyCourseGroups {
    myCourses {
      slug
      title
      order
      tracks {
        slug
        title
        order
        lessons {
          slug
          title
          summary
          layout
          order
          estimatedMinutes
        }
      }
    }
  }
`;

const MY_COURSE_LIST_QUERY = /* GraphQL */ `
  query MyCourseList {
    myCourses {
      slug
      title
      order
    }
  }
`;

const COURSE_GROUP_QUERY = /* GraphQL */ `
  query CourseGroup($slug: String!) {
    course(slug: $slug) {
      slug
      title
      order
      tracks {
        slug
        title
        order
        lessons {
          slug
          title
          summary
          layout
          order
          estimatedMinutes
        }
      }
    }
  }
`;

const LESSON_QUERY = /* GraphQL */ `
  query Lesson($slug: String!) {
    lesson(slug: $slug) {
      slug
      title
      summary
      layout
      order
      estimatedMinutes
      track {
        slug
      }
      prerequisites {
        slug
        title
        summary
        layout
        order
        estimatedMinutes
        track {
          slug
        }
      }
      contentBlocks {
        id
        order
        type
        data
      }
    }
  }
`;

interface GraphQLLessonSummary {
  slug: string;
  title: string;
  summary: string;
  layout: LessonLayout;
  order: number;
  estimatedMinutes: number;
}

interface GraphQLTrack {
  slug: string;
  title: string;
  order: number;
  lessons: GraphQLLessonSummary[];
}

interface GraphQLCourse {
  slug: string;
  title: string;
  order: number;
  tracks: GraphQLTrack[];
}

interface GraphQLLessonDetail extends GraphQLLessonSummary {
  track: { slug: string };
  prerequisites: Array<GraphQLLessonSummary & { track: { slug: string } }>;
  contentBlocks: ContentBlockData[];
}

function toLessonSummary(trackSlug: string, lesson: GraphQLLessonSummary): LessonSummary {
  return {
    id: lesson.slug,
    title: lesson.title,
    summary: lesson.summary,
    layout: lesson.layout,
    order: lesson.order,
    estimatedMinutes: lesson.estimatedMinutes,
    track: trackSlug,
  };
}

// `cookie`: the incoming SSR request's Cookie header, forwarded so apps/api
// can identify the viewer for course-entitlement filtering — see
// lib/graphqlClient.ts. Omit only for contexts with no request to read one
// from (there are none left after this change; every caller has a Request).
export async function getTracks(cookie?: string): Promise<TrackGroup[]> {
  const data = await graphqlRequest<{ tracks: GraphQLTrack[] }>(TRACKS_QUERY, undefined, { cookie });
  return data.tracks
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((track) => ({
      slug: track.slug,
      title: track.title,
      order: track.order,
      lessons: track.lessons.map((lesson) => toLessonSummary(track.slug, lesson)).sort((a, b) => a.order - b.order),
    }));
}

// Course-grouped view for the home page and sidebar nav (see AppShell) —
// unlike getTracks (flat, spans every entitled course combined with no
// indication of which course a lesson belongs to), this keeps courses as
// the top grouping level, matching the actual content model now that a
// track can be shared across more than one course.
export async function getCourseGroups(cookie?: string): Promise<CourseGroup[]> {
  const data = await graphqlRequest<{ myCourses: GraphQLCourse[] }>(COURSE_GROUPS_QUERY, undefined, { cookie });
  return data.myCourses
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((course) => ({
      slug: course.slug,
      title: course.title,
      order: course.order,
      tracks: course.tracks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((track) => ({
          slug: track.slug,
          title: track.title,
          order: track.order,
          lessons: track.lessons
            .map((lesson) => toLessonSummary(track.slug, lesson))
            .sort((a, b) => a.order - b.order),
        })),
    }));
}

export interface CourseListItem {
  slug: string;
  title: string;
  order: number;
}

// Lightweight — just enough for HomePage to decide what to render (redirect
// straight into the one course you have, or show a picker across several)
// without paying for every course's tracks/lessons up front.
export async function getMyCourseList(cookie?: string): Promise<CourseListItem[]> {
  const data = await graphqlRequest<{ myCourses: CourseListItem[] }>(MY_COURSE_LIST_QUERY, undefined, { cookie });
  return data.myCourses.slice().sort((a, b) => a.order - b.order);
}

// One course's full tracks/lessons — the actual "course home" a viewer
// lands on once they're down to a single course (see getMyCourseList).
// `Course.tracks` on the API side enforces entitlement itself, so this
// throws FORBIDDEN the same way getLesson does for a course that isn't
// offered to the viewer's org.
export async function getCourseGroup(slug: string, cookie?: string): Promise<CourseGroup | undefined> {
  const data = await graphqlRequest<{ course: GraphQLCourse | null }>(COURSE_GROUP_QUERY, { slug }, { cookie });
  const course = data.course;
  if (!course) return undefined;
  return {
    slug: course.slug,
    title: course.title,
    order: course.order,
    tracks: course.tracks
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((track) => ({
        slug: track.slug,
        title: track.title,
        order: track.order,
        lessons: track.lessons.map((lesson) => toLessonSummary(track.slug, lesson)).sort((a, b) => a.order - b.order),
      })),
  };
}

export async function getAllLessons(cookie?: string): Promise<LessonSummary[]> {
  const tracks = await getTracks(cookie);
  return tracks.flatMap((track) => track.lessons).sort((a, b) => a.order - b.order);
}

export async function getNextLesson(id: string, cookie?: string): Promise<LessonSummary | undefined> {
  const flat = await getAllLessons(cookie);
  const index = flat.findIndex((lesson) => lesson.id === id);
  return index >= 0 ? flat[index + 1] : undefined;
}

export async function getLesson(id: string, cookie?: string): Promise<LessonDetail | undefined> {
  const data = await graphqlRequest<{ lesson: GraphQLLessonDetail | null }>(LESSON_QUERY, { slug: id }, { cookie });
  const lesson = data.lesson;
  if (!lesson) return undefined;

  return {
    ...toLessonSummary(lesson.track.slug, lesson),
    prerequisites: lesson.prerequisites.map((p) => toLessonSummary(p.track.slug, p)),
    contentBlocks: lesson.contentBlocks,
  };
}

export type {
  Circuit,
  Gate,
  LessonFrontmatter,
  LessonLayout,
  QuizChoice,
  VisualizationView,
} from "./schema";
