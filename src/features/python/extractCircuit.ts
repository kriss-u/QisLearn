import { parseModule, walk } from "py-ast";
import type { ASTNodeUnion, ExprNode } from "py-ast";
import type { Circuit, Gate } from "../../content/schema";

export interface ExtractIssue {
  message: string;
  line?: number;
}

export interface ExtractResult {
  circuit: Circuit | null;
  issues: ExtractIssue[];
}

/** `XGate` -> "x", `SwapGate` -> "swap", `PhaseGate`/`PGate` -> "p", etc. */
const GATE_CLASS_OVERRIDES: Record<string, string> = {
  phasegate: "p",
  cnotgate: "cx",
  idgate: "id",
};

/** Circuit-method names understood as "this call is meant to act on a QuantumCircuit". */
const CIRCUIT_METHOD_NAMES = new Set([
  "x",
  "y",
  "z",
  "h",
  "s",
  "sdg",
  "t",
  "tdg",
  "id",
  "rx",
  "ry",
  "rz",
  "p",
  "u1",
  "cx",
  "cnot",
  "cz",
  "swap",
  "append",
  "measure",
  "measure_all",
  "measure_active",
  "barrier",
]);

/** Single-qubit gate methods that accept a list of qubits to broadcast over, e.g. `qc.h([0, 1, 2])`. */
const BROADCASTABLE_GATES = new Set(["x", "y", "z", "h", "s", "sdg", "t", "tdg", "id"]);

function gateKeyFromClassName(className: string): string {
  const stripped = className.replace(/Gate$/, "");
  return GATE_CLASS_OVERRIDES[stripped.toLowerCase()] ?? stripped.toLowerCase();
}

function identifierName(node: ExprNode): string | null {
  if (node.nodeType === "Name") return node.id;
  if (node.nodeType === "Attribute") return node.attr;
  return null;
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

function stringLiteral(node: ASTNodeUnion): string | null {
  return node.nodeType === "Constant" && typeof node.value === "string" ? node.value : null;
}

function keywordArg(call: { keywords: Array<{ arg?: string; value: ExprNode }> }, name: string): ExprNode | null {
  return call.keywords.find((kw) => kw.arg === name)?.value ?? null;
}

/** Resolves a single index arg via `resolve`, or every element if it's a `List`/`Tuple`. */
function resolveIndexList(node: ExprNode, resolve: (n: ExprNode) => number | null): number[] | null {
  if (node.nodeType === "List" || node.nodeType === "Tuple") {
    const values = node.elts.map(resolve);
    return values.every((v): v is number => v !== null) ? values : null;
  }
  const single = resolve(node);
  return single === null ? null : [single];
}

/** `range(n)`, `range(a, b)`, or `range(a, b, step)` — all-literal args only. */
function expandRange(call: { func: ExprNode; args: ASTNodeUnion[] }): number[] | null {
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

function outOfRangeMessage(kind: "qubit" | "classical bit", index: number, size: number): string {
  const noun = kind === "qubit" ? "qubit" : "classical bit";
  const range = size > 0 ? `0 to ${size - 1}` : `none — it has 0 ${noun}s`;
  return (
    `${kind === "qubit" ? "Qubit" : "Classical bit"} index ${index} is out of range: this circuit only has ` +
    `${size} ${noun}${size === 1 ? "" : "s"} (valid indices: ${range}). Real Qiskit would raise a CircuitError here.`
  );
}

/**
 * Statically extracts a gate-level circuit description from Qiskit-style Python
 * source, without executing any code. Understands three ways learners might
 * build up a circuit:
 *   - `var = QuantumCircuit(n)` or `QuantumCircuit(n, m)` — plain qubit (and
 *     optionally classical bit) count
 *   - `qr = QuantumRegister(n, "name"); var = QuantumCircuit(qr, ...)` — register-based,
 *     which also derives per-qubit wire labels (`"name_0"`, `"name_1"`, ...); a
 *     `ClassicalRegister` works the same way for classical bit count
 *   - `var.<gate>(...)` and `var.append(<GateClass>(...), [qubits])` — both gate styles
 * `QuantumCircuit(..., name="...")` is captured too (shown as a caption in
 * `CircuitDiagram`).
 *
 * Qubit/classical-bit *arguments* accept the same shapes Qiskit itself does:
 * a plain int, `register[i]` (an already-tracked register's subscript resolves
 * to the same index — real slice objects like `qr[0:2]` are not supported), or
 * — for single-qubit gate methods only (`BROADCASTABLE_GATES`) — a list of
 * qubits to broadcast the same gate over, e.g. `qc.h([0, 1, 2])`, which expands
 * to three separate `Gate` entries (matching what Qiskit's own circuit actually
 * records).
 *
 * `.barrier()` is recognized with the same argument shapes real Qiskit accepts:
 * no args (all qubits), one or more plain ints, a list/range, or a register —
 * recorded as a `Gate` with `gate: "barrier"` and an empty `qubits` array
 * standing for "all qubits" (resolved against `Circuit.numQubits` wherever it's
 * consumed, since the gate itself doesn't carry the circuit's qubit count).
 *
 * Three classes of mistake are caught and reported as issues rather than
 * silently producing a nonsense `Circuit`, mirroring what real Qiskit/Python
 * would refuse to run:
 *   - an out-of-range qubit or classical-bit index (`CircuitError` in Qiskit)
 *   - `QuantumCircuit`/`QuantumRegister`/`ClassicalRegister`/a gate class used
 *     without being imported, or a circuit variable used before assignment
 *     (`NameError` in Python) — this is a simple single-pass, top-level-only
 *     scope check (no branches/loops/functions), which is all lesson exercises
 *     ever need.
 */
export function extractCircuit(source: string): ExtractResult {
  const issues: ExtractIssue[] = [];
  const seenIssues = new Set<string>();

  function report(message: string) {
    if (seenIssues.has(message)) return;
    seenIssues.add(message);
    issues.push({ message });
  }

  function reportRange(kind: "qubit" | "classical bit", index: number, size: number) {
    if (index >= 0 && index < size) return;
    report(outOfRangeMessage(kind, index, size));
  }

  function reportMissingQubit(callSyntax: string) {
    report(`\`${callSyntax}\` needs at least one qubit argument. Real Qiskit would raise a TypeError here.`);
  }

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
  let numClbits = 0;
  let circuitName: string | undefined;
  let qubitLabels: string[] | undefined;
  const gates: Gate[] = [];
  const quantumRegisters = new Map<string, { size: number; name: string }>();
  const classicalRegisters = new Map<string, { size: number }>();
  const importedNames = new Set<string>();
  const boundNames = new Set<string>();

  function requireImport(name: string, suggestion: string) {
    if (!importedNames.has(name)) {
      report(`\`${name}\` is used but never imported. Add \`${suggestion}\` at the top of your code.`);
    }
  }

  /** A plain int, or `register[i]` where `register` is a tracked register — both mean the same qubit/clbit index. */
  function resolveIndex(node: ExprNode, registers: Map<string, { size: number }>): number | null {
    const literal = numericLiteral(node);
    if (literal !== null) return literal;
    if (node.nodeType === "Subscript" && node.value.nodeType === "Name" && registers.has(node.value.id)) {
      return numericLiteral(node.slice);
    }
    return null;
  }
  const resolveQubitIndex = (node: ExprNode) => resolveIndex(node, quantumRegisters);

  /**
   * Everything a single qubit/clbit index accepts (see `resolveIndex`), plus
   * the multi-index forms `.measure(...)` uses: `range(...)`, a bare register
   * name (every index in it, in order), or a `List`/`Tuple` mixing any of the
   * above per element.
   */
  function resolveIndexSet(node: ExprNode, registers: Map<string, { size: number }>): number[] | null {
    if (node.nodeType === "Call") {
      const expanded = expandRange(node);
      if (expanded) return expanded;
    }
    if (node.nodeType === "Name" && registers.has(node.id)) {
      return Array.from({ length: registers.get(node.id)!.size }, (_, i) => i);
    }
    return resolveIndexList(node, (n) => resolveIndex(n, registers));
  }
  const resolveQubitSet = (node: ExprNode) => resolveIndexSet(node, quantumRegisters);
  const resolveClbitSet = (node: ExprNode) => resolveIndexSet(node, classicalRegisters);

  /** Each positional arg of `.barrier(...)` accepts a single index, or (like `.measure()`) a register/list/range. */
  function resolveQubitArgs(args: ExprNode[]): number[] | null {
    const result: number[] = [];
    for (const arg of args) {
      const single = resolveQubitIndex(arg);
      if (single !== null) {
        result.push(single);
        continue;
      }
      const many = resolveQubitSet(arg);
      if (many === null) return null;
      result.push(...many);
    }
    return result;
  }

  /** Qubits touched by any gate so far — what `.measure_active()` measures. */
  const activeQubits = new Set<number>();
  function pushGate(gate: Gate) {
    gates.push(gate);
    for (const q of gate.qubits) activeQubits.add(q);
  }

  /** `Attribute` nodes already handled as the callee of a `Call` — used to spot bare `qc.h` references (no parens). */
  const handledAttributeCalls = new Set<ExprNode>();

  for (const node of walk(module)) {
    if (node.nodeType === "Attribute" && !handledAttributeCalls.has(node)) {
      const { value, attr } = node;
      if (
        value.nodeType === "Name" &&
        value.id === circuitVar &&
        CIRCUIT_METHOD_NAMES.has(attr) &&
        attr !== "measure_all" &&
        attr !== "measure_active"
      ) {
        report(
          `\`${circuitVar}.${attr}\` was referenced without calling it — did you mean \`${circuitVar}.${attr}(...)\`? ` +
            "A gate isn't applied until you call it with the qubit(s) it acts on.",
        );
      }
    }

    if (node.nodeType === "Import") {
      for (const alias of node.names) {
        const bound = alias.asname ?? alias.name.split(".")[0];
        importedNames.add(bound);
        boundNames.add(bound);
      }
      continue;
    }

    if (node.nodeType === "ImportFrom") {
      for (const alias of node.names) {
        const bound = alias.asname ?? alias.name;
        importedNames.add(bound);
        boundNames.add(bound);
      }
      continue;
    }

    if (node.nodeType === "Assign") {
      for (const target of node.targets) {
        if (target.nodeType === "Name") boundNames.add(target.id);
      }

      if (node.value.nodeType !== "Call") continue;
      const call = node.value;
      const target = node.targets[0];

      if (call.func.nodeType === "Name" && call.func.id === "QuantumRegister") {
        requireImport("QuantumRegister", "from qiskit import QuantumRegister");
        const size = call.args[0] ? numericLiteral(call.args[0]) : null;
        const nameArg = call.args[1] ?? keywordArg(call, "name");
        const regName = nameArg ? stringLiteral(nameArg) : null;
        if (target?.nodeType === "Name" && size !== null) {
          quantumRegisters.set(target.id, { size, name: regName ?? target.id });
        }
        continue;
      }

      if (call.func.nodeType === "Name" && call.func.id === "ClassicalRegister") {
        requireImport("ClassicalRegister", "from qiskit import ClassicalRegister");
        const size = call.args[0] ? numericLiteral(call.args[0]) : null;
        if (target?.nodeType === "Name" && size !== null) {
          classicalRegisters.set(target.id, { size });
        }
        continue;
      }

      if (call.func.nodeType === "Name" && call.func.id === "QuantumCircuit") {
        requireImport("QuantumCircuit", "from qiskit import QuantumCircuit");
        if (target?.nodeType === "Name") {
          circuitVar = target.id;
          const [firstArg, secondArg] = call.args;

          const literalSize = firstArg ? numericLiteral(firstArg) : null;
          const register = firstArg?.nodeType === "Name" ? quantumRegisters.get(firstArg.id) : undefined;
          numQubits = literalSize ?? register?.size ?? 0;
          qubitLabels = register
            ? Array.from({ length: register.size }, (_, i) => `${register.name}_${i}`)
            : undefined;

          const literalClbits = secondArg ? numericLiteral(secondArg) : null;
          const clbitRegister = secondArg?.nodeType === "Name" ? classicalRegisters.get(secondArg.id) : undefined;
          numClbits = literalClbits ?? clbitRegister?.size ?? 0;

          const nameKeyword = keywordArg(call, "name");
          circuitName = nameKeyword ? (stringLiteral(nameKeyword) ?? undefined) : undefined;
        }
        continue;
      }
      continue;
    }

    if (node.nodeType === "Call" && node.func.nodeType === "Attribute") {
      handledAttributeCalls.add(node.func);
      const { value, attr } = node.func;
      if (value.nodeType !== "Name") continue;
      if (attr === "draw") continue;

      if (value.id !== circuitVar) {
        if (CIRCUIT_METHOD_NAMES.has(attr) && !boundNames.has(value.id)) {
          report(`\`${value.id}\` is used but never defined. Did you mean to assign it with \`${value.id} = QuantumCircuit(...)\` first?`);
        }
        continue;
      }

      if (attr === "measure") {
        const qubits = node.args[0] ? resolveQubitSet(node.args[0]) : null;
        const clbits = node.args[1] ? resolveClbitSet(node.args[1]) : null;
        if (qubits) for (const q of qubits) reportRange("qubit", q, numQubits);
        if (clbits) for (const c of clbits) reportRange("classical bit", c, numClbits);
        if (qubits && clbits && qubits.length !== clbits.length) {
          report(
            `.measure() was given ${qubits.length} qubit(s) but ${clbits.length} classical bit(s) — ` +
              "these lists must be the same length. Real Qiskit would raise a CircuitError here.",
          );
        }
        if (qubits) for (const q of qubits) pushGate({ gate: "measure", qubits: [q] });
        continue;
      }

      if (attr === "measure_all") {
        for (let q = 0; q < numQubits; q++) pushGate({ gate: "measure", qubits: [q] });
        numClbits += numQubits;
        continue;
      }

      if (attr === "measure_active") {
        const active = Array.from(activeQubits).sort((a, b) => a - b);
        for (const q of active) pushGate({ gate: "measure", qubits: [q] });
        numClbits += active.length;
        continue;
      }

      if (attr === "barrier") {
        if (node.args.length === 0) {
          pushGate({ gate: "barrier", qubits: [] });
          continue;
        }
        const qubits = resolveQubitArgs(node.args);
        if (qubits === null) continue;
        for (const q of qubits) reportRange("qubit", q, numQubits);
        const unique = Array.from(new Set(qubits)).sort((a, b) => a - b);
        pushGate({ gate: "barrier", qubits: unique });
        continue;
      }

      if (attr === "append") {
        const gateCall = node.args[0];
        const qubitArg = node.args[1];
        if (gateCall?.nodeType !== "Call") continue;
        const className = identifierName(gateCall.func);
        if (!className) continue;
        if (gateCall.func.nodeType === "Name") {
          requireImport(className, `from qiskit.circuit.library import ${className}`);
        }

        const qubits = (qubitArg && resolveIndexList(qubitArg, resolveQubitIndex)) ?? [];
        if (qubits.length === 0) {
          reportMissingQubit(`${circuitVar}.append(${className}(), [...])`);
          continue;
        }
        const params = gateCall.args.map(numericLiteral).filter((n): n is number => n !== null);
        pushGate({
          gate: gateKeyFromClassName(className),
          qubits,
          params: params.length ? params : undefined,
        });
        continue;
      }

      if (["rx", "ry", "rz", "p", "u1"].includes(attr)) {
        const angle = node.args[0] ? numericLiteral(node.args[0]) : null;
        const qubitArgs = node.args
          .slice(1)
          .flatMap((arg) => resolveIndexList(arg, resolveQubitIndex) ?? []);
        if (qubitArgs.length === 0) {
          reportMissingQubit(`${circuitVar}.${attr}(angle, qubit)`);
          continue;
        }
        pushGate({ gate: attr, qubits: qubitArgs, params: angle === null ? undefined : [angle] });
        continue;
      }

      if (BROADCASTABLE_GATES.has(attr)) {
        if (node.args.length === 0) {
          reportMissingQubit(`${circuitVar}.${attr}(qubit)`);
          continue;
        }
        if (node.args.length === 1) {
          const broadcastQubits = resolveIndexList(node.args[0], resolveQubitIndex);
          if (broadcastQubits) {
            if (broadcastQubits.length === 0) {
              reportMissingQubit(`${circuitVar}.${attr}(qubit)`);
              continue;
            }
            for (const qubit of broadcastQubits) {
              pushGate({ gate: attr, qubits: [qubit] });
            }
            continue;
          }
        }
      }

      const qubits: number[] = [];
      const params: number[] = [];
      for (const arg of node.args) {
        const qubitIdx = resolveQubitIndex(arg);
        if (qubitIdx !== null && !params.length) {
          qubits.push(qubitIdx);
          continue;
        }
        const num = numericLiteral(arg);
        if (num !== null) params.push(num);
      }

      if (qubits.length === 0) {
        reportMissingQubit(`${circuitVar}.${attr}(...)`);
        continue;
      }

      pushGate({ gate: attr, qubits, params: params.length ? params : undefined });
    }
  }

  if (!circuitVar) {
    if (issues.length === 0) {
      issues.push({ message: "No `QuantumCircuit(...)` assignment was found." });
    }
    return { circuit: null, issues };
  }

  for (const gate of gates) {
    for (const qubit of gate.qubits) {
      reportRange("qubit", qubit, numQubits);
    }
  }

  if (issues.length > 0) {
    return { circuit: null, issues };
  }

  return { circuit: { numQubits, name: circuitName, qubitLabels, gates }, issues };
}
