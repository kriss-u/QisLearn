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

export type ContentBlockTypeSpec = {
  __typename?: 'ContentBlockTypeSpec';
  fields: Array<ContentBlockFieldSpec>;
  label: Scalars['String']['output'];
  type: Scalars['String']['output'];
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
  createLesson: Lesson;
  createModule: Module;
  createTag: Tag;
  createTrack: Track;
  deleteContentBlock: Scalars['Boolean']['output'];
  deleteLesson: Scalars['Boolean']['output'];
  deleteModule: Scalars['Boolean']['output'];
  deleteQuizAttempt: Scalars['Boolean']['output'];
  resetMyProgress: Scalars['Boolean']['output'];
  saveCodeSnapshot: CodeSnapshot;
  saveQuizAttempt: QuizAttempt;
  setLessonProgress: LessonProgress;
  suggestLessonQuestions: Array<Scalars['String']['output']>;
  updateContentBlock: ContentBlock;
  updateLesson: Lesson;
  updateLessonPrerequisites: Lesson;
  updateLessonTags: Lesson;
  updateModule: Module;
  updateTrack: Track;
};


export type MutationCreateContentBlockArgs = {
  data: Scalars['JSON']['input'];
  lessonId: Scalars['ID']['input'];
  order: Scalars['Int']['input'];
  type: Scalars['String']['input'];
};


export type MutationCreateLessonArgs = {
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


export type MutationUpdateContentBlockArgs = {
  data?: InputMaybe<Scalars['JSON']['input']>;
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateLessonArgs = {
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

export type Query = {
  __typename?: 'Query';
  adminBlockTypes: Array<ContentBlockTypeSpec>;
  adminLesson?: Maybe<Lesson>;
  adminLessonLayouts: Array<LessonLayoutSpec>;
  adminTags: Array<Tag>;
  health: Scalars['String']['output'];
  lesson?: Maybe<Lesson>;
  me?: Maybe<User>;
  myCodeSnapshot?: Maybe<CodeSnapshot>;
  myLessonProgress: Array<LessonProgress>;
  myQuizAttempt?: Maybe<QuizAttempt>;
  tracks: Array<Track>;
};


export type QueryAdminLessonArgs = {
  id: Scalars['ID']['input'];
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

export type AdminTracksQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminTracksQuery = { __typename?: 'Query', tracks: Array<{ __typename?: 'Track', id: string, slug: string, title: string, order: number, modules: Array<{ __typename?: 'Module', id: string, slug: string, title: string, order: number }>, lessons: Array<{ __typename?: 'Lesson', id: string, slug: string, title: string, order: number, difficulty: LessonDifficulty }> }> };

export type AdminLessonQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminLessonQuery = { __typename?: 'Query', adminLesson?: { __typename?: 'Lesson', id: string, slug: string, title: string, summary: string, layout: string, difficulty: LessonDifficulty, order: number, estimatedMinutes: number, track: { __typename?: 'Track', id: string, slug: string, title: string }, module?: { __typename?: 'Module', id: string, slug: string, title: string } | null, tags: Array<{ __typename?: 'Tag', id: string, slug: string, label: string }>, prerequisites: Array<{ __typename?: 'Lesson', id: string, slug: string, title: string }>, contentBlocks: Array<{ __typename?: 'ContentBlock', id: string, order: number, type: string, data: Record<string, unknown> }> } | null };

export type AdminTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminTagsQuery = { __typename?: 'Query', adminTags: Array<{ __typename?: 'Tag', id: string, slug: string, label: string }> };

export type AdminBlockTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminBlockTypesQuery = { __typename?: 'Query', adminBlockTypes: Array<{ __typename?: 'ContentBlockTypeSpec', type: string, label: string, fields: Array<{ __typename?: 'ContentBlockFieldSpec', name: string, label: string, kind: FieldKind, required: boolean }> }> };

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
export const AdminBlockTypesDocument = gql`
    query AdminBlockTypes {
  adminBlockTypes {
    type
    label
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
 * __useAdminBlockTypesQuery__
 *
 * To run a query within a React component, call `useAdminBlockTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminBlockTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminBlockTypesQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminBlockTypesQuery(baseOptions?: Apollo.QueryHookOptions<AdminBlockTypesQuery, AdminBlockTypesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminBlockTypesQuery, AdminBlockTypesQueryVariables>(AdminBlockTypesDocument, options);
      }
export function useAdminBlockTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminBlockTypesQuery, AdminBlockTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminBlockTypesQuery, AdminBlockTypesQueryVariables>(AdminBlockTypesDocument, options);
        }
// @ts-ignore
export function useAdminBlockTypesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AdminBlockTypesQuery, AdminBlockTypesQueryVariables>): Apollo.UseSuspenseQueryResult<AdminBlockTypesQuery, AdminBlockTypesQueryVariables>;
export function useAdminBlockTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminBlockTypesQuery, AdminBlockTypesQueryVariables>): Apollo.UseSuspenseQueryResult<AdminBlockTypesQuery | undefined, AdminBlockTypesQueryVariables>;
export function useAdminBlockTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AdminBlockTypesQuery, AdminBlockTypesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AdminBlockTypesQuery, AdminBlockTypesQueryVariables>(AdminBlockTypesDocument, options);
        }
export type AdminBlockTypesQueryHookResult = ReturnType<typeof useAdminBlockTypesQuery>;
export type AdminBlockTypesLazyQueryHookResult = ReturnType<typeof useAdminBlockTypesLazyQuery>;
export type AdminBlockTypesSuspenseQueryHookResult = ReturnType<typeof useAdminBlockTypesSuspenseQuery>;
export type AdminBlockTypesQueryResult = Apollo.QueryResult<AdminBlockTypesQuery, AdminBlockTypesQueryVariables>;
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
    mutation CreateLesson($trackId: ID!, $moduleId: ID, $slug: String!, $title: String!, $summary: String!, $layout: String!, $difficulty: LessonDifficulty!, $order: Int!, $estimatedMinutes: Int!) {
  createLesson(
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
    mutation UpdateLesson($id: ID!, $trackId: ID, $moduleId: ID, $slug: String, $title: String, $summary: String, $layout: String, $difficulty: LessonDifficulty, $order: Int, $estimatedMinutes: Int) {
  updateLesson(
    id: $id
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