import type { ASTNodeUnion, ExprNode } from "py-ast";
import { GATE_CLASS_OVERRIDES } from "./constants";

export function gateKeyFromClassName(className: string): string {
  const stripped = className.replace(/Gate$/, "");
  return GATE_CLASS_OVERRIDES[stripped.toLowerCase()] ?? stripped.toLowerCase();
}

export function identifierName(node: ExprNode): string | null {
  if (node.nodeType === "Name") return node.id;
  if (node.nodeType === "Attribute") return node.attr;
  return null;
}

const PI_MODULES = new Set(["math", "np", "numpy"]);

/**
 * Numeric literals, plus what real Qiskit angle arguments actually look like:
 * `math.pi`/`np.pi`/`numpy.pi`, unary minus, and `+`/`-`/`*`/`/` between
 * resolvable sub-expressions (e.g. `math.pi / 2`). Still a constant fold, not
 * a general evaluator — anything involving a variable or function call still
 * resolves to `null`, same as before.
 */
export function numericLiteral(node: ASTNodeUnion): number | null {
  if (node.nodeType === "Constant" && typeof node.value === "number") {
    return node.value;
  }
  if (node.nodeType === "UnaryOp" && node.op.nodeType === "USub") {
    const inner = numericLiteral(node.operand);
    return inner === null ? null : -inner;
  }
  if (node.nodeType === "Attribute" && node.attr === "pi" && node.value.nodeType === "Name" && PI_MODULES.has(node.value.id)) {
    return Math.PI;
  }
  if (node.nodeType === "BinOp") {
    const left = numericLiteral(node.left);
    const right = numericLiteral(node.right);
    if (left === null || right === null) return null;
    switch (node.op.nodeType) {
      case "Add":
        return left + right;
      case "Sub":
        return left - right;
      case "Mult":
        return left * right;
      case "Div":
        return left / right;
      default:
        return null;
    }
  }
  return null;
}

export function stringLiteral(node: ASTNodeUnion): string | null {
  return node.nodeType === "Constant" && typeof node.value === "string" ? node.value : null;
}

export function keywordArg(call: { keywords: Array<{ arg?: string; value: ExprNode }> }, name: string): ExprNode | null {
  return call.keywords.find((kw) => kw.arg === name)?.value ?? null;
}

/** Resolves a single index arg via `resolve`, or every element if it's a `List`/`Tuple`. */
export function resolveIndexList(node: ExprNode, resolve: (n: ExprNode) => number | null): number[] | null {
  if (node.nodeType === "List" || node.nodeType === "Tuple") {
    const values = node.elts.map(resolve);
    return values.every((v): v is number => v !== null) ? values : null;
  }
  const single = resolve(node);
  return single === null ? null : [single];
}

/** `range(n)`, `range(a, b)`, or `range(a, b, step)` — all-literal args only. */
export function expandRange(call: { func: ExprNode; args: ASTNodeUnion[] }): number[] | null {
  if (call.func.nodeType !== "Name" || call.func.id !== "range") return null;
  const args = call.args.map(numericLiteral);
  if (args.some((a) => a === null) || args.length < 1 || args.length > 3) return null;
  const nums = args as number[];
  const [start, stop, step] =
    nums.length === 1 ? [0, nums[0], 1] : nums.length === 2 ? [nums[0], nums[1], 1] : nums;
  if (step === 0) return null;

  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i < stop; i += step) result.push(i);
  } else {
    for (let i = start; i > stop; i += step) result.push(i);
  }
  return result;
}

export function outOfRangeMessage(kind: "qubit" | "classical bit", index: number, size: number): string {
  const noun = kind === "qubit" ? "qubit" : "classical bit";
  const range = size > 0 ? `0 to ${size - 1}` : `none — it has 0 ${noun}s`;
  return (
    `${kind === "qubit" ? "Qubit" : "Classical bit"} index ${index} is out of range: this circuit only has ` +
    `${size} ${noun}${size === 1 ? "" : "s"} (valid indices: ${range}). Real Qiskit would raise a CircuitError here.`
  );
}
