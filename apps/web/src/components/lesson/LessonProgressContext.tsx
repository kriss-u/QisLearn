import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface LessonProgressValue {
  registerExercise: (id: string) => () => void;
  reportResult: (id: string, correct: boolean) => void;
  allExercisesCorrect: boolean;
  contentReady: boolean;
}

const LessonProgressContext = createContext<LessonProgressValue | null>(null);

export function LessonProgressProvider({ lessonId, children }: { lessonId: string; children: ReactNode }) {
  const [results, setResults] = useState<Record<string, boolean>>({});
  // Content now arrives fully resolved via the route loader by render time,
  // so there's no async load step left to gate on (unlike the old lazy MDX
  // chunk import this used to await).
  const [contentReady, setContentReady] = useState(true);

  useEffect(() => {
    setResults({});
    setContentReady(true);
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
