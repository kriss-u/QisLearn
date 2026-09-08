import { graphqlRequest } from "../lib/graphqlClient";
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

export async function getTracks(): Promise<TrackGroup[]> {
  const data = await graphqlRequest<{ tracks: GraphQLTrack[] }>(TRACKS_QUERY);
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

export async function getAllLessons(): Promise<LessonSummary[]> {
  const tracks = await getTracks();
  return tracks.flatMap((track) => track.lessons).sort((a, b) => a.order - b.order);
}

export async function getNextLesson(id: string): Promise<LessonSummary | undefined> {
  const flat = await getAllLessons();
  const index = flat.findIndex((lesson) => lesson.id === id);
  return index >= 0 ? flat[index + 1] : undefined;
}

export async function getLesson(id: string): Promise<LessonDetail | undefined> {
  const data = await graphqlRequest<{ lesson: GraphQLLessonDetail | null }>(LESSON_QUERY, { slug: id });
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
