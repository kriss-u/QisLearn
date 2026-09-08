import type { ASTNodeUnion, ExprNode } from "py-ast";
import { CIRCUIT_METHOD_NAMES } from "../constants";
import type { ExtractionContext } from "../context";

type ImportNode = Extract<ASTNodeUnion, { nodeType: "Import" }>;
type ImportFromNode = Extract<ASTNodeUnion, { nodeType: "ImportFrom" }>;
type ForNode = Extract<ASTNodeUnion, { nodeType: "For" | "AsyncFor" }>;
type FunctionDefNode = Extract<ASTNodeUnion, { nodeType: "FunctionDef" | "AsyncFunctionDef" }>;

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

/** Recursively binds every `Name` in a target expression, including `for i, q in ...` tuple/list unpacking. */
function bindTarget(ctx: ExtractionContext, target: ExprNode) {
  if (target.nodeType === "Name") {
    ctx.boundNames.add(target.id);
    return;
  }
  if (target.nodeType === "Tuple" || target.nodeType === "List") {
    for (const elt of target.elts) bindTarget(ctx, elt);
  }
}

/**
 * `for i in range(n): ...` binds the loop variable(s) for the rest of the
 * (flat, single-pass) walk, so a later `qc.h(i)` isn't mistaken for a
 * reference to an undefined name. The loop variable itself still can't be
 * constant-folded to a qubit index (that would require real execution), so
 * gate calls using it still resolve to "needs a qubit argument" rather than
 * a concrete gate, same as any other non-literal expression.
 */
export function handleFor(ctx: ExtractionContext, node: ForNode) {
  bindTarget(ctx, node.target);
}

/** Binds a function's parameter names so calls inside its body don't get flagged as referencing undefined names. */
export function handleFunctionDef(ctx: ExtractionContext, node: FunctionDefNode) {
  ctx.boundNames.add(node.name);
  for (const arg of [...node.args.posonlyargs, ...node.args.args, ...node.args.kwonlyargs]) {
    ctx.boundNames.add(arg.arg);
  }
  if (node.args.vararg) ctx.boundNames.add(node.args.vararg.arg);
  if (node.args.kwarg) ctx.boundNames.add(node.args.kwarg.arg);
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
