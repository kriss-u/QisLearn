import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadLessonContent } from "../../content";

interface LessonProgressValue {
  registerExercise: (id: string) => () => void;
  reportResult: (id: string, correct: boolean) => void;
  allExercisesCorrect: boolean;
  contentReady: boolean;
}

const LessonProgressContext = createContext<LessonProgressValue | null>(null);

export function LessonProgressProvider({ lessonId, children }: { lessonId: string; children: ReactNode }) {
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    setResults({});
    setContentReady(false);
    let cancelled = false;
    loadLessonContent(lessonId).then(() => {
      if (!cancelled) setContentReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const registerExercise = useCallback((id: string) => {
    setResults((prev) => (id in prev ? prev : { ...prev, [id]: false }));
    return () => {
      setResults((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };
  }, []);

  const reportResult = useCallback((id: string, correct: boolean) => {
    setResults((prev) => (prev[id] === correct ? prev : { ...prev, [id]: correct }));
  }, []);

  const allExercisesCorrect = useMemo(() => Object.values(results).every(Boolean), [results]);

  const value = useMemo(
    () => ({ registerExercise, reportResult, allExercisesCorrect, contentReady }),
    [registerExercise, reportResult, allExercisesCorrect, contentReady],
  );

  return <LessonProgressContext.Provider value={value}>{children}</LessonProgressContext.Provider>;
}

export function useLessonProgress(): LessonProgressValue {
  const ctx = useContext(LessonProgressContext);
  if (!ctx) throw new Error("useLessonProgress must be used within a LessonProgressProvider");
  return ctx;
}
