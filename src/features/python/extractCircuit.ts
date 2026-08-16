import { parseModule, walk } from "py-ast";
import type { ASTNodeUnion } from "py-ast";
import type { Circuit, Gate } from "../../content/schema";

export interface ExtractIssue {
  message: string;
  line?: number;
}

export interface ExtractResult {
  circuit: Circuit | null;
  issues: ExtractIssue[];
}

function numericLiteral(node: ASTNodeUnion): number | null {
  if (node.nodeType === "Constant" && typeof node.value === "number") {
    return node.value;
  }
  if (node.nodeType === "UnaryOp" && node.op.nodeType === "USub") {
    const inner = numericLiteral(node.operand);
    return inner === null ? null : -inner;
  }
  return null;
}

/**
 * Statically extracts a gate-level circuit description from Qiskit-style Python
 * source, without executing any code. Recognizes `var = QuantumCircuit(n)` and
 * subsequent `var.<gate>(...)` calls on that variable.
 */
export function extractCircuit(source: string): ExtractResult {
  const issues: ExtractIssue[] = [];

  let module;
  try {
    module = parseModule(source);
  } catch (error) {
    return {
      circuit: null,
      issues: [{ message: error instanceof Error ? error.message : "Failed to parse Python source." }],
    };
  }

  let circuitVar: string | null = null;
  let numQubits = 0;
  const gates: Gate[] = [];

  for (const node of walk(module)) {
    if (node.nodeType === "Assign" && node.value.nodeType === "Call") {
      const call = node.value;
      if (call.func.nodeType === "Name" && call.func.id === "QuantumCircuit") {
        const target = node.targets[0];
        if (target?.nodeType === "Name") {
          circuitVar = target.id;
          const arg = call.args[0] ? numericLiteral(call.args[0]) : null;
          numQubits = arg ?? 0;
        }
      }
      continue;
    }

    if (node.nodeType === "Call" && node.func.nodeType === "Attribute") {
      const { value, attr } = node.func;
      if (value.nodeType !== "Name" || value.id !== circuitVar) continue;
      if (attr === "draw" || attr === "measure_all") continue;

      const qubits: number[] = [];
      const params: number[] = [];
      for (const arg of node.args) {
        const num = numericLiteral(arg);
        if (num === null) continue;
        if (Number.isInteger(num) && (attr === "measure" || !params.length)) {
          qubits.push(num);
        } else {
          params.push(num);
        }
      }

      if (["rx", "ry", "rz", "p", "u1"].includes(attr) && node.args.length > 0) {
        const angle = numericLiteral(node.args[0]);
        const qubitArgs = node.args.slice(1).map(numericLiteral).filter((n): n is number => n !== null);
        gates.push({ gate: attr, qubits: qubitArgs, params: angle === null ? undefined : [angle] });
        continue;
      }

      gates.push({ gate: attr, qubits, params: params.length ? params : undefined });
    }
  }

  if (!circuitVar) {
    issues.push({ message: "No `QuantumCircuit(...)` assignment was found." });
    return { circuit: null, issues };
  }

  return { circuit: { numQubits, gates }, issues };
}
