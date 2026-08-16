import { z } from "zod";

export const LessonStatusSchema = z.enum(["not-started", "in-progress", "completed"]);
export type LessonStatus = z.infer<typeof LessonStatusSchema>;

export const LessonProgressSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  status: LessonStatusSchema,
  updatedAt: z.number(),
});
export type LessonProgress = z.infer<typeof LessonProgressSchema>;

export const CodeSnapshotSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  exerciseId: z.string(),
  code: z.string(),
  savedAt: z.number(),
});
export type CodeSnapshot = z.infer<typeof CodeSnapshotSchema>;

export const QuizAnswerSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  quizId: z.string(),
  selectedChoiceId: z.string(),
  checked: z.boolean(),
  answeredAt: z.number(),
});
export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;

export const UserSettingSchema = z.object({
  key: z.string(),
  value: z.unknown(),
});
export type UserSetting = z.infer<typeof UserSettingSchema>;
