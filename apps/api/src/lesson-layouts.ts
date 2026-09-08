export interface LessonLayoutSpec {
  value: string;
  label: string;
}

// The set of valid `lesson.layout` values. Kept as backend-owned data (not a
// DB enum — `lesson.layout` is deliberately free text, see
// packages/db/src/content-schema.ts) so the frontend never hardcodes this
// list and a new layout can be added here without a migration.
export const LESSON_LAYOUTS: LessonLayoutSpec[] = [
  { value: "standard", label: "Standard" },
  { value: "theory-heavy", label: "Theory-heavy" },
  { value: "circuit-focus", label: "Circuit-focus" },
  { value: "lab", label: "Lab" },
];

export const LESSON_LAYOUT_VALUES = LESSON_LAYOUTS.map((l) => l.value);
