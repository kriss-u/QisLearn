import { create } from "zustand";

export type LessonStatus = "not-started" | "in-progress" | "completed";

interface ProgressState {
  statusByLesson: Record<string, LessonStatus>;
  hydrated: boolean;
  setStatusByLesson: (statusByLesson: Record<string, LessonStatus>) => void;
  setHydrated: (hydrated: boolean) => void;
  setLessonStatus: (lessonSlug: string, status: LessonStatus) => void;
}

// Pure state only — no Dexie or GraphQL calls in here. Apollo Client in
// this codebase isn't a safe module-level singleton (root.tsx creates a
// fresh instance per SSR request via useMemo, see lib/apolloClient.ts), so
// the async read/write logic that used to live in this store's actions
// (hydrate/setStatus/resetProgress) now lives in the useProgressSync() hook
// instead, which can pull useApolloClient() from React context. Components
// read this store directly for the synchronous statusByLesson value (e.g.
// AppShell's sidebar badges) and call useProgressSync()'s actions to change it.
export const useProgressStore = create<ProgressState>((set) => ({
  statusByLesson: {},
  hydrated: false,
  setStatusByLesson: (statusByLesson) => set({ statusByLesson }),
  setHydrated: (hydrated) => set({ hydrated }),
  setLessonStatus: (lessonSlug, status) =>
    set((state) => ({ statusByLesson: { ...state.statusByLesson, [lessonSlug]: status } })),
}));
