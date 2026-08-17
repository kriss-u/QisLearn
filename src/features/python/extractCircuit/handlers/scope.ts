import type { ASTNodeUnion } from "py-ast";
import { CIRCUIT_METHOD_NAMES } from "../constants";
import type { ExtractionContext } from "../context";

type ImportNode = Extract<ASTNodeUnion, { nodeType: "Import" }>;
type ImportFromNode = Extract<ASTNodeUnion, { nodeType: "ImportFrom" }>;

export function handleImport(ctx: ExtractionContext, node: ImportNode) {
  for (const alias of node.names) {
    const bound = alias.asname ?? alias.name.split(".")[0];
    ctx.importedNames.add(bound);
    ctx.boundNames.add(bound);
  }
}

export function handleImportFrom(ctx: ExtractionContext, node: ImportFromNode) {
  for (const alias of node.names) {
    const bound = alias.asname ?? alias.name;
    ctx.importedNames.add(bound);
    ctx.boundNames.add(bound);
  }
}

/** Spots `qc.h` referenced without being called (no parens) — a gate isn't applied until `qc.h(0)` runs. */
export function checkBareAttributeReference(ctx: ExtractionContext, node: ASTNodeUnion) {
  if (node.nodeType !== "Attribute" || ctx.handledAttributeCalls.has(node)) return;

  const { value, attr } = node;
  if (
    value.nodeType === "Name" &&
    value.id === ctx.circuitVar &&
    CIRCUIT_METHOD_NAMES.has(attr) &&
    attr !== "measure_all" &&
    attr !== "measure_active"
  ) {
    ctx.report(
      `\`${ctx.circuitVar}.${attr}\` was referenced without calling it — did you mean \`${ctx.circuitVar}.${attr}(...)\`? ` +
        "A gate isn't applied until you call it with the qubit(s) it acts on.",
    );
  }
}
