import { db } from "./db";
import type { CodeCheckResult, LessonStatus } from "./models";

export async function markLessonStatus(lessonId: string, status: LessonStatus) {
  await db.progress.put({
    id: lessonId,
    lessonId,
    status,
    updatedAt: Date.now(),
  });
}

export async function getLessonProgress(lessonId: string) {
  return db.progress.get(lessonId);
}

export async function saveCodeSnapshot(
  lessonId: string,
  exerciseId: string,
  code: string,
  result: CodeCheckResult | null = null,
) {
  const id = `${lessonId}::${exerciseId}`;
  await db.snapshots.put({ id, lessonId, exerciseId, code, result, savedAt: Date.now() });
}

export async function getCodeSnapshot(lessonId: string, exerciseId: string) {
  return db.snapshots.get(`${lessonId}::${exerciseId}`);
}

export async function saveQuizAnswer(
  lessonId: string,
  quizId: string,
  selectedChoiceId: string,
  checked: boolean,
) {
  const id = `${lessonId}::${quizId}`;
  await db.answers.put({ id, lessonId, quizId, selectedChoiceId, checked, answeredAt: Date.now() });
}

export async function getQuizAnswer(lessonId: string, quizId: string) {
  return db.answers.get(`${lessonId}::${quizId}`);
}

export async function deleteQuizAnswer(lessonId: string, quizId: string) {
  await db.answers.delete(`${lessonId}::${quizId}`);
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key);
  return row ? (row.value as T) : fallback;
}

export async function setSetting<T>(key: string, value: T) {
  await db.settings.put({ key, value });
}

/** Wipes all locally stored data: lesson progress, saved code, quiz answers, and settings. */
export async function resetAllData() {
  await db.transaction("rw", db.progress, db.snapshots, db.answers, db.settings, async () => {
    await Promise.all([db.progress.clear(), db.snapshots.clear(), db.answers.clear(), db.settings.clear()]);
  });
}
