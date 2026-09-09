import { createContext, useContext } from "react";

interface LessonContextValue {
  lessonId: string;
  isPreview?: boolean;
}

const LessonContext = createContext<LessonContextValue | null>(null);

export const LessonProvider = LessonContext.Provider;

export function useLessonId(): string {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error("useLessonId must be used within a LessonProvider");
  return ctx.lessonId;
}

// The admin's "Preview" dialog renders real lesson content under a synthetic
// lessonId that doesn't exist in the database, so any progress-persistence
// call (code snapshot / quiz attempt) would 404/error server-side. Callers
// that persist progress must check this and skip the network call.
export function useIsLessonPreview(): boolean {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error("useIsLessonPreview must be used within a LessonProvider");
  return ctx.isPreview ?? false;
}
