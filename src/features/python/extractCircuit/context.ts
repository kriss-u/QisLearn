import type { ExprNode } from "py-ast";
import type { Gate } from "../../../content/schema";
import type { ExtractIssue } from "./types";
import { expandRange, numericLiteral, outOfRangeMessage, resolveIndexList } from "./astHelpers";

export interface RegisterInfo {
  size: number;
  name: string;
}

/**
 * Mutable state threaded through a single `extractCircuit` pass: the circuit
 * being built up, the registers/imports/names seen so far, and the
 * issue-reporting/index-resolution helpers every node handler needs.
 */
export class ExtractionContext {
  issues: ExtractIssue[] = [];
  private seenIssues = new Set<string>();

  circuitVar: string | null = null;
  numQubits = 0;
  numClbits = 0;
  circuitName: string | undefined;
  qubitLabels: string[] | undefined;
  classicalRegistersResult: { name: string; size: number }[] | undefined;
  gates: Gate[] = [];
  quantumRegisters = new Map<string, RegisterInfo>();
  classicalRegisters = new Map<string, RegisterInfo>();
  importedNames = new Set<string>();
  boundNames = new Set<string>();

  /** Qubits touched by any gate so far — what `.measure_active()` measures. */
  activeQubits = new Set<number>();

  /** `Attribute` nodes already handled as the callee of a `Call` — used to spot bare `qc.h` references (no parens). */
  handledAttributeCalls = new Set<ExprNode>();

  report(message: string) {
    if (this.seenIssues.has(message)) return;
    this.seenIssues.add(message);
    this.issues.push({ message });
  }

  reportRange(kind: "qubit" | "classical bit", index: number, size: number) {
    if (index >= 0 && index < size) return;
    this.report(outOfRangeMessage(kind, index, size));
  }

  reportMissingQubit(callSyntax: string) {
    this.report(`\`${callSyntax}\` needs at least one qubit argument. Real Qiskit would raise a TypeError here.`);
  }

  requireImport(name: string, suggestion: string) {
    if (!this.importedNames.has(name)) {
      this.report(`\`${name}\` is used but never imported. Add \`${suggestion}\` at the top of your code.`);
    }
  }

  /** A plain int, or `register[i]` where `register` is a tracked register — both mean the same qubit/clbit index. */
  resolveIndex(node: ExprNode, registers: Map<string, RegisterInfo>): number | null {
    const literal = numericLiteral(node);
    if (literal !== null) return literal;
    if (node.nodeType === "Subscript" && node.value.nodeType === "Name" && registers.has(node.value.id)) {
      return numericLiteral(node.slice);
    }
    return null;
  }

  resolveQubitIndex = (node: ExprNode) => this.resolveIndex(node, this.quantumRegisters);

  /**
   * Everything a single qubit/clbit index accepts (see `resolveIndex`), plus
   * the multi-index forms `.measure(...)` uses: `range(...)`, a bare register
   * name (every index in it, in order), or a `List`/`Tuple` mixing any of the
   * above per element.
   */
  resolveIndexSet(node: ExprNode, registers: Map<string, RegisterInfo>): number[] | null {
    if (node.nodeType === "Call") {
      const expanded = expandRange(node);
      if (expanded) return expanded;
    }
    if (node.nodeType === "Name" && registers.has(node.id)) {
      return Array.from({ length: registers.get(node.id)!.size }, (_, i) => i);
    }
    return resolveIndexList(node, (n) => this.resolveIndex(n, registers));
  }

  resolveQubitSet = (node: ExprNode) => this.resolveIndexSet(node, this.quantumRegisters);
  resolveClbitSet = (node: ExprNode) => this.resolveIndexSet(node, this.classicalRegisters);

  /** Each positional arg of `.barrier(...)` accepts a single index, or (like `.measure()`) a register/list/range. */
  resolveQubitArgs(args: ExprNode[]): number[] | null {
    const result: number[] = [];
    for (const arg of args) {
      const single = this.resolveQubitIndex(arg);
      if (single !== null) {
        result.push(single);
        continue;
      }
      const many = this.resolveQubitSet(arg);
      if (many === null) return null;
      result.push(...many);
    }
    return result;
  }

  pushGate(gate: Gate) {
    this.gates.push(gate);
    for (const q of gate.qubits) this.activeQubits.add(q);
  }
}
