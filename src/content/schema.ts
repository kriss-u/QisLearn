import { z } from "zod";

export const LessonLayoutSchema = z.enum(["standard", "circuit-focus", "theory-heavy", "lab"]);
export type LessonLayout = z.infer<typeof LessonLayoutSchema>;

export const GateSchema = z.object({
  gate: z.string(),
  qubits: z.array(z.number().int().nonnegative()),
  params: z.array(z.number()).optional(),
});
export type Gate = z.infer<typeof GateSchema>;

export const CircuitSchema = z.object({
  numQubits: z.number().int().positive(),
  /** From `QuantumCircuit(..., name="...")` — shown as a caption above the diagram. */
  name: z.string().optional(),
  /** Per-qubit wire labels, e.g. `["q_0", "q_1"]` from a named `QuantumRegister`. */
  qubitLabels: z.array(z.string()).optional(),
  gates: z.array(GateSchema),
});
export type Circuit = z.infer<typeof CircuitSchema>;

export const VisualizationViewSchema = z.enum(["circuit", "bloch", "statevector", "probabilities"]);
export type VisualizationView = z.infer<typeof VisualizationViewSchema>;

export const QuizChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  correct: z.boolean(),
});
export type QuizChoice = z.infer<typeof QuizChoiceSchema>;

/**
 * Metadata every lesson .mdx file must export via frontmatter. The lesson
 * body itself (prose, <CodeExercise/>, <Quiz/>, <Visualization/>) is free-form
 * MDX and isn't schema-validated the way this metadata is — see AGENTS.md.
 */
export const LessonFrontmatterSchema = z.object({
  id: z.string(),
  track: z.string(),
  order: z.number(),
  title: z.string(),
  summary: z.string(),
  layout: LessonLayoutSchema.default("standard"),
  estimatedMinutes: z.number().int().positive().default(15),
  prerequisites: z.array(z.string()).default([]),
});
export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;
