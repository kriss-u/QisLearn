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

export type ContentBlock = {
  __typename?: 'ContentBlock';
  data: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type Lesson = {
  __typename?: 'Lesson';
  contentBlocks: Array<ContentBlock>;
  estimatedMinutes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  layout: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  prerequisites: Array<Lesson>;
  slug: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  title: Scalars['String']['output'];
  track: Track;
};

export type Query = {
  __typename?: 'Query';
  health: Scalars['String']['output'];
  lesson?: Maybe<Lesson>;
  me?: Maybe<User>;
  tracks: Array<Track>;
};


export type QueryLessonArgs = {
  slug: Scalars['String']['input'];
};

export type Track = {
  __typename?: 'Track';
  id: Scalars['ID']['output'];
  lessons: Array<Lesson>;
  order: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type LessonQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type LessonQuery = { __typename?: 'Query', lesson?: { __typename?: 'Lesson', slug: string, title: string, summary: string, layout: string, order: number, estimatedMinutes: number, track: { __typename?: 'Track', slug: string }, prerequisites: Array<{ __typename?: 'Lesson', slug: string, title: string, summary: string, layout: string, order: number, estimatedMinutes: number, track: { __typename?: 'Track', slug: string } }>, contentBlocks: Array<{ __typename?: 'ContentBlock', id: string, order: number, type: string, data: Record<string, unknown> }> } | null };

export type TracksQueryVariables = Exact<{ [key: string]: never; }>;


export type TracksQuery = { __typename?: 'Query', tracks: Array<{ __typename?: 'Track', slug: string, title: string, order: number, lessons: Array<{ __typename?: 'Lesson', slug: string, title: string, summary: string, layout: string, order: number, estimatedMinutes: number }> }> };


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