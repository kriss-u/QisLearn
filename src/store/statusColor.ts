import type { LessonStatus } from "../db/models";

export const STATUS_COLOR_PALETTE: Record<LessonStatus, string> = {
  "not-started": "gray",
  "in-progress": "ember",
  completed: "quantum",
};
