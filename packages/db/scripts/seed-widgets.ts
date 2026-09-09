import { createDb } from "../src/index.js";
import { widget, widgetCategory, widgetWidgetCategory } from "../src/content-schema.js";

// Seeds the widget catalog from CONTENT_BLOCK_REGISTRY's current entries
// (apps/api/src/content-block-registry.ts) — kept here rather than
// generated from that file so the catalog can list widgets ahead of a
// working component (implemented: false) without apps/api needing to
// import packages/db's seed script.
const CATEGORIES = [
  { slug: "math", label: "Math" },
  { slug: "quantum", label: "Quantum" },
  { slug: "science", label: "Science" },
] as const;

const WIDGETS: { key: string; label: string; implemented: boolean; categories: string[] }[] = [
  { key: "markdown", label: "Markdown", implemented: true, categories: [] },
  { key: "QiskitCodeExercise", label: "Qiskit code exercise", implemented: true, categories: ["quantum"] },
  { key: "Quiz", label: "Quiz", implemented: true, categories: ["quantum"] },
  { key: "Visualization", label: "Visualization", implemented: true, categories: ["quantum"] },
  { key: "Measurement", label: "Measurement", implemented: true, categories: ["quantum"] },
  { key: "OracleFigure", label: "Oracle figure", implemented: true, categories: ["quantum"] },
  { key: "ComplexPlaneExplorer", label: "Complex plane explorer", implemented: true, categories: ["math"] },
  { key: "MatrixTransformPlayground", label: "Matrix transform playground", implemented: true, categories: ["math", "quantum"] },
  { key: "TensorProductBuilder", label: "Tensor product builder", implemented: true, categories: ["math", "quantum"] },
  { key: "GroverRotationPlayground", label: "Grover rotation playground", implemented: true, categories: ["math", "quantum"] },
  { key: "QFTPhaseWheel", label: "QFT phase wheel", implemented: true, categories: ["math", "quantum"] },
  { key: "PhaseEstimationPlayground", label: "Phase estimation playground", implemented: true, categories: ["math", "quantum"] },
  { key: "ModularExponentiationExplorer", label: "Modular exponentiation explorer", implemented: true, categories: ["math", "quantum"] },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  const db = createDb(databaseUrl);

  const categoryIdBySlug = new Map<string, string>();
  for (const category of CATEGORIES) {
    const [row] = await db
      .insert(widgetCategory)
      .values(category)
      .onConflictDoUpdate({ target: widgetCategory.slug, set: { label: category.label } })
      .returning({ id: widgetCategory.id });
    if (!row) throw new Error(`Failed to upsert widget category ${category.slug}`);
    categoryIdBySlug.set(category.slug, row.id);
  }

  for (const [index, entry] of WIDGETS.entries()) {
    const [row] = await db
      .insert(widget)
      .values({ key: entry.key, label: entry.label, implemented: entry.implemented, order: index })
      .onConflictDoUpdate({
        target: widget.key,
        set: { label: entry.label, implemented: entry.implemented, order: index },
      })
      .returning({ id: widget.id });
    if (!row) throw new Error(`Failed to upsert widget ${entry.key}`);

    for (const categorySlug of entry.categories) {
      const categoryId = categoryIdBySlug.get(categorySlug);
      if (!categoryId) continue;
      await db.insert(widgetWidgetCategory).values({ widgetId: row.id, categoryId }).onConflictDoNothing();
    }
  }

  console.log(`Seeded ${CATEGORIES.length} widget categories and ${WIDGETS.length} widgets.`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
