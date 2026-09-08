import { create } from "zustand";
import { db } from "../db/db";
import { markLessonStatus, resetAllData } from "../db/repository";
import type { LessonStatus } from "../db/models";

interface ProgressState {
  statusByLesson: Record<string, LessonStatus>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setStatus: (lessonId: string, status: LessonStatus) => Promise<void>;
  resetProgress: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  statusByLesson: {},
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const rows = await db.progress.toArray();
    const statusByLesson: Record<string, LessonStatus> = {};
    for (const row of rows) {
      statusByLesson[row.lessonId] = row.status;
    }
    set({ statusByLesson, hydrated: true });
  },

  setStatus: async (lessonId, status) => {
    if (get().statusByLesson[lessonId] === "completed" && status === "in-progress") return;
    await markLessonStatus(lessonId, status);
    set((state) => ({ statusByLesson: { ...state.statusByLesson, [lessonId]: status } }));
  },

  resetProgress: async () => {
    await resetAllData();
    set({ statusByLesson: {} });
  },
}));
