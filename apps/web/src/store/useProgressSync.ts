import { useApolloClient } from "@apollo/client";
import {
  MyLessonProgressDocument,
  ResetMyProgressDocument,
  SetLessonProgressDocument,
  type LessonStatus as GraphQLLessonStatus,
  type MyLessonProgressQuery,
  type ResetMyProgressMutation,
  type SetLessonProgressMutation,
} from "@qislearn/graphql-schema";
import { useCallback } from "react";
import { useSession } from "../lib/authClient";
import { useProgressStore, type LessonStatus } from "./progressStore";

function toGraphQLStatus(status: LessonStatus): GraphQLLessonStatus {
  return status.toUpperCase().replace(/-/g, "_") as GraphQLLessonStatus;
}

function fromGraphQLStatus(status: GraphQLLessonStatus): LessonStatus {
  return status.toLowerCase().replace(/_/g, "-") as LessonStatus;
}

/**
 * The async read/write side of lesson-progress state: talks to the API via
 * Apollo, then writes results into the plain progressStore (see that file
 * for why the store itself stays synchronous-only). No-ops when logged out
 * — there's no server-side row to sync to, and this app never blocks
 * browsing on being logged in (see AGENTS.md/docs/BACKEND_PLAN.md).
 */
export function useProgressSync() {
  const client = useApolloClient();
  const { data: session, isPending: sessionPending } = useSession();
  const setStatusByLesson = useProgressStore((s) => s.setStatusByLesson);
  const setHydrated = useProgressStore((s) => s.setHydrated);
  const setLessonStatus = useProgressStore((s) => s.setLessonStatus);
  const hydrated = useProgressStore((s) => s.hydrated);
  const statusByLesson = useProgressStore((s) => s.statusByLesson);

  const hydrate = useCallback(async () => {
    if (hydrated || sessionPending) return;
    if (!session) {
      setHydrated(true);
      return;
    }
    const { data } = await client.query<MyLessonProgressQuery>({
      query: MyLessonProgressDocument,
      fetchPolicy: "network-only",
    });
    const next: Record<string, LessonStatus> = {};
    for (const row of data.myLessonProgress) {
      next[row.lessonSlug] = fromGraphQLStatus(row.status);
    }
    setStatusByLesson(next);
    setHydrated(true);
  }, [client, hydrated, session, setHydrated, setStatusByLesson]);

  const setStatus = useCallback(
    async (lessonSlug: string, status: LessonStatus) => {
      // Client-side mirror of the server's own "never downgrade completed"
      // guard (apps/api/src/schema.ts) — snappier UI feedback before the
      // mutation round-trips, redundant but harmless with the server check.
      if (statusByLesson[lessonSlug] === "completed" && status === "in-progress") return;
      setLessonStatus(lessonSlug, status);
      if (!session) return;
      await client.mutate<SetLessonProgressMutation>({
        mutation: SetLessonProgressDocument,
        variables: { lessonSlug, status: toGraphQLStatus(status) },
      });
    },
    [client, session, statusByLesson, setLessonStatus],
  );

  const resetProgress = useCallback(async () => {
    if (session) {
      await client.mutate<ResetMyProgressMutation>({ mutation: ResetMyProgressDocument });
    }
    setStatusByLesson({});
  }, [client, session, setStatusByLesson]);

  return { hydrate, setStatus, resetProgress };
}
