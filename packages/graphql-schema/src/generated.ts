import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: Record<string, unknown>; output: Record<string, unknown>; }
};

export type CodeSnapshot = {
  __typename?: 'CodeSnapshot';
  code: Scalars['String']['output'];
  exerciseId: Scalars['String']['output'];
  lessonSlug: Scalars['String']['output'];
  resultMessages?: Maybe<Array<Scalars['String']['output']>>;
  resultOk?: Maybe<Scalars['Boolean']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type ContentBlock = {
  __typename?: 'ContentBlock';
  data: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type ContentBlockFieldSpec = {
  __typename?: 'ContentBlockFieldSpec';
  kind: FieldKind;
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  required: Scalars['Boolean']['output'];
};

/**
 * A top-level offering (e.g. "Quantum Computing"). Associates directly
 * with lessons, not tracks — a track ("Math", "Qubits") can be reused
 * across more than one course, so `tracks` here is derived from this
 * course's lessons rather than a stored relation.
 */
export type Course = {
  __typename?: 'Course';
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  tracks: Array<Track>;
};

export type FieldKind =
  | 'BOOLEAN'
  | 'CIRCUIT'
  | 'INLINE_MATH'
  | 'LONG_TEXT'
  | 'MARKDOWN'
  | 'MATRIX_PRESETS'
  | 'NUMBER'
  | 'NUMBER_ARRAY'
  | 'QUIZ_CHOICES'
  | 'STRING'
  | 'STRING_ARRAY'
  | 'VISUALIZATION_VIEWS';

export type Lesson = {
  __typename?: 'Lesson';
  contentBlocks: Array<ContentBlock>;
  course: Course;
  difficulty: LessonDifficulty;
  estimatedMinutes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  layout: Scalars['String']['output'];
  module?: Maybe<Module>;
  order: Scalars['Int']['output'];
  prerequisites: Array<Lesson>;
  slug: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  tags: Array<Tag>;
  title: Scalars['String']['output'];
  track: Track;
};

export type LessonDifficulty =
  | 'ADVANCED'
  | 'BEGINNER'
  | 'INTERMEDIATE';

export type LessonLayoutSpec = {
  __typename?: 'LessonLayoutSpec';
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type LessonProgress = {
  __typename?: 'LessonProgress';
  lessonSlug: Scalars['String']['output'];
  status: LessonStatus;
  updatedAt: Scalars['String']['output'];
};

export type LessonStatus =
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'NOT_STARTED';

export type Module = {
  __typename?: 'Module';
  id: Scalars['ID']['output'];
  lessons: Array<Lesson>;
  order: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createContentBlock: ContentBlock;
  createCourse: Course;
  createLesson: Lesson;
  createModule: Module;
  createTag: Tag;
  createTrack: Track;
  createWidgetCategory: WidgetCategory;
  deleteContentBlock: Scalars['Boolean']['output'];
  deleteLesson: Scalars['Boolean']['output'];
  deleteModule: Scalars['Boolean']['output'];
  deleteQuizAttempt: Scalars['Boolean']['output'];
  deleteWidget: Scalars['Boolean']['output'];
  deleteWidgetCategory: Scalars['Boolean']['output'];
  offerCourse: Scalars['Boolean']['output'];
  previewContentRestore: Scalars['JSON']['output'];
  resetMyProgress: Scalars['Boolean']['output'];
  restoreContentSnapshot: Scalars['JSON']['output'];
  saveCodeSnapshot: CodeSnapshot;
  saveQuizAttempt: QuizAttempt;
  setLessonProgress: LessonProgress;
  suggestLessonQuestions: Array<Scalars['String']['output']>;
  unofferCourse: Scalars['Boolean']['output'];
  updateContentBlock: ContentBlock;
  updateCourse: Course;
  updateLesson: Lesson;
  updateLessonPrerequisites: Lesson;
  updateLessonTags: Lesson;
  updateModule: Module;
  updateTrack: Track;
  updateWidget: Widget;
  updateWidgetCategory: WidgetCategory;
};


export type MutationCreateContentBlockArgs = {
  data: Scalars['JSON']['input'];
  lessonId: Scalars['ID']['input'];
  order: Scalars['Int']['input'];
  type: Scalars['String']['input'];
};


export type MutationCreateCourseArgs = {
  order: Scalars['Int']['input'];
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationCreateLessonArgs = {
  courseId: Scalars['ID']['input'];
  difficulty: LessonDifficulty;
  estimatedMinutes: Scalars['Int']['input'];
  layout: Scalars['String']['input'];
  moduleId?: InputMaybe<Scalars['ID']['input']>;
  order: Scalars['Int']['input'];
  slug: Scalars['String']['input'];
  summary: Scalars['String']['input'];
  title: Scalars['String']['input'];
  trackId: Scalars['ID']['input'];
};


export type MutationCreateModuleArgs = {
  order: Scalars['Int']['input'];
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
  trackId: Scalars['ID']['input'];
};


export type MutationCreateTagArgs = {
  label: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};


export type MutationCreateTrackArgs = {
  order: Scalars['Int']['input'];
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationCreateWidgetCategoryArgs = {
  label: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};


export type MutationDeleteContentBlockArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteLessonArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteModuleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteQuizAttemptArgs = {
  lessonSlug: Scalars['String']['input'];
  quizId: Scalars['String']['input'];
};


export type MutationDeleteWidgetArgs = {
  key: Scalars['ID']['input'];
};


export type MutationDeleteWidgetCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationOfferCourseArgs = {
  courseId: Scalars['ID']['input'];
  organizationId: Scalars['ID']['input'];
};


export type MutationPreviewContentRestoreArgs = {
  snapshot: Scalars['JSON']['input'];
};


export type MutationRestoreContentSnapshotArgs = {
  prune?: InputMaybe<Scalars['Boolean']['input']>;
  snapshot: Scalars['JSON']['input'];
};


export type MutationSaveCodeSnapshotArgs = {
  code: Scalars['String']['input'];
  exerciseId: Scalars['String']['input'];
  lessonSlug: Scalars['String']['input'];
  resultMessages?: InputMaybe<Array<Scalars['String']['input']>>;
  resultOk?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationSaveQuizAttemptArgs = {
  lessonSlug: Scalars['String']['input'];
  quizId: Scalars['String']['input'];
  selectedChoiceId: Scalars['String']['input'];
  submitted: Scalars['Boolean']['input'];
};


export type MutationSetLessonProgressArgs = {
  lessonSlug: Scalars['String']['input'];
  status: LessonStatus;
};


export type MutationSuggestLessonQuestionsArgs = {
  lessonSlug: Scalars['String']['input'];
};


export type MutationUnofferCourseArgs = {
  courseId: Scalars['ID']['input'];
  organizationId: Scalars['ID']['input'];
};


export type MutationUpdateContentBlockArgs = {
  data?: InputMaybe<Scalars['JSON']['input']>;
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCourseArgs = {
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateLessonArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  difficulty?: InputMaybe<LessonDifficulty>;
  estimatedMinutes?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  layout?: InputMaybe<Scalars['String']['input']>;
  moduleId?: InputMaybe<Scalars['ID']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  trackId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationUpdateLessonPrerequisitesArgs = {
  lessonId: Scalars['ID']['input'];
  prerequisiteLessonIds: Array<Scalars['ID']['input']>;
};


export type MutationUpdateLessonTagsArgs = {
  lessonId: Scalars['ID']['input'];
  tagIds: Array<Scalars['ID']['input']>;
};


export type MutationUpdateModuleArgs = {
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateTrackArgs = {
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateWidgetArgs = {
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  implemented?: InputMaybe<Scalars['Boolean']['input']>;
  key: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateWidgetCategoryArgs = {
  id: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  adminLesson?: Maybe<Lesson>;
  adminLessonLayouts: Array<LessonLayoutSpec>;
  adminTags: Array<Tag>;
  contentSnapshot: Scalars['JSON']['output'];
  course?: Maybe<Course>;
  courses: Array<Course>;
  health: Scalars['String']['output'];
  lesson?: Maybe<Lesson>;
  me?: Maybe<User>;
  myCodeSnapshot?: Maybe<CodeSnapshot>;
  myCourses: Array<Course>;
  myLessonProgress: Array<LessonProgress>;
  myQuizAttempt?: Maybe<QuizAttempt>;
  tracks: Array<Track>;
  widgetCategories: Array<WidgetCategory>;
  widgets: Array<Widget>;
};


export type QueryAdminLessonArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCourseArgs = {
  slug: Scalars['String']['input'];
};


export type QueryLessonArgs = {
  slug: Scalars['String']['input'];
};


export type QueryMyCodeSnapshotArgs = {
  exerciseId: Scalars['String']['input'];
  lessonSlug: Scalars['String']['input'];
};


export type QueryMyQuizAttemptArgs = {
  lessonSlug: Scalars['String']['input'];
  quizId: Scalars['String']['input'];
};


export type QueryTracksArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
};

export type QuizAttempt = {
  __typename?: 'QuizAttempt';
  lessonSlug: Scalars['String']['output'];
  quizId: Scalars['String']['output'];
  selectedChoiceId: Scalars['String']['output'];
  submitted: Scalars['Boolean']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type Track = {
  __typename?: 'Track';
  id: Scalars['ID']['output'];
  lessons: Array<Lesson>;
  modules: Array<Module>;
  order: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role?: Maybe<Scalars['String']['output']>;
};

/**
 * A catalog entry for an authorable content-block type. `implemented:
 * false` means it's cataloged (so authors can browse/plan around it) but
 * has no working component/field-spec yet — `fields` is empty and
 * placing it renders a "not implemented yet" placeholder on the lesson.
 */
export type Widget = {
  __typename?: 'Widget';
  categories: Array<WidgetCategory>;
  description?: Maybe<Scalars['String']['output']>;
  fields: Array<ContentBlockFieldSpec>;
  implemented: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type WidgetCategory = {
  __typename?: 'WidgetCategory';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type AdminTracksQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminTracksQuery = { __typename?: 'Query', tracks: Array<{ __typename?: 'Track', id: string, slug: string, title: string, order: number, modules: Array<{ __typename?: 'Module', id: string, slug: string, title: string, order: number }>, lessons: Array<{ __typename?: 'Lesson', id: string, slug: string, title: string, order: number, difficulty: LessonDifficulty }> }> };

export type AdminCourseTracksQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;


export type AdminCourseTracksQuery = { __typename?: 'Query', tracks: Array<{ __typename?: 'Track', id: string, slug: string, title: string, order: number, modules: Array<{ __typename?: 'Module', id: string, slug: string, title: string, order: number }>, lessons: Array<{ __typename?: 'Lesson', id: string, slug: string, title: string, order: number, difficulty: LessonDifficulty }> }> };

export type AdminCoursesQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminCoursesQuery = { __typename?: 'Query', courses: Array<{ __typename?: 'Course', id: string, slug: string, title: string, order: number }> };

export type AdminLessonQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminLessonQuery = { __typename?: 'Query', adminLesson?: { __typename?: 'Lesson', id: string, slug: string, title: string, summary: string, layout: string, difficulty: LessonDifficulty, order: number, estimatedMinutes: number, course: { __typename?: 'Course', id: string, slug: string, title: string }, track: { __typename?: 'Track', id: string, slug: string, title: string }, module?: { __typename?: 'Module', id: string, slug: string, title: string } | null, tags: Array<{ __typename?: 'Tag', id: string, slug: string, label: string }>, prerequisites: Array<{ __typename?: 'Lesson', id: string, slug: string, title: string }>, contentBlocks: Array<{ __typename?: 'ContentBlock', id: string, order: number, type: string, data: Record<string, unknown> }> } | null };

export type AdminTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminTagsQuery = { __typename?: 'Query', adminTags: Array<{ __typename?: 'Tag', id: string, slug: string, label: string }> };

export type WidgetsQueryVariables = Exact<{ [key: string]: never; }>;


export type WidgetsQuery = { __typename?: 'Query', widgets: Array<{ __typename?: 'Widget', key: string, label: string, description?: string | null, implemented: boolean, categories: Array<{ __typename?: 'WidgetCategory', id: string, slug: string, label: string }>, fields: Array<{ __typename?: 'ContentBlockFieldSpec', name: string, label: string, kind: FieldKind, required: boolean }> }> };

export type WidgetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type WidgetCategoriesQuery = { __typename?: 'Query', widgetCategories: Array<{ __typename?: 'WidgetCategory', id: string, slug: string, label: string }> };

export type AdminLessonLayoutsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminLessonLayoutsQuery = { __typename?: 'Query', adminLessonLayouts: Array<{ __typename?: 'LessonLayoutSpec', value: string, label: string }> };

export type CreateTrackMutationVariables = Exact<{
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
  order: Scalars['Int']['input'];
}>;


export type CreateTrackMutation = { __typename?: 'Mutation', createTrack: { __typename?: 'Track', id: string, slug: string, title: string, order: number } };

export type UpdateTrackMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateTrackMutation = { __typename?: 'Mutation', updateTrack: { __typename?: 'Track', id: string, slug: string, title: string, order: number } };

export type CreateCourseMutationVariables = Exact<{
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
  order: Scalars['Int']['input'];
}>;


export type CreateCourseMutation = { __typename?: 'Mutation', createCourse: { __typename?: 'Course', id: string, slug: string, title: string, order: number } };

export type UpdateCourseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateCourseMutation = { __typename?: 'Mutation', updateCourse: { __typename?: 'Course', id: string, slug: string, title: string, order: number } };

export type OfferCourseMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  organizationId: Scalars['ID']['input'];
}>;


export type OfferCourseMutation = { __typename?: 'Mutation', offerCourse: boolean };

export type UnofferCourseMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  organizationId: Scalars['ID']['input'];
}>;


export type UnofferCourseMutation = { __typename?: 'Mutation', unofferCourse: boolean };

export type CreateModuleMutationVariables = Exact<{
  trackId: Scalars['ID']['input'];
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
  order: Scalars['Int']['input'];
}>;


export type CreateModuleMutation = { __typename?: 'Mutation', createModule: { __typename?: 'Module', id: string, slug: string, title: string, order: number } };

export type UpdateModuleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateModuleMutation = { __typename?: 'Mutation', updateModule: { __typename?: 'Module', id: string, slug: string, title: string, order: number } };

export type DeleteModuleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteModuleMutation = { __typename?: 'Mutation', deleteModule: boolean };

export type CreateLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  trackId: Scalars['ID']['input'];
  moduleId?: InputMaybe<Scalars['ID']['input']>;
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
  summary: Scalars['String']['input'];
  layout: Scalars['String']['input'];
  difficulty: LessonDifficulty;
  order: Scalars['Int']['input'];
  estimatedMinutes: Scalars['Int']['input'];
}>;


export type CreateLessonMutation = { __typename?: 'Mutation', createLesson: { __typename?: 'Lesson', id: string, slug: string } };

export type UpdateLessonMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  courseId?: InputMaybe<Scalars['ID']['input']>;
  trackId?: InputMaybe<Scalars['ID']['input']>;
  moduleId?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  layout?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<LessonDifficulty>;
  order?: InputMaybe<Scalars['Int']['input']>;
  estimatedMinutes?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateLessonMutation = { __typename?: 'Mutation', updateLesson: { __typename?: 'Lesson', id: string, slug: string, title: string, summary: string, layout: string, difficulty: LessonDifficulty, order: number, estimatedMinutes: number } };

export type DeleteLessonMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteLessonMutation = { __typename?: 'Mutation', deleteLesson: boolean };

export type UpdateLessonPrerequisitesMutationVariables = Exact<{
  lessonId: Scalars['ID']['input'];
  prerequisiteLessonIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type UpdateLessonPrerequisitesMutation = { __typename?: 'Mutation', updateLessonPrerequisites: { __typename?: 'Lesson', id: string, prerequisites: Array<{ __typename?: 'Lesson', id: string, title: string }> } };

export type CreateTagMutationVariables = Exact<{
  slug: Scalars['String']['input'];
  label: Scalars['String']['input'];
}>;


export type CreateTagMutation = { __typename?: 'Mutation', createTag: { __typename?: 'Tag', id: string, slug: string, label: string } };

export type UpdateLessonTagsMutationVariables = Exact<{
  lessonId: Scalars['ID']['input'];
  tagIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type UpdateLessonTagsMutation = { __typename?: 'Mutation', updateLessonTags: { __typename?: 'Lesson', id: string, tags: Array<{ __typename?: 'Tag', id: string, slug: string, label: string }> } };

export type CreateContentBlockMutationVariables = Exact<{
  lessonId: Scalars['ID']['input'];
  order: Scalars['Int']['input'];
  type: Scalars['String']['input'];
  data: Scalars['JSON']['input'];
}>;


export type CreateContentBlockMutation = { __typename?: 'Mutation', createContentBlock: { __typename?: 'ContentBlock', id: string, order: number, type: string, data: Record<string, unknown> } };

export type UpdateContentBlockMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<Scalars['JSON']['input']>;
}>;


export type UpdateContentBlockMutation = { __typename?: 'Mutation', updateContentBlock: { __typename?: 'ContentBlock', id: string, order: number, type: string, data: Record<string, unknown> } };

export type DeleteContentBlockMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteContentBlockMutation = { __typename?: 'Mutation', deleteContentBlock: boolean };

export type UpdateWidgetMutationVariables = Exact<{
  key: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  implemented?: InputMaybe<Scalars['Boolean']['input']>;
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type UpdateWidgetMutation = { __typename?: 'Mutation', updateWidget: { __typename?: 'Widget', key: string, label: string, description?: string | null, implemented: boolean, categories: Array<{ __typename?: 'WidgetCategory', id: string, slug: string, label: string }> } };

export type DeleteWidgetMutationVariables = Exact<{
  key: Scalars['ID']['input'];
}>;


export type DeleteWidgetMutation = { __typename?: 'Mutation', deleteWidget: boolean };

export type CreateWidgetCategoryMutationVariables = Exact<{
  slug: Scalars['String']['input'];
  label: Scalars['String']['input'];
}>;


export type CreateWidgetCategoryMutation = { __typename?: 'Mutation', createWidgetCategory: { __typename?: 'WidgetCategory', id: string, slug: string, label: string } };

export type UpdateWidgetCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateWidgetCategoryMutation = { __typename?: 'Mutation', updateWidgetCategory: { __typename?: 'WidgetCategory', id: string, slug: string, label: string } };

export type DeleteWidgetCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteWidgetCategoryMutation = { __typename?: 'Mutation', deleteWidgetCategory: boolean };

export type ContentSnapshotQueryVariables = Exact<{ [key: string]: never; }>;


export type ContentSnapshotQuery = { __typename?: 'Query', contentSnapshot: Record<string, unknown> };

export type PreviewContentRestoreMutationVariables = Exact<{
  snapshot: Scalars['JSON']['input'];
}>;


export type PreviewContentRestoreMutation = { __typename?: 'Mutation', previewContentRestore: Record<string, unknown> };

export type RestoreContentSnapshotMutationVariables = Exact<{
  snapshot: Scalars['JSON']['input'];
  prune?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type RestoreContentSnapshotMutation = { __typename?: 'Mutation', restoreContentSnapshot: Record<string, unknown> };

export type MyCodeSnapshotQueryVariables = Exact<{
  lessonSlug: Scalars['String']['input'];
  exerciseId: Scalars['String']['input'];
}>;


export type MyCodeSnapshotQuery = { __typename?: 'Query', myCodeSnapshot?: { __typename?: 'CodeSnapshot', lessonSlug: string, exerciseId: string, code: string, resultOk?: boolean | null, resultMessages?: Array<string> | null, updatedAt: string } | null };

export type SaveCodeSnapshotMutationVariables = Exact<{
  lessonSlug: Scalars['String']['input'];
  exerciseId: Scalars['String']['input'];
  code: Scalars['String']['input'];
  resultOk?: InputMaybe<Scalars['Boolean']['input']>;
  resultMessages?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type SaveCodeSnapshotMutation = { __typename?: 'Mutation', saveCodeSnapshot: { __typename?: 'CodeSnapshot', lessonSlug: string, exerciseId: string, code: string, resultOk?: boolean | null, resultMessages?: Array<string> | null, updatedAt: string } };

export type CoursesQueryVariables = Exact<{ [key: string]: never; }>;


export type CoursesQuery = { __typename?: 'Query', courses: Array<{ __typename?: 'Course', id: string, slug: string, title: string, order: number }> };

export type MyCoursesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCoursesQuery = { __typename?: 'Query', myCourses: Array<{ __typename?: 'Course', id: string, slug: string, title: string, order: number }> };

export type MyCourseGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCourseGroupsQuery = { __typename?: 'Query', myCourses: Array<{ __typename?: 'Course', id: string, slug: string, title: string, order: number, tracks: Array<{ __typename?: 'Track', id: string, slug: string, title: string, order: number, lessons: Array<{ __typename?: 'Lesson', id: string, slug: string, title: string, summary: string, layout: string, order: number, estimatedMinutes: number }> }> }> };

export type LessonQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type LessonQuery = { __typename?: 'Query', lesson?: { __typename?: 'Lesson', slug: string, title: string, summary: string, layout: string, order: number, estimatedMinutes: number, track: { __typename?: 'Track', slug: string }, prerequisites: Array<{ __typename?: 'Lesson', slug: string, title: string, summary: string, layout: string, order: number, estimatedMinutes: number, track: { __typename?: 'Track', slug: string } }>, contentBlocks: Array<{ __typename?: 'ContentBlock', id: string, order: number, type: string, data: Record<string, unknown> }> } | null };

export type SuggestLessonQuestionsMutationVariables = Exact<{
  lessonSlug: Scalars['String']['input'];
}>;


export type SuggestLessonQuestionsMutation = { __typename?: 'Mutation', suggestLessonQuestions: Array<string> };

export type MyQuizAttemptQueryVariables = Exact<{
  lessonSlug: Scalars['String']['input'];
  quizId: Scalars['String']['input'];
}>;


export type MyQuizAttemptQuery = { __typename?: 'Query', myQuizAttempt?: { __typename?: 'QuizAttempt', lessonSlug: string, quizId: string, selectedChoiceId: string, submitted: boolean, updatedAt: string } | null };

export type SaveQuizAttemptMutationVariables = Exact<{
  lessonSlug: Scalars['String']['input'];
  quizId: Scalars['String']['input'];
  selectedChoiceId: Scalars['String']['input'];
  submitted: Scalars['Boolean']['input'];
}>;


export type SaveQuizAttemptMutation = { __typename?: 'Mutation', saveQuizAttempt: { __typename?: 'QuizAttempt', lessonSlug: string, quizId: string, selectedChoiceId: string, submitted: boolean, updatedAt: string } };

export type DeleteQuizAttemptMutationVariables = Exact<{
  lessonSlug: Scalars['String']['input'];
  quizId: Scalars['String']['input'];
}>;


export type DeleteQuizAttemptMutation = { __typename?: 'Mutation', deleteQuizAttempt: boolean };

export type TracksQueryVariables = Exact<{ [key: string]: never; }>;


export type TracksQuery = { __typename?: 'Query', tracks: Array<{ __typename?: 'Track', slug: string, title: string, order: number, lessons: Array<{ __typename?: 'Lesson', slug: string, title: string, summary: string, layout: string, order: number, estimatedMinutes: number }> }> };

export type MyLessonProgressQueryVariables = Exact<{ [key: string]: never; }>;


export type MyLessonProgressQuery = { __typename?: 'Query', myLessonProgress: Array<{ __typename?: 'LessonProgress', lessonSlug: string, status: LessonStatus, updatedAt: string }> };

export type SetLessonProgressMutationVariables = Exact<{
  lessonSlug: Scalars['String']['input'];
  status: LessonStatus;
}>;


export type SetLessonProgressMutation = { __typename?: 'Mutation', setLessonProgress: { __typename?: 'LessonProgress', lessonSlug: string, status: LessonStatus, updatedAt: string } };

export type ResetMyProgressMutationVariables = Exact<{ [key: string]: never; }>;


export type ResetMyProgressMutation = { __typename?: 'Mutation', resetMyProgress: boolean };


export const AdminTracksDocument = gql`
    query AdminTracks {
  tracks {
    id
    slug
    title
    order
    modules {
      id
      slug
      title
      order
    }
    lessons {
      id
      slug
      title
      order
      difficulty
    }
  }
}
    `;

/**
 * __useAdminTracksQuery__
 *
 * To run a query within a React component, call `useAdminTracksQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminTracksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminTracksQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminTracksQuery(baseOptions?: Apollo.QueryHookOptions<AdminTracksQuery, AdminTracksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminTracksQuery, AdminTracksQueryVariables>(AdminTracksDocument, options);
      }
export function useAdminTracksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminTracksQuery, AdminTracksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminTracksQuery, AdminTracksQueryVariables>(AdminTracksDocument, options);
        }
// @ts-ignore
export function useAdminTracksSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AdminTracksQuery, AdminTracksQueryVariables>): Apollo.UseSuspenseQueryResult<AdminTracksQuery, AdminTracksQueryVariables>;
export function useAdminTracksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminTracksQuery, AdminTracksQueryVariables>): Apollo.UseSuspenseQueryResult<AdminTracksQuery | undefined, AdminTracksQueryVariables>;
export function useAdminTracksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminTracksQuery, AdminTracksQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AdminTracksQuery, AdminTracksQueryVariables>(AdminTracksDocument, options);
        }
export type AdminTracksQueryHookResult = ReturnType<typeof useAdminTracksQuery>;
export type AdminTracksLazyQueryHookResult = ReturnType<typeof useAdminTracksLazyQuery>;
export type AdminTracksSuspenseQueryHookResult = ReturnType<typeof useAdminTracksSuspenseQuery>;
export type AdminTracksQueryResult = Apollo.QueryResult<AdminTracksQuery, AdminTracksQueryVariables>;
export const AdminCourseTracksDocument = gql`
    query AdminCourseTracks($courseId: ID!) {
  tracks(courseId: $courseId) {
    id
    slug
    title
    order
    modules {
      id
      slug
      title
      order
    }
    lessons {
      id
      slug
      title
      order
      difficulty
    }
  }
}
    `;

/**
 * __useAdminCourseTracksQuery__
 *
 * To run a query within a React component, call `useAdminCourseTracksQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminCourseTracksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminCourseTracksQuery({
 *   variables: {
 *      courseId: // value for 'courseId'
 *   },
 * });
 */
export function useAdminCourseTracksQuery(baseOptions: Apollo.QueryHookOptions<AdminCourseTracksQuery, AdminCourseTracksQueryVariables> & ({ variables: AdminCourseTracksQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminCourseTracksQuery, AdminCourseTracksQueryVariables>(AdminCourseTracksDocument, options);
      }
export function useAdminCourseTracksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminCourseTracksQuery, AdminCourseTracksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminCourseTracksQuery, AdminCourseTracksQueryVariables>(AdminCourseTracksDocument, options);
        }
// @ts-ignore
export function useAdminCourseTracksSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AdminCourseTracksQuery, AdminCourseTracksQueryVariables>): Apollo.UseSuspenseQueryResult<AdminCourseTracksQuery, AdminCourseTracksQueryVariables>;
export function useAdminCourseTracksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminCourseTracksQuery, AdminCourseTracksQueryVariables>): Apollo.UseSuspenseQueryResult<AdminCourseTracksQuery | undefined, AdminCourseTracksQueryVariables>;
export function useAdminCourseTracksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminCourseTracksQuery, AdminCourseTracksQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AdminCourseTracksQuery, AdminCourseTracksQueryVariables>(AdminCourseTracksDocument, options);
        }
export type AdminCourseTracksQueryHookResult = ReturnType<typeof useAdminCourseTracksQuery>;
export type AdminCourseTracksLazyQueryHookResult = ReturnType<typeof useAdminCourseTracksLazyQuery>;
export type AdminCourseTracksSuspenseQueryHookResult = ReturnType<typeof useAdminCourseTracksSuspenseQuery>;
export type AdminCourseTracksQueryResult = Apollo.QueryResult<AdminCourseTracksQuery, AdminCourseTracksQueryVariables>;
export const AdminCoursesDocument = gql`
    query AdminCourses {
  courses {
    id
    slug
    title
    order
  }
}
    `;

/**
 * __useAdminCoursesQuery__
 *
 * To run a query within a React component, call `useAdminCoursesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminCoursesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminCoursesQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminCoursesQuery(baseOptions?: Apollo.QueryHookOptions<AdminCoursesQuery, AdminCoursesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminCoursesQuery, AdminCoursesQueryVariables>(AdminCoursesDocument, options);
      }
export function useAdminCoursesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminCoursesQuery, AdminCoursesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminCoursesQuery, AdminCoursesQueryVariables>(AdminCoursesDocument, options);
        }
// @ts-ignore
export function useAdminCoursesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AdminCoursesQuery, AdminCoursesQueryVariables>): Apollo.UseSuspenseQueryResult<AdminCoursesQuery, AdminCoursesQueryVariables>;
export function useAdminCoursesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminCoursesQuery, AdminCoursesQueryVariables>): Apollo.UseSuspenseQueryResult<AdminCoursesQuery | undefined, AdminCoursesQueryVariables>;
export function useAdminCoursesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminCoursesQuery, AdminCoursesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AdminCoursesQuery, AdminCoursesQueryVariables>(AdminCoursesDocument, options);
        }
export type AdminCoursesQueryHookResult = ReturnType<typeof useAdminCoursesQuery>;
export type AdminCoursesLazyQueryHookResult = ReturnType<typeof useAdminCoursesLazyQuery>;
export type AdminCoursesSuspenseQueryHookResult = ReturnType<typeof useAdminCoursesSuspenseQuery>;
export type AdminCoursesQueryResult = Apollo.QueryResult<AdminCoursesQuery, AdminCoursesQueryVariables>;
export const AdminLessonDocument = gql`
    query AdminLesson($id: ID!) {
  adminLesson(id: $id) {
    id
    slug
    title
    summary
    layout
    difficulty
    order
    estimatedMinutes
    course {
      id
      slug
      title
    }
    track {
      id
      slug
      title
    }
    module {
      id
      slug
      title
    }
    tags {
      id
      slug
      label
    }
    prerequisites {
      id
      slug
      title
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

/**
 * __useAdminLessonQuery__
 *
 * To run a query within a React component, call `useAdminLessonQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminLessonQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminLessonQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAdminLessonQuery(baseOptions: Apollo.QueryHookOptions<AdminLessonQuery, AdminLessonQueryVariables> & ({ variables: AdminLessonQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminLessonQuery, AdminLessonQueryVariables>(AdminLessonDocument, options);
      }
export function useAdminLessonLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminLessonQuery, AdminLessonQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminLessonQuery, AdminLessonQueryVariables>(AdminLessonDocument, options);
        }
// @ts-ignore
export function useAdminLessonSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AdminLessonQuery, AdminLessonQueryVariables>): Apollo.UseSuspenseQueryResult<AdminLessonQuery, AdminLessonQueryVariables>;
export function useAdminLessonSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminLessonQuery, AdminLessonQueryVariables>): Apollo.UseSuspenseQueryResult<AdminLessonQuery | undefined, AdminLessonQueryVariables>;
export function useAdminLessonSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminLessonQuery, AdminLessonQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AdminLessonQuery, AdminLessonQueryVariables>(AdminLessonDocument, options);
        }
export type AdminLessonQueryHookResult = ReturnType<typeof useAdminLessonQuery>;
export type AdminLessonLazyQueryHookResult = ReturnType<typeof useAdminLessonLazyQuery>;
export type AdminLessonSuspenseQueryHookResult = ReturnType<typeof useAdminLessonSuspenseQuery>;
export type AdminLessonQueryResult = Apollo.QueryResult<AdminLessonQuery, AdminLessonQueryVariables>;
export const AdminTagsDocument = gql`
    query AdminTags {
  adminTags {
    id
    slug
    label
  }
}
    `;

/**
 * __useAdminTagsQuery__
 *
 * To run a query within a React component, call `useAdminTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminTagsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminTagsQuery(baseOptions?: Apollo.QueryHookOptions<AdminTagsQuery, AdminTagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminTagsQuery, AdminTagsQueryVariables>(AdminTagsDocument, options);
      }
export function useAdminTagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminTagsQuery, AdminTagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminTagsQuery, AdminTagsQueryVariables>(AdminTagsDocument, options);
        }
// @ts-ignore
export function useAdminTagsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AdminTagsQuery, AdminTagsQueryVariables>): Apollo.UseSuspenseQueryResult<AdminTagsQuery, AdminTagsQueryVariables>;
export function useAdminTagsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminTagsQuery, AdminTagsQueryVariables>): Apollo.UseSuspenseQueryResult<AdminTagsQuery | undefined, AdminTagsQueryVariables>;
export function useAdminTagsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminTagsQuery, AdminTagsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AdminTagsQuery, AdminTagsQueryVariables>(AdminTagsDocument, options);
        }
export type AdminTagsQueryHookResult = ReturnType<typeof useAdminTagsQuery>;
export type AdminTagsLazyQueryHookResult = ReturnType<typeof useAdminTagsLazyQuery>;
export type AdminTagsSuspenseQueryHookResult = ReturnType<typeof useAdminTagsSuspenseQuery>;
export type AdminTagsQueryResult = Apollo.QueryResult<AdminTagsQuery, AdminTagsQueryVariables>;
export const WidgetsDocument = gql`
    query Widgets {
  widgets {
    key
    label
    description
    implemented
    categories {
      id
      slug
      label
    }
    fields {
      name
      label
      kind
      required
    }
  }
}
    `;

/**
 * __useWidgetsQuery__
 *
 * To run a query within a React component, call `useWidgetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useWidgetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWidgetsQuery({
 *   variables: {
 *   },
 * });
 */
export function useWidgetsQuery(baseOptions?: Apollo.QueryHookOptions<WidgetsQuery, WidgetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WidgetsQuery, WidgetsQueryVariables>(WidgetsDocument, options);
      }
export function useWidgetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WidgetsQuery, WidgetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WidgetsQuery, WidgetsQueryVariables>(WidgetsDocument, options);
        }
// @ts-ignore
export function useWidgetsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<WidgetsQuery, WidgetsQueryVariables>): Apollo.UseSuspenseQueryResult<WidgetsQuery, WidgetsQueryVariables>;
export function useWidgetsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WidgetsQuery, WidgetsQueryVariables>): Apollo.UseSuspenseQueryResult<WidgetsQuery | undefined, WidgetsQueryVariables>;
export function useWidgetsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WidgetsQuery, WidgetsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WidgetsQuery, WidgetsQueryVariables>(WidgetsDocument, options);
        }
export type WidgetsQueryHookResult = ReturnType<typeof useWidgetsQuery>;
export type WidgetsLazyQueryHookResult = ReturnType<typeof useWidgetsLazyQuery>;
export type WidgetsSuspenseQueryHookResult = ReturnType<typeof useWidgetsSuspenseQuery>;
export type WidgetsQueryResult = Apollo.QueryResult<WidgetsQuery, WidgetsQueryVariables>;
export const WidgetCategoriesDocument = gql`
    query WidgetCategories {
  widgetCategories {
    id
    slug
    label
  }
}
    `;

/**
 * __useWidgetCategoriesQuery__
 *
 * To run a query within a React component, call `useWidgetCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useWidgetCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWidgetCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useWidgetCategoriesQuery(baseOptions?: Apollo.QueryHookOptions<WidgetCategoriesQuery, WidgetCategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WidgetCategoriesQuery, WidgetCategoriesQueryVariables>(WidgetCategoriesDocument, options);
      }
export function useWidgetCategoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WidgetCategoriesQuery, WidgetCategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WidgetCategoriesQuery, WidgetCategoriesQueryVariables>(WidgetCategoriesDocument, options);
        }
// @ts-ignore
export function useWidgetCategoriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<WidgetCategoriesQuery, WidgetCategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<WidgetCategoriesQuery, WidgetCategoriesQueryVariables>;
export function useWidgetCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WidgetCategoriesQuery, WidgetCategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<WidgetCategoriesQuery | undefined, WidgetCategoriesQueryVariables>;
export function useWidgetCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WidgetCategoriesQuery, WidgetCategoriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WidgetCategoriesQuery, WidgetCategoriesQueryVariables>(WidgetCategoriesDocument, options);
        }
export type WidgetCategoriesQueryHookResult = ReturnType<typeof useWidgetCategoriesQuery>;
export type WidgetCategoriesLazyQueryHookResult = ReturnType<typeof useWidgetCategoriesLazyQuery>;
export type WidgetCategoriesSuspenseQueryHookResult = ReturnType<typeof useWidgetCategoriesSuspenseQuery>;
export type WidgetCategoriesQueryResult = Apollo.QueryResult<WidgetCategoriesQuery, WidgetCategoriesQueryVariables>;
export const AdminLessonLayoutsDocument = gql`
    query AdminLessonLayouts {
  adminLessonLayouts {
    value
    label
  }
}
    `;

/**
 * __useAdminLessonLayoutsQuery__
 *
 * To run a query within a React component, call `useAdminLessonLayoutsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminLessonLayoutsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminLessonLayoutsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminLessonLayoutsQuery(baseOptions?: Apollo.QueryHookOptions<AdminLessonLayoutsQuery, AdminLessonLayoutsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminLessonLayoutsQuery, AdminLessonLayoutsQueryVariables>(AdminLessonLayoutsDocument, options);
      }
export function useAdminLessonLayoutsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminLessonLayoutsQuery, AdminLessonLayoutsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminLessonLayoutsQuery, AdminLessonLayoutsQueryVariables>(AdminLessonLayoutsDocument, options);
        }
// @ts-ignore
export function useAdminLessonLayoutsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AdminLessonLayoutsQuery, AdminLessonLayoutsQueryVariables>): Apollo.UseSuspenseQueryResult<AdminLessonLayoutsQuery, AdminLessonLayoutsQueryVariables>;
export function useAdminLessonLayoutsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminLessonLayoutsQuery, AdminLessonLayoutsQueryVariables>): Apollo.UseSuspenseQueryResult<AdminLessonLayoutsQuery | undefined, AdminLessonLayoutsQueryVariables>;
export function useAdminLessonLayoutsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminLessonLayoutsQuery, AdminLessonLayoutsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AdminLessonLayoutsQuery, AdminLessonLayoutsQueryVariables>(AdminLessonLayoutsDocument, options);
        }
export type AdminLessonLayoutsQueryHookResult = ReturnType<typeof useAdminLessonLayoutsQuery>;
export type AdminLessonLayoutsLazyQueryHookResult = ReturnType<typeof useAdminLessonLayoutsLazyQuery>;
export type AdminLessonLayoutsSuspenseQueryHookResult = ReturnType<typeof useAdminLessonLayoutsSuspenseQuery>;
export type AdminLessonLayoutsQueryResult = Apollo.QueryResult<AdminLessonLayoutsQuery, AdminLessonLayoutsQueryVariables>;
export const CreateTrackDocument = gql`
    mutation CreateTrack($slug: String!, $title: String!, $order: Int!) {
  createTrack(slug: $slug, title: $title, order: $order) {
    id
    slug
    title
    order
  }
}
    `;
export type CreateTrackMutationFn = Apollo.MutationFunction<CreateTrackMutation, CreateTrackMutationVariables>;

/**
 * __useCreateTrackMutation__
 *
 * To run a mutation, you first call `useCreateTrackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTrackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTrackMutation, { data, loading, error }] = useCreateTrackMutation({
 *   variables: {
 *      slug: // value for 'slug'
 *      title: // value for 'title'
 *      order: // value for 'order'
 *   },
 * });
 */
export function useCreateTrackMutation(baseOptions?: Apollo.MutationHookOptions<CreateTrackMutation, CreateTrackMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTrackMutation, CreateTrackMutationVariables>(CreateTrackDocument, options);
      }
export type CreateTrackMutationHookResult = ReturnType<typeof useCreateTrackMutation>;
export type CreateTrackMutationResult = Apollo.MutationResult<CreateTrackMutation>;
export type CreateTrackMutationOptions = Apollo.BaseMutationOptions<CreateTrackMutation, CreateTrackMutationVariables>;
export const UpdateTrackDocument = gql`
    mutation UpdateTrack($id: ID!, $slug: String, $title: String, $order: Int) {
  updateTrack(id: $id, slug: $slug, title: $title, order: $order) {
    id
    slug
    title
    order
  }
}
    `;
export type UpdateTrackMutationFn = Apollo.MutationFunction<UpdateTrackMutation, UpdateTrackMutationVariables>;

/**
 * __useUpdateTrackMutation__
 *
 * To run a mutation, you first call `useUpdateTrackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTrackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTrackMutation, { data, loading, error }] = useUpdateTrackMutation({
 *   variables: {
 *      id: // value for 'id'
 *      slug: // value for 'slug'
 *      title: // value for 'title'
 *      order: // value for 'order'
 *   },
 * });
 */
export function useUpdateTrackMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTrackMutation, UpdateTrackMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTrackMutation, UpdateTrackMutationVariables>(UpdateTrackDocument, options);
      }
export type UpdateTrackMutationHookResult = ReturnType<typeof useUpdateTrackMutation>;
export type UpdateTrackMutationResult = Apollo.MutationResult<UpdateTrackMutation>;
export type UpdateTrackMutationOptions = Apollo.BaseMutationOptions<UpdateTrackMutation, UpdateTrackMutationVariables>;
export const CreateCourseDocument = gql`
    mutation CreateCourse($slug: String!, $title: String!, $order: Int!) {
  createCourse(slug: $slug, title: $title, order: $order) {
    id
    slug
    title
    order
  }
}
    `;
export type CreateCourseMutationFn = Apollo.MutationFunction<CreateCourseMutation, CreateCourseMutationVariables>;

/**
 * __useCreateCourseMutation__
 *
 * To run a mutation, you first call `useCreateCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCourseMutation, { data, loading, error }] = useCreateCourseMutation({
 *   variables: {
 *      slug: // value for 'slug'
 *      title: // value for 'title'
 *      order: // value for 'order'
 *   },
 * });
 */
export function useCreateCourseMutation(baseOptions?: Apollo.MutationHookOptions<CreateCourseMutation, CreateCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCourseMutation, CreateCourseMutationVariables>(CreateCourseDocument, options);
      }
export type CreateCourseMutationHookResult = ReturnType<typeof useCreateCourseMutation>;
export type CreateCourseMutationResult = Apollo.MutationResult<CreateCourseMutation>;
export type CreateCourseMutationOptions = Apollo.BaseMutationOptions<CreateCourseMutation, CreateCourseMutationVariables>;
export const UpdateCourseDocument = gql`
    mutation UpdateCourse($id: ID!, $slug: String, $title: String, $order: Int) {
  updateCourse(id: $id, slug: $slug, title: $title, order: $order) {
    id
    slug
    title
    order
  }
}
    `;
export type UpdateCourseMutationFn = Apollo.MutationFunction<UpdateCourseMutation, UpdateCourseMutationVariables>;

/**
 * __useUpdateCourseMutation__
 *
 * To run a mutation, you first call `useUpdateCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCourseMutation, { data, loading, error }] = useUpdateCourseMutation({
 *   variables: {
 *      id: // value for 'id'
 *      slug: // value for 'slug'
 *      title: // value for 'title'
 *      order: // value for 'order'
 *   },
 * });
 */
export function useUpdateCourseMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCourseMutation, UpdateCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCourseMutation, UpdateCourseMutationVariables>(UpdateCourseDocument, options);
      }
export type UpdateCourseMutationHookResult = ReturnType<typeof useUpdateCourseMutation>;
export type UpdateCourseMutationResult = Apollo.MutationResult<UpdateCourseMutation>;
export type UpdateCourseMutationOptions = Apollo.BaseMutationOptions<UpdateCourseMutation, UpdateCourseMutationVariables>;
export const OfferCourseDocument = gql`
    mutation OfferCourse($courseId: ID!, $organizationId: ID!) {
  offerCourse(courseId: $courseId, organizationId: $organizationId)
}
    `;
export type OfferCourseMutationFn = Apollo.MutationFunction<OfferCourseMutation, OfferCourseMutationVariables>;

/**
 * __useOfferCourseMutation__
 *
 * To run a mutation, you first call `useOfferCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useOfferCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [offerCourseMutation, { data, loading, error }] = useOfferCourseMutation({
 *   variables: {
 *      courseId: // value for 'courseId'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useOfferCourseMutation(baseOptions?: Apollo.MutationHookOptions<OfferCourseMutation, OfferCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OfferCourseMutation, OfferCourseMutationVariables>(OfferCourseDocument, options);
      }
export type OfferCourseMutationHookResult = ReturnType<typeof useOfferCourseMutation>;
export type OfferCourseMutationResult = Apollo.MutationResult<OfferCourseMutation>;
export type OfferCourseMutationOptions = Apollo.BaseMutationOptions<OfferCourseMutation, OfferCourseMutationVariables>;
export const UnofferCourseDocument = gql`
    mutation UnofferCourse($courseId: ID!, $organizationId: ID!) {
  unofferCourse(courseId: $courseId, organizationId: $organizationId)
}
    `;
export type UnofferCourseMutationFn = Apollo.MutationFunction<UnofferCourseMutation, UnofferCourseMutationVariables>;

/**
 * __useUnofferCourseMutation__
 *
 * To run a mutation, you first call `useUnofferCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnofferCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unofferCourseMutation, { data, loading, error }] = useUnofferCourseMutation({
 *   variables: {
 *      courseId: // value for 'courseId'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useUnofferCourseMutation(baseOptions?: Apollo.MutationHookOptions<UnofferCourseMutation, UnofferCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnofferCourseMutation, UnofferCourseMutationVariables>(UnofferCourseDocument, options);
      }
export type UnofferCourseMutationHookResult = ReturnType<typeof useUnofferCourseMutation>;
export type UnofferCourseMutationResult = Apollo.MutationResult<UnofferCourseMutation>;
export type UnofferCourseMutationOptions = Apollo.BaseMutationOptions<UnofferCourseMutation, UnofferCourseMutationVariables>;
export const CreateModuleDocument = gql`
    mutation CreateModule($trackId: ID!, $slug: String!, $title: String!, $order: Int!) {
  createModule(trackId: $trackId, slug: $slug, title: $title, order: $order) {
    id
    slug
    title
    order
  }
}
    `;
export type CreateModuleMutationFn = Apollo.MutationFunction<CreateModuleMutation, CreateModuleMutationVariables>;

/**
 * __useCreateModuleMutation__
 *
 * To run a mutation, you first call `useCreateModuleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateModuleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createModuleMutation, { data, loading, error }] = useCreateModuleMutation({
 *   variables: {
 *      trackId: // value for 'trackId'
 *      slug: // value for 'slug'
 *      title: // value for 'title'
 *      order: // value for 'order'
 *   },
 * });
 */
export function useCreateModuleMutation(baseOptions?: Apollo.MutationHookOptions<CreateModuleMutation, CreateModuleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateModuleMutation, CreateModuleMutationVariables>(CreateModuleDocument, options);
      }
export type CreateModuleMutationHookResult = ReturnType<typeof useCreateModuleMutation>;
export type CreateModuleMutationResult = Apollo.MutationResult<CreateModuleMutation>;
export type CreateModuleMutationOptions = Apollo.BaseMutationOptions<CreateModuleMutation, CreateModuleMutationVariables>;
export const UpdateModuleDocument = gql`
    mutation UpdateModule($id: ID!, $slug: String, $title: String, $order: Int) {
  updateModule(id: $id, slug: $slug, title: $title, order: $order) {
    id
    slug
    title
    order
  }
}
    `;
export type UpdateModuleMutationFn = Apollo.MutationFunction<UpdateModuleMutation, UpdateModuleMutationVariables>;

/**
 * __useUpdateModuleMutation__
 *
 * To run a mutation, you first call `useUpdateModuleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateModuleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateModuleMutation, { data, loading, error }] = useUpdateModuleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      slug: // value for 'slug'
 *      title: // value for 'title'
 *      order: // value for 'order'
 *   },
 * });
 */
export function useUpdateModuleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateModuleMutation, UpdateModuleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateModuleMutation, UpdateModuleMutationVariables>(UpdateModuleDocument, options);
      }
export type UpdateModuleMutationHookResult = ReturnType<typeof useUpdateModuleMutation>;
export type UpdateModuleMutationResult = Apollo.MutationResult<UpdateModuleMutation>;
export type UpdateModuleMutationOptions = Apollo.BaseMutationOptions<UpdateModuleMutation, UpdateModuleMutationVariables>;
export const DeleteModuleDocument = gql`
    mutation DeleteModule($id: ID!) {
  deleteModule(id: $id)
}
    `;
export type DeleteModuleMutationFn = Apollo.MutationFunction<DeleteModuleMutation, DeleteModuleMutationVariables>;

/**
 * __useDeleteModuleMutation__
 *
 * To run a mutation, you first call `useDeleteModuleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteModuleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteModuleMutation, { data, loading, error }] = useDeleteModuleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteModuleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteModuleMutation, DeleteModuleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteModuleMutation, DeleteModuleMutationVariables>(DeleteModuleDocument, options);
      }
export type DeleteModuleMutationHookResult = ReturnType<typeof useDeleteModuleMutation>;
export type DeleteModuleMutationResult = Apollo.MutationResult<DeleteModuleMutation>;
export type DeleteModuleMutationOptions = Apollo.BaseMutationOptions<DeleteModuleMutation, DeleteModuleMutationVariables>;
export const CreateLessonDocument = gql`
    mutation CreateLesson($courseId: ID!, $trackId: ID!, $moduleId: ID, $slug: String!, $title: String!, $summary: String!, $layout: String!, $difficulty: LessonDifficulty!, $order: Int!, $estimatedMinutes: Int!) {
  createLesson(
    courseId: $courseId
    trackId: $trackId
    moduleId: $moduleId
    slug: $slug
    title: $title
    summary: $summary
    layout: $layout
    difficulty: $difficulty
    order: $order
    estimatedMinutes: $estimatedMinutes
  ) {
    id
    slug
  }
}
    `;
export type CreateLessonMutationFn = Apollo.MutationFunction<CreateLessonMutation, CreateLessonMutationVariables>;

/**
 * __useCreateLessonMutation__
 *
 * To run a mutation, you first call `useCreateLessonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateLessonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createLessonMutation, { data, loading, error }] = useCreateLessonMutation({
 *   variables: {
 *      courseId: // value for 'courseId'
 *      trackId: // value for 'trackId'
 *      moduleId: // value for 'moduleId'
 *      slug: // value for 'slug'
 *      title: // value for 'title'
 *      summary: // value for 'summary'
 *      layout: // value for 'layout'
 *      difficulty: // value for 'difficulty'
 *      order: // value for 'order'
 *      estimatedMinutes: // value for 'estimatedMinutes'
 *   },
 * });
 */
export function useCreateLessonMutation(baseOptions?: Apollo.MutationHookOptions<CreateLessonMutation, CreateLessonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateLessonMutation, CreateLessonMutationVariables>(CreateLessonDocument, options);
      }
export type CreateLessonMutationHookResult = ReturnType<typeof useCreateLessonMutation>;
export type CreateLessonMutationResult = Apollo.MutationResult<CreateLessonMutation>;
export type CreateLessonMutationOptions = Apollo.BaseMutationOptions<CreateLessonMutation, CreateLessonMutationVariables>;
export const UpdateLessonDocument = gql`
    mutation UpdateLesson($id: ID!, $courseId: ID, $trackId: ID, $moduleId: ID, $slug: String, $title: String, $summary: String, $layout: String, $difficulty: LessonDifficulty, $order: Int, $estimatedMinutes: Int) {
  updateLesson(
    id: $id
    courseId: $courseId
    trackId: $trackId
    moduleId: $moduleId
    slug: $slug
    title: $title
    summary: $summary
    layout: $layout
    difficulty: $difficulty
    order: $order
    estimatedMinutes: $estimatedMinutes
  ) {
    id
    slug
    title
    summary
    layout
    difficulty
    order
    estimatedMinutes
  }
}
    `;
export type UpdateLessonMutationFn = Apollo.MutationFunction<UpdateLessonMutation, UpdateLessonMutationVariables>;

/**
 * __useUpdateLessonMutation__
 *
 * To run a mutation, you first call `useUpdateLessonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLessonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLessonMutation, { data, loading, error }] = useUpdateLessonMutation({
 *   variables: {
 *      id: // value for 'id'
 *      courseId: // value for 'courseId'
 *      trackId: // value for 'trackId'
 *      moduleId: // value for 'moduleId'
 *      slug: // value for 'slug'
 *      title: // value for 'title'
 *      summary: // value for 'summary'
 *      layout: // value for 'layout'
 *      difficulty: // value for 'difficulty'
 *      order: // value for 'order'
 *      estimatedMinutes: // value for 'estimatedMinutes'
 *   },
 * });
 */
export function useUpdateLessonMutation(baseOptions?: Apollo.MutationHookOptions<UpdateLessonMutation, UpdateLessonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateLessonMutation, UpdateLessonMutationVariables>(UpdateLessonDocument, options);
      }
export type UpdateLessonMutationHookResult = ReturnType<typeof useUpdateLessonMutation>;
export type UpdateLessonMutationResult = Apollo.MutationResult<UpdateLessonMutation>;
export type UpdateLessonMutationOptions = Apollo.BaseMutationOptions<UpdateLessonMutation, UpdateLessonMutationVariables>;
export const DeleteLessonDocument = gql`
    mutation DeleteLesson($id: ID!) {
  deleteLesson(id: $id)
}
    `;
export type DeleteLessonMutationFn = Apollo.MutationFunction<DeleteLessonMutation, DeleteLessonMutationVariables>;

/**
 * __useDeleteLessonMutation__
 *
 * To run a mutation, you first call `useDeleteLessonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteLessonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteLessonMutation, { data, loading, error }] = useDeleteLessonMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteLessonMutation(baseOptions?: Apollo.MutationHookOptions<DeleteLessonMutation, DeleteLessonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteLessonMutation, DeleteLessonMutationVariables>(DeleteLessonDocument, options);
      }
export type DeleteLessonMutationHookResult = ReturnType<typeof useDeleteLessonMutation>;
export type DeleteLessonMutationResult = Apollo.MutationResult<DeleteLessonMutation>;
export type DeleteLessonMutationOptions = Apollo.BaseMutationOptions<DeleteLessonMutation, DeleteLessonMutationVariables>;
export const UpdateLessonPrerequisitesDocument = gql`
    mutation UpdateLessonPrerequisites($lessonId: ID!, $prerequisiteLessonIds: [ID!]!) {
  updateLessonPrerequisites(
    lessonId: $lessonId
    prerequisiteLessonIds: $prerequisiteLessonIds
  ) {
    id
    prerequisites {
      id
      title
    }
  }
}
    `;
export type UpdateLessonPrerequisitesMutationFn = Apollo.MutationFunction<UpdateLessonPrerequisitesMutation, UpdateLessonPrerequisitesMutationVariables>;

/**
 * __useUpdateLessonPrerequisitesMutation__
 *
 * To run a mutation, you first call `useUpdateLessonPrerequisitesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLessonPrerequisitesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLessonPrerequisitesMutation, { data, loading, error }] = useUpdateLessonPrerequisitesMutation({
 *   variables: {
 *      lessonId: // value for 'lessonId'
 *      prerequisiteLessonIds: // value for 'prerequisiteLessonIds'
 *   },
 * });
 */
export function useUpdateLessonPrerequisitesMutation(baseOptions?: Apollo.MutationHookOptions<UpdateLessonPrerequisitesMutation, UpdateLessonPrerequisitesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateLessonPrerequisitesMutation, UpdateLessonPrerequisitesMutationVariables>(UpdateLessonPrerequisitesDocument, options);
      }
export type UpdateLessonPrerequisitesMutationHookResult = ReturnType<typeof useUpdateLessonPrerequisitesMutation>;
export type UpdateLessonPrerequisitesMutationResult = Apollo.MutationResult<UpdateLessonPrerequisitesMutation>;
export type UpdateLessonPrerequisitesMutationOptions = Apollo.BaseMutationOptions<UpdateLessonPrerequisitesMutation, UpdateLessonPrerequisitesMutationVariables>;
export const CreateTagDocument = gql`
    mutation CreateTag($slug: String!, $label: String!) {
  createTag(slug: $slug, label: $label) {
    id
    slug
    label
  }
}
    `;
export type CreateTagMutationFn = Apollo.MutationFunction<CreateTagMutation, CreateTagMutationVariables>;

/**
 * __useCreateTagMutation__
 *
 * To run a mutation, you first call `useCreateTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTagMutation, { data, loading, error }] = useCreateTagMutation({
 *   variables: {
 *      slug: // value for 'slug'
 *      label: // value for 'label'
 *   },
 * });
 */
export function useCreateTagMutation(baseOptions?: Apollo.MutationHookOptions<CreateTagMutation, CreateTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTagMutation, CreateTagMutationVariables>(CreateTagDocument, options);
      }
export type CreateTagMutationHookResult = ReturnType<typeof useCreateTagMutation>;
export type CreateTagMutationResult = Apollo.MutationResult<CreateTagMutation>;
export type CreateTagMutationOptions = Apollo.BaseMutationOptions<CreateTagMutation, CreateTagMutationVariables>;
export const UpdateLessonTagsDocument = gql`
    mutation UpdateLessonTags($lessonId: ID!, $tagIds: [ID!]!) {
  updateLessonTags(lessonId: $lessonId, tagIds: $tagIds) {
    id
    tags {
      id
      slug
      label
    }
  }
}
    `;
export type UpdateLessonTagsMutationFn = Apollo.MutationFunction<UpdateLessonTagsMutation, UpdateLessonTagsMutationVariables>;

/**
 * __useUpdateLessonTagsMutation__
 *
 * To run a mutation, you first call `useUpdateLessonTagsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLessonTagsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLessonTagsMutation, { data, loading, error }] = useUpdateLessonTagsMutation({
 *   variables: {
 *      lessonId: // value for 'lessonId'
 *      tagIds: // value for 'tagIds'
 *   },
 * });
 */
export function useUpdateLessonTagsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateLessonTagsMutation, UpdateLessonTagsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateLessonTagsMutation, UpdateLessonTagsMutationVariables>(UpdateLessonTagsDocument, options);
      }
export type UpdateLessonTagsMutationHookResult = ReturnType<typeof useUpdateLessonTagsMutation>;
export type UpdateLessonTagsMutationResult = Apollo.MutationResult<UpdateLessonTagsMutation>;
export type UpdateLessonTagsMutationOptions = Apollo.BaseMutationOptions<UpdateLessonTagsMutation, UpdateLessonTagsMutationVariables>;
export const CreateContentBlockDocument = gql`
    mutation CreateContentBlock($lessonId: ID!, $order: Int!, $type: String!, $data: JSON!) {
  createContentBlock(lessonId: $lessonId, order: $order, type: $type, data: $data) {
    id
    order
    type
    data
  }
}
    `;
export type CreateContentBlockMutationFn = Apollo.MutationFunction<CreateContentBlockMutation, CreateContentBlockMutationVariables>;

/**
 * __useCreateContentBlockMutation__
 *
 * To run a mutation, you first call `useCreateContentBlockMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateContentBlockMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createContentBlockMutation, { data, loading, error }] = useCreateContentBlockMutation({
 *   variables: {
 *      lessonId: // value for 'lessonId'
 *      order: // value for 'order'
 *      type: // value for 'type'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateContentBlockMutation(baseOptions?: Apollo.MutationHookOptions<CreateContentBlockMutation, CreateContentBlockMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateContentBlockMutation, CreateContentBlockMutationVariables>(CreateContentBlockDocument, options);
      }
export type CreateContentBlockMutationHookResult = ReturnType<typeof useCreateContentBlockMutation>;
export type CreateContentBlockMutationResult = Apollo.MutationResult<CreateContentBlockMutation>;
export type CreateContentBlockMutationOptions = Apollo.BaseMutationOptions<CreateContentBlockMutation, CreateContentBlockMutationVariables>;
export const UpdateContentBlockDocument = gql`
    mutation UpdateContentBlock($id: ID!, $order: Int, $type: String, $data: JSON) {
  updateContentBlock(id: $id, order: $order, type: $type, data: $data) {
    id
    order
    type
    data
  }
}
    `;
export type UpdateContentBlockMutationFn = Apollo.MutationFunction<UpdateContentBlockMutation, UpdateContentBlockMutationVariables>;

/**
 * __useUpdateContentBlockMutation__
 *
 * To run a mutation, you first call `useUpdateContentBlockMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateContentBlockMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateContentBlockMutation, { data, loading, error }] = useUpdateContentBlockMutation({
 *   variables: {
 *      id: // value for 'id'
 *      order: // value for 'order'
 *      type: // value for 'type'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateContentBlockMutation(baseOptions?: Apollo.MutationHookOptions<UpdateContentBlockMutation, UpdateContentBlockMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateContentBlockMutation, UpdateContentBlockMutationVariables>(UpdateContentBlockDocument, options);
      }
export type UpdateContentBlockMutationHookResult = ReturnType<typeof useUpdateContentBlockMutation>;
export type UpdateContentBlockMutationResult = Apollo.MutationResult<UpdateContentBlockMutation>;
export type UpdateContentBlockMutationOptions = Apollo.BaseMutationOptions<UpdateContentBlockMutation, UpdateContentBlockMutationVariables>;
export const DeleteContentBlockDocument = gql`
    mutation DeleteContentBlock($id: ID!) {
  deleteContentBlock(id: $id)
}
    `;
export type DeleteContentBlockMutationFn = Apollo.MutationFunction<DeleteContentBlockMutation, DeleteContentBlockMutationVariables>;

/**
 * __useDeleteContentBlockMutation__
 *
 * To run a mutation, you first call `useDeleteContentBlockMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteContentBlockMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteContentBlockMutation, { data, loading, error }] = useDeleteContentBlockMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteContentBlockMutation(baseOptions?: Apollo.MutationHookOptions<DeleteContentBlockMutation, DeleteContentBlockMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteContentBlockMutation, DeleteContentBlockMutationVariables>(DeleteContentBlockDocument, options);
      }
export type DeleteContentBlockMutationHookResult = ReturnType<typeof useDeleteContentBlockMutation>;
export type DeleteContentBlockMutationResult = Apollo.MutationResult<DeleteContentBlockMutation>;
export type DeleteContentBlockMutationOptions = Apollo.BaseMutationOptions<DeleteContentBlockMutation, DeleteContentBlockMutationVariables>;
export const UpdateWidgetDocument = gql`
    mutation UpdateWidget($key: ID!, $label: String, $description: String, $implemented: Boolean, $categoryIds: [ID!]) {
  updateWidget(
    key: $key
    label: $label
    description: $description
    implemented: $implemented
    categoryIds: $categoryIds
  ) {
    key
    label
    description
    implemented
    categories {
      id
      slug
      label
    }
  }
}
    `;
export type UpdateWidgetMutationFn = Apollo.MutationFunction<UpdateWidgetMutation, UpdateWidgetMutationVariables>;

/**
 * __useUpdateWidgetMutation__
 *
 * To run a mutation, you first call `useUpdateWidgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWidgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWidgetMutation, { data, loading, error }] = useUpdateWidgetMutation({
 *   variables: {
 *      key: // value for 'key'
 *      label: // value for 'label'
 *      description: // value for 'description'
 *      implemented: // value for 'implemented'
 *      categoryIds: // value for 'categoryIds'
 *   },
 * });
 */
export function useUpdateWidgetMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWidgetMutation, UpdateWidgetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWidgetMutation, UpdateWidgetMutationVariables>(UpdateWidgetDocument, options);
      }
export type UpdateWidgetMutationHookResult = ReturnType<typeof useUpdateWidgetMutation>;
export type UpdateWidgetMutationResult = Apollo.MutationResult<UpdateWidgetMutation>;
export type UpdateWidgetMutationOptions = Apollo.BaseMutationOptions<UpdateWidgetMutation, UpdateWidgetMutationVariables>;
export const DeleteWidgetDocument = gql`
    mutation DeleteWidget($key: ID!) {
  deleteWidget(key: $key)
}
    `;
export type DeleteWidgetMutationFn = Apollo.MutationFunction<DeleteWidgetMutation, DeleteWidgetMutationVariables>;

/**
 * __useDeleteWidgetMutation__
 *
 * To run a mutation, you first call `useDeleteWidgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWidgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWidgetMutation, { data, loading, error }] = useDeleteWidgetMutation({
 *   variables: {
 *      key: // value for 'key'
 *   },
 * });
 */
export function useDeleteWidgetMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWidgetMutation, DeleteWidgetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWidgetMutation, DeleteWidgetMutationVariables>(DeleteWidgetDocument, options);
      }
export type DeleteWidgetMutationHookResult = ReturnType<typeof useDeleteWidgetMutation>;
export type DeleteWidgetMutationResult = Apollo.MutationResult<DeleteWidgetMutation>;
export type DeleteWidgetMutationOptions = Apollo.BaseMutationOptions<DeleteWidgetMutation, DeleteWidgetMutationVariables>;
export const CreateWidgetCategoryDocument = gql`
    mutation CreateWidgetCategory($slug: String!, $label: String!) {
  createWidgetCategory(slug: $slug, label: $label) {
    id
    slug
    label
  }
}
    `;
export type CreateWidgetCategoryMutationFn = Apollo.MutationFunction<CreateWidgetCategoryMutation, CreateWidgetCategoryMutationVariables>;

/**
 * __useCreateWidgetCategoryMutation__
 *
 * To run a mutation, you first call `useCreateWidgetCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWidgetCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWidgetCategoryMutation, { data, loading, error }] = useCreateWidgetCategoryMutation({
 *   variables: {
 *      slug: // value for 'slug'
 *      label: // value for 'label'
 *   },
 * });
 */
export function useCreateWidgetCategoryMutation(baseOptions?: Apollo.MutationHookOptions<CreateWidgetCategoryMutation, CreateWidgetCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWidgetCategoryMutation, CreateWidgetCategoryMutationVariables>(CreateWidgetCategoryDocument, options);
      }
export type CreateWidgetCategoryMutationHookResult = ReturnType<typeof useCreateWidgetCategoryMutation>;
export type CreateWidgetCategoryMutationResult = Apollo.MutationResult<CreateWidgetCategoryMutation>;
export type CreateWidgetCategoryMutationOptions = Apollo.BaseMutationOptions<CreateWidgetCategoryMutation, CreateWidgetCategoryMutationVariables>;
export const UpdateWidgetCategoryDocument = gql`
    mutation UpdateWidgetCategory($id: ID!, $slug: String, $label: String) {
  updateWidgetCategory(id: $id, slug: $slug, label: $label) {
    id
    slug
    label
  }
}
    `;
export type UpdateWidgetCategoryMutationFn = Apollo.MutationFunction<UpdateWidgetCategoryMutation, UpdateWidgetCategoryMutationVariables>;

/**
 * __useUpdateWidgetCategoryMutation__
 *
 * To run a mutation, you first call `useUpdateWidgetCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWidgetCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWidgetCategoryMutation, { data, loading, error }] = useUpdateWidgetCategoryMutation({
 *   variables: {
 *      id: // value for 'id'
 *      slug: // value for 'slug'
 *      label: // value for 'label'
 *   },
 * });
 */
export function useUpdateWidgetCategoryMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWidgetCategoryMutation, UpdateWidgetCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWidgetCategoryMutation, UpdateWidgetCategoryMutationVariables>(UpdateWidgetCategoryDocument, options);
      }
export type UpdateWidgetCategoryMutationHookResult = ReturnType<typeof useUpdateWidgetCategoryMutation>;
export type UpdateWidgetCategoryMutationResult = Apollo.MutationResult<UpdateWidgetCategoryMutation>;
export type UpdateWidgetCategoryMutationOptions = Apollo.BaseMutationOptions<UpdateWidgetCategoryMutation, UpdateWidgetCategoryMutationVariables>;
export const DeleteWidgetCategoryDocument = gql`
    mutation DeleteWidgetCategory($id: ID!) {
  deleteWidgetCategory(id: $id)
}
    `;
export type DeleteWidgetCategoryMutationFn = Apollo.MutationFunction<DeleteWidgetCategoryMutation, DeleteWidgetCategoryMutationVariables>;

/**
 * __useDeleteWidgetCategoryMutation__
 *
 * To run a mutation, you first call `useDeleteWidgetCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWidgetCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWidgetCategoryMutation, { data, loading, error }] = useDeleteWidgetCategoryMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteWidgetCategoryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWidgetCategoryMutation, DeleteWidgetCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWidgetCategoryMutation, DeleteWidgetCategoryMutationVariables>(DeleteWidgetCategoryDocument, options);
      }
export type DeleteWidgetCategoryMutationHookResult = ReturnType<typeof useDeleteWidgetCategoryMutation>;
export type DeleteWidgetCategoryMutationResult = Apollo.MutationResult<DeleteWidgetCategoryMutation>;
export type DeleteWidgetCategoryMutationOptions = Apollo.BaseMutationOptions<DeleteWidgetCategoryMutation, DeleteWidgetCategoryMutationVariables>;
export const ContentSnapshotDocument = gql`
    query ContentSnapshot {
  contentSnapshot
}
    `;

/**
 * __useContentSnapshotQuery__
 *
 * To run a query within a React component, call `useContentSnapshotQuery` and pass it any options that fit your needs.
 * When your component renders, `useContentSnapshotQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContentSnapshotQuery({
 *   variables: {
 *   },
 * });
 */
export function useContentSnapshotQuery(baseOptions?: Apollo.QueryHookOptions<ContentSnapshotQuery, ContentSnapshotQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ContentSnapshotQuery, ContentSnapshotQueryVariables>(ContentSnapshotDocument, options);
      }
export function useContentSnapshotLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ContentSnapshotQuery, ContentSnapshotQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ContentSnapshotQuery, ContentSnapshotQueryVariables>(ContentSnapshotDocument, options);
        }
// @ts-ignore
export function useContentSnapshotSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ContentSnapshotQuery, ContentSnapshotQueryVariables>): Apollo.UseSuspenseQueryResult<ContentSnapshotQuery, ContentSnapshotQueryVariables>;
export function useContentSnapshotSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ContentSnapshotQuery, ContentSnapshotQueryVariables>): Apollo.UseSuspenseQueryResult<ContentSnapshotQuery | undefined, ContentSnapshotQueryVariables>;
export function useContentSnapshotSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ContentSnapshotQuery, ContentSnapshotQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ContentSnapshotQuery, ContentSnapshotQueryVariables>(ContentSnapshotDocument, options);
        }
export type ContentSnapshotQueryHookResult = ReturnType<typeof useContentSnapshotQuery>;
export type ContentSnapshotLazyQueryHookResult = ReturnType<typeof useContentSnapshotLazyQuery>;
export type ContentSnapshotSuspenseQueryHookResult = ReturnType<typeof useContentSnapshotSuspenseQuery>;
export type ContentSnapshotQueryResult = Apollo.QueryResult<ContentSnapshotQuery, ContentSnapshotQueryVariables>;
export const PreviewContentRestoreDocument = gql`
    mutation PreviewContentRestore($snapshot: JSON!) {
  previewContentRestore(snapshot: $snapshot)
}
    `;
export type PreviewContentRestoreMutationFn = Apollo.MutationFunction<PreviewContentRestoreMutation, PreviewContentRestoreMutationVariables>;

/**
 * __usePreviewContentRestoreMutation__
 *
 * To run a mutation, you first call `usePreviewContentRestoreMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePreviewContentRestoreMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [previewContentRestoreMutation, { data, loading, error }] = usePreviewContentRestoreMutation({
 *   variables: {
 *      snapshot: // value for 'snapshot'
 *   },
 * });
 */
export function usePreviewContentRestoreMutation(baseOptions?: Apollo.MutationHookOptions<PreviewContentRestoreMutation, PreviewContentRestoreMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PreviewContentRestoreMutation, PreviewContentRestoreMutationVariables>(PreviewContentRestoreDocument, options);
      }
export type PreviewContentRestoreMutationHookResult = ReturnType<typeof usePreviewContentRestoreMutation>;
export type PreviewContentRestoreMutationResult = Apollo.MutationResult<PreviewContentRestoreMutation>;
export type PreviewContentRestoreMutationOptions = Apollo.BaseMutationOptions<PreviewContentRestoreMutation, PreviewContentRestoreMutationVariables>;
export const RestoreContentSnapshotDocument = gql`
    mutation RestoreContentSnapshot($snapshot: JSON!, $prune: Boolean) {
  restoreContentSnapshot(snapshot: $snapshot, prune: $prune)
}
    `;
export type RestoreContentSnapshotMutationFn = Apollo.MutationFunction<RestoreContentSnapshotMutation, RestoreContentSnapshotMutationVariables>;

/**
 * __useRestoreContentSnapshotMutation__
 *
 * To run a mutation, you first call `useRestoreContentSnapshotMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRestoreContentSnapshotMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [restoreContentSnapshotMutation, { data, loading, error }] = useRestoreContentSnapshotMutation({
 *   variables: {
 *      snapshot: // value for 'snapshot'
 *      prune: // value for 'prune'
 *   },
 * });
 */
export function useRestoreContentSnapshotMutation(baseOptions?: Apollo.MutationHookOptions<RestoreContentSnapshotMutation, RestoreContentSnapshotMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RestoreContentSnapshotMutation, RestoreContentSnapshotMutationVariables>(RestoreContentSnapshotDocument, options);
      }
export type RestoreContentSnapshotMutationHookResult = ReturnType<typeof useRestoreContentSnapshotMutation>;
export type RestoreContentSnapshotMutationResult = Apollo.MutationResult<RestoreContentSnapshotMutation>;
export type RestoreContentSnapshotMutationOptions = Apollo.BaseMutationOptions<RestoreContentSnapshotMutation, RestoreContentSnapshotMutationVariables>;
export const MyCodeSnapshotDocument = gql`
    query MyCodeSnapshot($lessonSlug: String!, $exerciseId: String!) {
  myCodeSnapshot(lessonSlug: $lessonSlug, exerciseId: $exerciseId) {
    lessonSlug
    exerciseId
    code
    resultOk
    resultMessages
    updatedAt
  }
}
    `;

/**
 * __useMyCodeSnapshotQuery__
 *
 * To run a query within a React component, call `useMyCodeSnapshotQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyCodeSnapshotQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyCodeSnapshotQuery({
 *   variables: {
 *      lessonSlug: // value for 'lessonSlug'
 *      exerciseId: // value for 'exerciseId'
 *   },
 * });
 */
export function useMyCodeSnapshotQuery(baseOptions: Apollo.QueryHookOptions<MyCodeSnapshotQuery, MyCodeSnapshotQueryVariables> & ({ variables: MyCodeSnapshotQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyCodeSnapshotQuery, MyCodeSnapshotQueryVariables>(MyCodeSnapshotDocument, options);
      }
export function useMyCodeSnapshotLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyCodeSnapshotQuery, MyCodeSnapshotQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyCodeSnapshotQuery, MyCodeSnapshotQueryVariables>(MyCodeSnapshotDocument, options);
        }
// @ts-ignore
export function useMyCodeSnapshotSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyCodeSnapshotQuery, MyCodeSnapshotQueryVariables>): Apollo.UseSuspenseQueryResult<MyCodeSnapshotQuery, MyCodeSnapshotQueryVariables>;
export function useMyCodeSnapshotSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCodeSnapshotQuery, MyCodeSnapshotQueryVariables>): Apollo.UseSuspenseQueryResult<MyCodeSnapshotQuery | undefined, MyCodeSnapshotQueryVariables>;
export function useMyCodeSnapshotSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCodeSnapshotQuery, MyCodeSnapshotQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyCodeSnapshotQuery, MyCodeSnapshotQueryVariables>(MyCodeSnapshotDocument, options);
        }
export type MyCodeSnapshotQueryHookResult = ReturnType<typeof useMyCodeSnapshotQuery>;
export type MyCodeSnapshotLazyQueryHookResult = ReturnType<typeof useMyCodeSnapshotLazyQuery>;
export type MyCodeSnapshotSuspenseQueryHookResult = ReturnType<typeof useMyCodeSnapshotSuspenseQuery>;
export type MyCodeSnapshotQueryResult = Apollo.QueryResult<MyCodeSnapshotQuery, MyCodeSnapshotQueryVariables>;
export const SaveCodeSnapshotDocument = gql`
    mutation SaveCodeSnapshot($lessonSlug: String!, $exerciseId: String!, $code: String!, $resultOk: Boolean, $resultMessages: [String!]) {
  saveCodeSnapshot(
    lessonSlug: $lessonSlug
    exerciseId: $exerciseId
    code: $code
    resultOk: $resultOk
    resultMessages: $resultMessages
  ) {
    lessonSlug
    exerciseId
    code
    resultOk
    resultMessages
    updatedAt
  }
}
    `;
export type SaveCodeSnapshotMutationFn = Apollo.MutationFunction<SaveCodeSnapshotMutation, SaveCodeSnapshotMutationVariables>;

/**
 * __useSaveCodeSnapshotMutation__
 *
 * To run a mutation, you first call `useSaveCodeSnapshotMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveCodeSnapshotMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveCodeSnapshotMutation, { data, loading, error }] = useSaveCodeSnapshotMutation({
 *   variables: {
 *      lessonSlug: // value for 'lessonSlug'
 *      exerciseId: // value for 'exerciseId'
 *      code: // value for 'code'
 *      resultOk: // value for 'resultOk'
 *      resultMessages: // value for 'resultMessages'
 *   },
 * });
 */
export function useSaveCodeSnapshotMutation(baseOptions?: Apollo.MutationHookOptions<SaveCodeSnapshotMutation, SaveCodeSnapshotMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveCodeSnapshotMutation, SaveCodeSnapshotMutationVariables>(SaveCodeSnapshotDocument, options);
      }
export type SaveCodeSnapshotMutationHookResult = ReturnType<typeof useSaveCodeSnapshotMutation>;
export type SaveCodeSnapshotMutationResult = Apollo.MutationResult<SaveCodeSnapshotMutation>;
export type SaveCodeSnapshotMutationOptions = Apollo.BaseMutationOptions<SaveCodeSnapshotMutation, SaveCodeSnapshotMutationVariables>;
export const CoursesDocument = gql`
    query Courses {
  courses {
    id
    slug
    title
    order
  }
}
    `;

/**
 * __useCoursesQuery__
 *
 * To run a query within a React component, call `useCoursesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoursesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoursesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCoursesQuery(baseOptions?: Apollo.QueryHookOptions<CoursesQuery, CoursesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CoursesQuery, CoursesQueryVariables>(CoursesDocument, options);
      }
export function useCoursesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CoursesQuery, CoursesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CoursesQuery, CoursesQueryVariables>(CoursesDocument, options);
        }
// @ts-ignore
export function useCoursesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CoursesQuery, CoursesQueryVariables>): Apollo.UseSuspenseQueryResult<CoursesQuery, CoursesQueryVariables>;
export function useCoursesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CoursesQuery, CoursesQueryVariables>): Apollo.UseSuspenseQueryResult<CoursesQuery | undefined, CoursesQueryVariables>;
export function useCoursesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CoursesQuery, CoursesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CoursesQuery, CoursesQueryVariables>(CoursesDocument, options);
        }
export type CoursesQueryHookResult = ReturnType<typeof useCoursesQuery>;
export type CoursesLazyQueryHookResult = ReturnType<typeof useCoursesLazyQuery>;
export type CoursesSuspenseQueryHookResult = ReturnType<typeof useCoursesSuspenseQuery>;
export type CoursesQueryResult = Apollo.QueryResult<CoursesQuery, CoursesQueryVariables>;
export const MyCoursesDocument = gql`
    query MyCourses {
  myCourses {
    id
    slug
    title
    order
  }
}
    `;

/**
 * __useMyCoursesQuery__
 *
 * To run a query within a React component, call `useMyCoursesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyCoursesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyCoursesQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyCoursesQuery(baseOptions?: Apollo.QueryHookOptions<MyCoursesQuery, MyCoursesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyCoursesQuery, MyCoursesQueryVariables>(MyCoursesDocument, options);
      }
export function useMyCoursesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyCoursesQuery, MyCoursesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyCoursesQuery, MyCoursesQueryVariables>(MyCoursesDocument, options);
        }
// @ts-ignore
export function useMyCoursesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyCoursesQuery, MyCoursesQueryVariables>): Apollo.UseSuspenseQueryResult<MyCoursesQuery, MyCoursesQueryVariables>;
export function useMyCoursesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCoursesQuery, MyCoursesQueryVariables>): Apollo.UseSuspenseQueryResult<MyCoursesQuery | undefined, MyCoursesQueryVariables>;
export function useMyCoursesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCoursesQuery, MyCoursesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyCoursesQuery, MyCoursesQueryVariables>(MyCoursesDocument, options);
        }
export type MyCoursesQueryHookResult = ReturnType<typeof useMyCoursesQuery>;
export type MyCoursesLazyQueryHookResult = ReturnType<typeof useMyCoursesLazyQuery>;
export type MyCoursesSuspenseQueryHookResult = ReturnType<typeof useMyCoursesSuspenseQuery>;
export type MyCoursesQueryResult = Apollo.QueryResult<MyCoursesQuery, MyCoursesQueryVariables>;
export const MyCourseGroupsDocument = gql`
    query MyCourseGroups {
  myCourses {
    id
    slug
    title
    order
    tracks {
      id
      slug
      title
      order
      lessons {
        id
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

/**
 * __useMyCourseGroupsQuery__
 *
 * To run a query within a React component, call `useMyCourseGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyCourseGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyCourseGroupsQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyCourseGroupsQuery(baseOptions?: Apollo.QueryHookOptions<MyCourseGroupsQuery, MyCourseGroupsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyCourseGroupsQuery, MyCourseGroupsQueryVariables>(MyCourseGroupsDocument, options);
      }
export function useMyCourseGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyCourseGroupsQuery, MyCourseGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyCourseGroupsQuery, MyCourseGroupsQueryVariables>(MyCourseGroupsDocument, options);
        }
// @ts-ignore
export function useMyCourseGroupsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyCourseGroupsQuery, MyCourseGroupsQueryVariables>): Apollo.UseSuspenseQueryResult<MyCourseGroupsQuery, MyCourseGroupsQueryVariables>;
export function useMyCourseGroupsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCourseGroupsQuery, MyCourseGroupsQueryVariables>): Apollo.UseSuspenseQueryResult<MyCourseGroupsQuery | undefined, MyCourseGroupsQueryVariables>;
export function useMyCourseGroupsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCourseGroupsQuery, MyCourseGroupsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyCourseGroupsQuery, MyCourseGroupsQueryVariables>(MyCourseGroupsDocument, options);
        }
export type MyCourseGroupsQueryHookResult = ReturnType<typeof useMyCourseGroupsQuery>;
export type MyCourseGroupsLazyQueryHookResult = ReturnType<typeof useMyCourseGroupsLazyQuery>;
export type MyCourseGroupsSuspenseQueryHookResult = ReturnType<typeof useMyCourseGroupsSuspenseQuery>;
export type MyCourseGroupsQueryResult = Apollo.QueryResult<MyCourseGroupsQuery, MyCourseGroupsQueryVariables>;
export const LessonDocument = gql`
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

/**
 * __useLessonQuery__
 *
 * To run a query within a React component, call `useLessonQuery` and pass it any options that fit your needs.
 * When your component renders, `useLessonQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLessonQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useLessonQuery(baseOptions: Apollo.QueryHookOptions<LessonQuery, LessonQueryVariables> & ({ variables: LessonQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LessonQuery, LessonQueryVariables>(LessonDocument, options);
      }
export function useLessonLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LessonQuery, LessonQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LessonQuery, LessonQueryVariables>(LessonDocument, options);
        }
// @ts-ignore
export function useLessonSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<LessonQuery, LessonQueryVariables>): Apollo.UseSuspenseQueryResult<LessonQuery, LessonQueryVariables>;
export function useLessonSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<LessonQuery, LessonQueryVariables>): Apollo.UseSuspenseQueryResult<LessonQuery | undefined, LessonQueryVariables>;
export function useLessonSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<LessonQuery, LessonQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<LessonQuery, LessonQueryVariables>(LessonDocument, options);
        }
export type LessonQueryHookResult = ReturnType<typeof useLessonQuery>;
export type LessonLazyQueryHookResult = ReturnType<typeof useLessonLazyQuery>;
export type LessonSuspenseQueryHookResult = ReturnType<typeof useLessonSuspenseQuery>;
export type LessonQueryResult = Apollo.QueryResult<LessonQuery, LessonQueryVariables>;
export const SuggestLessonQuestionsDocument = gql`
    mutation SuggestLessonQuestions($lessonSlug: String!) {
  suggestLessonQuestions(lessonSlug: $lessonSlug)
}
    `;
export type SuggestLessonQuestionsMutationFn = Apollo.MutationFunction<SuggestLessonQuestionsMutation, SuggestLessonQuestionsMutationVariables>;

/**
 * __useSuggestLessonQuestionsMutation__
 *
 * To run a mutation, you first call `useSuggestLessonQuestionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSuggestLessonQuestionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [suggestLessonQuestionsMutation, { data, loading, error }] = useSuggestLessonQuestionsMutation({
 *   variables: {
 *      lessonSlug: // value for 'lessonSlug'
 *   },
 * });
 */
export function useSuggestLessonQuestionsMutation(baseOptions?: Apollo.MutationHookOptions<SuggestLessonQuestionsMutation, SuggestLessonQuestionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SuggestLessonQuestionsMutation, SuggestLessonQuestionsMutationVariables>(SuggestLessonQuestionsDocument, options);
      }
export type SuggestLessonQuestionsMutationHookResult = ReturnType<typeof useSuggestLessonQuestionsMutation>;
export type SuggestLessonQuestionsMutationResult = Apollo.MutationResult<SuggestLessonQuestionsMutation>;
export type SuggestLessonQuestionsMutationOptions = Apollo.BaseMutationOptions<SuggestLessonQuestionsMutation, SuggestLessonQuestionsMutationVariables>;
export const MyQuizAttemptDocument = gql`
    query MyQuizAttempt($lessonSlug: String!, $quizId: String!) {
  myQuizAttempt(lessonSlug: $lessonSlug, quizId: $quizId) {
    lessonSlug
    quizId
    selectedChoiceId
    submitted
    updatedAt
  }
}
    `;

/**
 * __useMyQuizAttemptQuery__
 *
 * To run a query within a React component, call `useMyQuizAttemptQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyQuizAttemptQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyQuizAttemptQuery({
 *   variables: {
 *      lessonSlug: // value for 'lessonSlug'
 *      quizId: // value for 'quizId'
 *   },
 * });
 */
export function useMyQuizAttemptQuery(baseOptions: Apollo.QueryHookOptions<MyQuizAttemptQuery, MyQuizAttemptQueryVariables> & ({ variables: MyQuizAttemptQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyQuizAttemptQuery, MyQuizAttemptQueryVariables>(MyQuizAttemptDocument, options);
      }
export function useMyQuizAttemptLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyQuizAttemptQuery, MyQuizAttemptQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyQuizAttemptQuery, MyQuizAttemptQueryVariables>(MyQuizAttemptDocument, options);
        }
// @ts-ignore
export function useMyQuizAttemptSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyQuizAttemptQuery, MyQuizAttemptQueryVariables>): Apollo.UseSuspenseQueryResult<MyQuizAttemptQuery, MyQuizAttemptQueryVariables>;
export function useMyQuizAttemptSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyQuizAttemptQuery, MyQuizAttemptQueryVariables>): Apollo.UseSuspenseQueryResult<MyQuizAttemptQuery | undefined, MyQuizAttemptQueryVariables>;
export function useMyQuizAttemptSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyQuizAttemptQuery, MyQuizAttemptQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyQuizAttemptQuery, MyQuizAttemptQueryVariables>(MyQuizAttemptDocument, options);
        }
export type MyQuizAttemptQueryHookResult = ReturnType<typeof useMyQuizAttemptQuery>;
export type MyQuizAttemptLazyQueryHookResult = ReturnType<typeof useMyQuizAttemptLazyQuery>;
export type MyQuizAttemptSuspenseQueryHookResult = ReturnType<typeof useMyQuizAttemptSuspenseQuery>;
export type MyQuizAttemptQueryResult = Apollo.QueryResult<MyQuizAttemptQuery, MyQuizAttemptQueryVariables>;
export const SaveQuizAttemptDocument = gql`
    mutation SaveQuizAttempt($lessonSlug: String!, $quizId: String!, $selectedChoiceId: String!, $submitted: Boolean!) {
  saveQuizAttempt(
    lessonSlug: $lessonSlug
    quizId: $quizId
    selectedChoiceId: $selectedChoiceId
    submitted: $submitted
  ) {
    lessonSlug
    quizId
    selectedChoiceId
    submitted
    updatedAt
  }
}
    `;
export type SaveQuizAttemptMutationFn = Apollo.MutationFunction<SaveQuizAttemptMutation, SaveQuizAttemptMutationVariables>;

/**
 * __useSaveQuizAttemptMutation__
 *
 * To run a mutation, you first call `useSaveQuizAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveQuizAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveQuizAttemptMutation, { data, loading, error }] = useSaveQuizAttemptMutation({
 *   variables: {
 *      lessonSlug: // value for 'lessonSlug'
 *      quizId: // value for 'quizId'
 *      selectedChoiceId: // value for 'selectedChoiceId'
 *      submitted: // value for 'submitted'
 *   },
 * });
 */
export function useSaveQuizAttemptMutation(baseOptions?: Apollo.MutationHookOptions<SaveQuizAttemptMutation, SaveQuizAttemptMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveQuizAttemptMutation, SaveQuizAttemptMutationVariables>(SaveQuizAttemptDocument, options);
      }
export type SaveQuizAttemptMutationHookResult = ReturnType<typeof useSaveQuizAttemptMutation>;
export type SaveQuizAttemptMutationResult = Apollo.MutationResult<SaveQuizAttemptMutation>;
export type SaveQuizAttemptMutationOptions = Apollo.BaseMutationOptions<SaveQuizAttemptMutation, SaveQuizAttemptMutationVariables>;
export const DeleteQuizAttemptDocument = gql`
    mutation DeleteQuizAttempt($lessonSlug: String!, $quizId: String!) {
  deleteQuizAttempt(lessonSlug: $lessonSlug, quizId: $quizId)
}
    `;
export type DeleteQuizAttemptMutationFn = Apollo.MutationFunction<DeleteQuizAttemptMutation, DeleteQuizAttemptMutationVariables>;

/**
 * __useDeleteQuizAttemptMutation__
 *
 * To run a mutation, you first call `useDeleteQuizAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteQuizAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteQuizAttemptMutation, { data, loading, error }] = useDeleteQuizAttemptMutation({
 *   variables: {
 *      lessonSlug: // value for 'lessonSlug'
 *      quizId: // value for 'quizId'
 *   },
 * });
 */
export function useDeleteQuizAttemptMutation(baseOptions?: Apollo.MutationHookOptions<DeleteQuizAttemptMutation, DeleteQuizAttemptMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteQuizAttemptMutation, DeleteQuizAttemptMutationVariables>(DeleteQuizAttemptDocument, options);
      }
export type DeleteQuizAttemptMutationHookResult = ReturnType<typeof useDeleteQuizAttemptMutation>;
export type DeleteQuizAttemptMutationResult = Apollo.MutationResult<DeleteQuizAttemptMutation>;
export type DeleteQuizAttemptMutationOptions = Apollo.BaseMutationOptions<DeleteQuizAttemptMutation, DeleteQuizAttemptMutationVariables>;
export const TracksDocument = gql`
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

/**
 * __useTracksQuery__
 *
 * To run a query within a React component, call `useTracksQuery` and pass it any options that fit your needs.
 * When your component renders, `useTracksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTracksQuery({
 *   variables: {
 *   },
 * });
 */
export function useTracksQuery(baseOptions?: Apollo.QueryHookOptions<TracksQuery, TracksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TracksQuery, TracksQueryVariables>(TracksDocument, options);
      }
export function useTracksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TracksQuery, TracksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TracksQuery, TracksQueryVariables>(TracksDocument, options);
        }
// @ts-ignore
export function useTracksSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TracksQuery, TracksQueryVariables>): Apollo.UseSuspenseQueryResult<TracksQuery, TracksQueryVariables>;
export function useTracksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TracksQuery, TracksQueryVariables>): Apollo.UseSuspenseQueryResult<TracksQuery | undefined, TracksQueryVariables>;
export function useTracksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TracksQuery, TracksQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TracksQuery, TracksQueryVariables>(TracksDocument, options);
        }
export type TracksQueryHookResult = ReturnType<typeof useTracksQuery>;
export type TracksLazyQueryHookResult = ReturnType<typeof useTracksLazyQuery>;
export type TracksSuspenseQueryHookResult = ReturnType<typeof useTracksSuspenseQuery>;
export type TracksQueryResult = Apollo.QueryResult<TracksQuery, TracksQueryVariables>;
export const MyLessonProgressDocument = gql`
    query MyLessonProgress {
  myLessonProgress {
    lessonSlug
    status
    updatedAt
  }
}
    `;

/**
 * __useMyLessonProgressQuery__
 *
 * To run a query within a React component, call `useMyLessonProgressQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyLessonProgressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyLessonProgressQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyLessonProgressQuery(baseOptions?: Apollo.QueryHookOptions<MyLessonProgressQuery, MyLessonProgressQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyLessonProgressQuery, MyLessonProgressQueryVariables>(MyLessonProgressDocument, options);
      }
export function useMyLessonProgressLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyLessonProgressQuery, MyLessonProgressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyLessonProgressQuery, MyLessonProgressQueryVariables>(MyLessonProgressDocument, options);
        }
// @ts-ignore
export function useMyLessonProgressSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyLessonProgressQuery, MyLessonProgressQueryVariables>): Apollo.UseSuspenseQueryResult<MyLessonProgressQuery, MyLessonProgressQueryVariables>;
export function useMyLessonProgressSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyLessonProgressQuery, MyLessonProgressQueryVariables>): Apollo.UseSuspenseQueryResult<MyLessonProgressQuery | undefined, MyLessonProgressQueryVariables>;
export function useMyLessonProgressSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyLessonProgressQuery, MyLessonProgressQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyLessonProgressQuery, MyLessonProgressQueryVariables>(MyLessonProgressDocument, options);
        }
export type MyLessonProgressQueryHookResult = ReturnType<typeof useMyLessonProgressQuery>;
export type MyLessonProgressLazyQueryHookResult = ReturnType<typeof useMyLessonProgressLazyQuery>;
export type MyLessonProgressSuspenseQueryHookResult = ReturnType<typeof useMyLessonProgressSuspenseQuery>;
export type MyLessonProgressQueryResult = Apollo.QueryResult<MyLessonProgressQuery, MyLessonProgressQueryVariables>;
export const SetLessonProgressDocument = gql`
    mutation SetLessonProgress($lessonSlug: String!, $status: LessonStatus!) {
  setLessonProgress(lessonSlug: $lessonSlug, status: $status) {
    lessonSlug
    status
    updatedAt
  }
}
    `;
export type SetLessonProgressMutationFn = Apollo.MutationFunction<SetLessonProgressMutation, SetLessonProgressMutationVariables>;

/**
 * __useSetLessonProgressMutation__
 *
 * To run a mutation, you first call `useSetLessonProgressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetLessonProgressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setLessonProgressMutation, { data, loading, error }] = useSetLessonProgressMutation({
 *   variables: {
 *      lessonSlug: // value for 'lessonSlug'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useSetLessonProgressMutation(baseOptions?: Apollo.MutationHookOptions<SetLessonProgressMutation, SetLessonProgressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetLessonProgressMutation, SetLessonProgressMutationVariables>(SetLessonProgressDocument, options);
      }
export type SetLessonProgressMutationHookResult = ReturnType<typeof useSetLessonProgressMutation>;
export type SetLessonProgressMutationResult = Apollo.MutationResult<SetLessonProgressMutation>;
export type SetLessonProgressMutationOptions = Apollo.BaseMutationOptions<SetLessonProgressMutation, SetLessonProgressMutationVariables>;
export const ResetMyProgressDocument = gql`
    mutation ResetMyProgress {
  resetMyProgress
}
    `;
export type ResetMyProgressMutationFn = Apollo.MutationFunction<ResetMyProgressMutation, ResetMyProgressMutationVariables>;

/**
 * __useResetMyProgressMutation__
 *
 * To run a mutation, you first call `useResetMyProgressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetMyProgressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetMyProgressMutation, { data, loading, error }] = useResetMyProgressMutation({
 *   variables: {
 *   },
 * });
 */
export function useResetMyProgressMutation(baseOptions?: Apollo.MutationHookOptions<ResetMyProgressMutation, ResetMyProgressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResetMyProgressMutation, ResetMyProgressMutationVariables>(ResetMyProgressDocument, options);
      }
export type ResetMyProgressMutationHookResult = ReturnType<typeof useResetMyProgressMutation>;
export type ResetMyProgressMutationResult = Apollo.MutationResult<ResetMyProgressMutation>;
export type ResetMyProgressMutationOptions = Apollo.BaseMutationOptions<ResetMyProgressMutation, ResetMyProgressMutationVariables>;