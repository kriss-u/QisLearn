import { createContext, useContext } from "react";

const LessonContext = createContext<{ lessonId: string } | null>(null);

export const LessonProvider = LessonContext.Provider;

export function useLessonId(): string {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error("useLessonId must be used within a LessonProvider");
  return ctx.lessonId;
}
