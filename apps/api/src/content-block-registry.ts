import { z, type ZodTypeAny } from "zod";

// Mirrors apps/web/src/content/schema.ts's Gate/Circuit/VisualizationView/
// QuizChoice zod fragments. Duplicated rather than imported because apps/api
// and apps/web don't share a content-schema package yet; keep the two in
// sync by hand until that's worth extracting.
const GateSchema = z.object({
  gate: z.string(),
  qubits: z.array(z.number().int().nonnegative()),
  params: z.array(z.number()).optional(),
  clbits: z.array(z.number().int().nonnegative()).optional(),
});

const CircuitSchema = z.object({
  numQubits: z.number().int().positive(),
  name: z.string().optional(),
  qubitLabels: z.array(z.string()).optional(),
  classicalRegisters: z.array(z.object({ name: z.string(), size: z.number().int().positive() })).optional(),
  gates: z.array(GateSchema),
});

const VisualizationViewSchema = z.enum(["circuit", "bloch", "statevector", "probabilities", "table"]);

const QuizChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  correct: z.boolean(),
});

const MatrixPresetSchema = z.object({
  id: z.string(),
  label: z.string(),
  matrix: z.tuple([z.tuple([z.number(), z.number()]), z.tuple([z.number(), z.number()])]),
});

/**
 * How the admin UI should render a field's editor. A small fixed set that
 * every content_block type's shape reduces to — new block types reuse these
 * kinds rather than each needing bespoke frontend code.
 */
export type FieldKind =
  | "string"
  | "longText"
  | "markdown"
  | "inlineMath"
  | "number"
  | "boolean"
  | "stringArray"
  | "numberArray"
  | "circuit"
  | "quizChoices"
  | "visualizationViews"
  | "matrixPresets";

export interface FieldSpec {
  name: string;
  label: string;
  kind: FieldKind;
  required: boolean;
}

export interface ContentBlockTypeSpec {
  type: string;
  label: string;
  fields: FieldSpec[];
}

interface RegistryEntry extends ContentBlockTypeSpec {
  schema: ZodTypeAny;
}

function entry(type: string, label: string, schema: ZodTypeAny, fields: FieldSpec[]): RegistryEntry {
  return { type, label, schema, fields };
}

// One entry per content_block.type in use across mdxComponents.ts. type/
// layout stay free text at the DB layer (packages/db/src/content-schema.ts)
// so a new type can be added here, in mdxComponents.ts, and in its React
// component without a migration.
export const CONTENT_BLOCK_REGISTRY: RegistryEntry[] = [
  entry("markdown", "Markdown", z.object({ text: z.string() }), [
    { name: "text", label: "Text", kind: "markdown", required: true },
  ]),

  entry(
    "QiskitCodeExercise",
    "Qiskit code exercise",
    z.object({
      id: z.string(),
      prompt: z.string(),
      starterCode: z.string(),
      solutionCode: z.string().optional(),
      expectedCircuit: CircuitSchema.optional(),
      hints: z.array(z.string()).optional(),
    }),
    [
      { name: "id", label: "ID", kind: "string", required: true },
      { name: "prompt", label: "Prompt", kind: "markdown", required: true },
      { name: "starterCode", label: "Starter code", kind: "longText", required: true },
      { name: "solutionCode", label: "Solution code", kind: "longText", required: false },
      { name: "expectedCircuit", label: "Expected circuit", kind: "circuit", required: false },
      { name: "hints", label: "Hints", kind: "stringArray", required: false },
    ],
  ),

  entry(
    "Quiz",
    "Quiz",
    z.object({
      id: z.string(),
      question: z.string(),
      choices: z.array(QuizChoiceSchema),
      explanation: z.string().optional(),
    }),
    [
      { name: "id", label: "ID", kind: "string", required: true },
      { name: "question", label: "Question", kind: "markdown", required: true },
      { name: "choices", label: "Choices", kind: "quizChoices", required: true },
      { name: "explanation", label: "Explanation", kind: "markdown", required: false },
    ],
  ),

  entry(
    "Visualization",
    "Visualization",
    z.object({
      title: z.string(),
      description: z.string().optional(),
      circuit: CircuitSchema,
      views: z.array(VisualizationViewSchema).optional(),
    }),
    [
      { name: "title", label: "Title", kind: "inlineMath", required: true },
      { name: "description", label: "Description", kind: "markdown", required: false },
      { name: "circuit", label: "Circuit", kind: "circuit", required: true },
      { name: "views", label: "Views", kind: "visualizationViews", required: false },
    ],
  ),

  entry(
    "Measurement",
    "Measurement",
    z.object({
      title: z.string(),
      description: z.string().optional(),
      circuit: CircuitSchema,
      shotsOptions: z.array(z.number().int().positive()).optional(),
    }),
    [
      { name: "title", label: "Title", kind: "inlineMath", required: true },
      { name: "description", label: "Description", kind: "markdown", required: false },
      { name: "circuit", label: "Circuit", kind: "circuit", required: true },
      { name: "shotsOptions", label: "Shots options", kind: "numberArray", required: false },
    ],
  ),

  entry(
    "OracleFigure",
    "Oracle figure",
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      inputLabels: z.array(z.string()),
      ancillaInLabel: z.string().optional(),
      ancillaOutLabel: z.string().optional(),
      boxLabel: z.string().optional(),
    }),
    [
      { name: "title", label: "Title", kind: "inlineMath", required: false },
      { name: "description", label: "Description", kind: "markdown", required: false },
      { name: "inputLabels", label: "Input labels", kind: "stringArray", required: true },
      { name: "ancillaInLabel", label: "Ancilla in label", kind: "string", required: false },
      { name: "ancillaOutLabel", label: "Ancilla out label", kind: "string", required: false },
      { name: "boxLabel", label: "Box label", kind: "string", required: false },
    ],
  ),

  entry(
    "ComplexPlaneExplorer",
    "Complex plane explorer",
    z.object({ title: z.string().optional(), description: z.string().optional() }),
    [
      { name: "title", label: "Title", kind: "inlineMath", required: false },
      { name: "description", label: "Description", kind: "markdown", required: false },
    ],
  ),

  entry(
    "MatrixTransformPlayground",
    "Matrix transform playground",
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      presets: z.array(MatrixPresetSchema),
      defaultPresetId: z.string().optional(),
      showTrace: z.boolean().optional(),
      showEigenReadout: z.boolean().optional(),
    }),
    [
      { name: "title", label: "Title", kind: "inlineMath", required: false },
      { name: "description", label: "Description", kind: "markdown", required: false },
      { name: "presets", label: "Presets", kind: "matrixPresets", required: true },
      { name: "defaultPresetId", label: "Default preset ID", kind: "string", required: false },
      { name: "showTrace", label: "Show trace", kind: "boolean", required: false },
      { name: "showEigenReadout", label: "Show eigen readout", kind: "boolean", required: false },
    ],
  ),

  entry(
    "TensorProductBuilder",
    "Tensor product builder",
    z.object({ title: z.string().optional(), description: z.string().optional() }),
    [
      { name: "title", label: "Title", kind: "inlineMath", required: false },
      { name: "description", label: "Description", kind: "markdown", required: false },
    ],
  ),

  entry(
    "GroverRotationPlayground",
    "Grover rotation playground",
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      nOptions: z.array(z.number().int().positive()).optional(),
    }),
    [
      { name: "title", label: "Title", kind: "inlineMath", required: false },
      { name: "description", label: "Description", kind: "markdown", required: false },
      { name: "nOptions", label: "N options", kind: "numberArray", required: false },
    ],
  ),

  entry(
    "QFTPhaseWheel",
    "QFT phase wheel",
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      numQubits: z.number().int().positive().optional(),
    }),
    [
      { name: "title", label: "Title", kind: "inlineMath", required: false },
      { name: "description", label: "Description", kind: "markdown", required: false },
      { name: "numQubits", label: "Number of qubits", kind: "number", required: false },
    ],
  ),

  entry(
    "PhaseEstimationPlayground",
    "Phase estimation playground",
    z.object({ title: z.string().optional(), description: z.string().optional() }),
    [
      { name: "title", label: "Title", kind: "inlineMath", required: false },
      { name: "description", label: "Description", kind: "markdown", required: false },
    ],
  ),

  entry(
    "ModularExponentiationExplorer",
    "Modular exponentiation explorer",
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      modulus: z.number().int().positive().optional(),
      bases: z.array(z.number().int().positive()).optional(),
      maxK: z.number().int().positive().optional(),
    }),
    [
      { name: "title", label: "Title", kind: "inlineMath", required: false },
      { name: "description", label: "Description", kind: "markdown", required: false },
      { name: "modulus", label: "Modulus", kind: "number", required: false },
      { name: "bases", label: "Bases", kind: "numberArray", required: false },
      { name: "maxK", label: "Max k", kind: "number", required: false },
    ],
  ),
];

const REGISTRY_BY_TYPE = new Map(CONTENT_BLOCK_REGISTRY.map((e) => [e.type, e]));

export function getContentBlockSpec(type: string): ContentBlockTypeSpec | undefined {
  const found = REGISTRY_BY_TYPE.get(type);
  return found && { type: found.type, label: found.label, fields: found.fields };
}

/** Throws a zod error (caller wraps it as a GraphQLError) if `data` doesn't match `type`'s registered shape. */
export function validateContentBlockData(type: string, data: unknown): Record<string, unknown> {
  const found = REGISTRY_BY_TYPE.get(type);
  if (!found) {
    throw new Error(`Unknown content block type: ${type}`);
  }
  return found.schema.parse(data) as Record<string, unknown>;
}
