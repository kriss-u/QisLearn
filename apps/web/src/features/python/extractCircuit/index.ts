import { parseModule, walk } from "py-ast";
import { ExtractionContext } from "./context";
import { handleAssign } from "./handlers/assign";
import { handleAttributeCall } from "./handlers/gateCall";
import {
  checkBareAttributeReference,
  handleFor,
  handleFunctionDef,
  handleImport,
  handleImportFrom,
} from "./handlers/scope";
import type { ExtractResult } from "./types";

export type { ExtractIssue, ExtractResult } from "./types";

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
 *
 * The walk itself (in this function) only dispatches by node type; the actual
 * per-construct logic lives in `./handlers` and the shared mutable state
 * (registers, gates, issues, ...) lives in `./context`.
 */
export function extractCircuit(source: string): ExtractResult {
  let module;
  try {
    module = parseModule(source);
  } catch (error) {
    return {
      circuit: null,
      issues: [{ message: error instanceof Error ? error.message : "Failed to parse Python source." }],
    };
  }

  const ctx = new ExtractionContext();

  for (const node of walk(module)) {
    checkBareAttributeReference(ctx, node);

    if (node.nodeType === "Import") {
      handleImport(ctx, node);
      continue;
    }

    if (node.nodeType === "ImportFrom") {
      handleImportFrom(ctx, node);
      continue;
    }

    if (node.nodeType === "Assign") {
      handleAssign(ctx, node);
      continue;
    }

    if (node.nodeType === "For" || node.nodeType === "AsyncFor") {
      handleFor(ctx, node);
      continue;
    }

    if (node.nodeType === "FunctionDef" || node.nodeType === "AsyncFunctionDef") {
      handleFunctionDef(ctx, node);
      continue;
    }

    if (node.nodeType === "Call" && node.func.nodeType === "Attribute") {
      handleAttributeCall(ctx, node);
    }
  }

  if (!ctx.circuitVar) {
    if (ctx.issues.length === 0) {
      ctx.issues.push({ message: "No `QuantumCircuit(...)` assignment was found." });
    }
    return { circuit: null, issues: ctx.issues };
  }

  for (const gate of ctx.gates) {
    for (const qubit of gate.qubits) {
      ctx.reportRange("qubit", qubit, ctx.numQubits);
    }
  }

  if (ctx.issues.length > 0) {
    return { circuit: null, issues: ctx.issues };
  }

  return {
    circuit: {
      numQubits: ctx.numQubits,
      name: ctx.circuitName,
      qubitLabels: ctx.qubitLabels,
      classicalRegisters: ctx.classicalRegistersResult,
      gates: ctx.gates,
    },
    issues: ctx.issues,
  };
}
