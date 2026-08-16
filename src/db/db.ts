import Dexie, { type EntityTable } from "dexie";
import type { CodeSnapshot, LessonProgress, QuizAnswer, UserSetting } from "./models";

export class QisLearnDB extends Dexie {
  progress!: EntityTable<LessonProgress, "id">;
  snapshots!: EntityTable<CodeSnapshot, "id">;
  settings!: EntityTable<UserSetting, "key">;
  answers!: EntityTable<QuizAnswer, "id">;

  constructor() {
    super("qislearn");
    this.version(1).stores({
      progress: "id, lessonId, status, updatedAt",
      snapshots: "id, lessonId, exerciseId, savedAt",
      settings: "key",
    });
    this.version(2).stores({
      answers: "id, lessonId, quizId, answeredAt",
    });
  }
}

export const db = new QisLearnDB();
