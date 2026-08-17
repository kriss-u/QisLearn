import type { Call } from "py-ast";
import { BROADCASTABLE_GATES, CIRCUIT_METHOD_NAMES } from "../constants";
import { gateKeyFromClassName, identifierName, numericLiteral, resolveIndexList } from "../astHelpers";
import type { ExtractionContext } from "../context";

function handleMeasure(ctx: ExtractionContext, node: Call) {
  const qubits = node.args[0] ? ctx.resolveQubitSet(node.args[0]) : null;
  const clbits = node.args[1] ? ctx.resolveClbitSet(node.args[1]) : null;
  if (qubits) for (const q of qubits) ctx.reportRange("qubit", q, ctx.numQubits);
  if (clbits) for (const c of clbits) ctx.reportRange("classical bit", c, ctx.numClbits);
  if (qubits && clbits && qubits.length !== clbits.length) {
    ctx.report(
      `.measure() was given ${qubits.length} qubit(s) but ${clbits.length} classical bit(s) — ` +
        "these lists must be the same length. Real Qiskit would raise a CircuitError here.",
    );
  }
  if (qubits && clbits) {
    for (let i = 0; i < qubits.length; i++) {
      ctx.pushGate({ gate: "measure", qubits: [qubits[i]], clbits: [clbits[i]] });
    }
  } else if (qubits) {
    for (const q of qubits) ctx.pushGate({ gate: "measure", qubits: [q] });
  }
}

/** Expands to per-qubit `measure` gates targeting a new `"meas"` classical register, matching real Qiskit. */
function handleMeasureAll(ctx: ExtractionContext) {
  const regOffset = ctx.numClbits;
  for (let q = 0; q < ctx.numQubits; q++) ctx.pushGate({ gate: "measure", qubits: [q], clbits: [regOffset + q] });
  if (ctx.numQubits > 0) {
    ctx.classicalRegistersResult = [...(ctx.classicalRegistersResult ?? []), { name: "meas", size: ctx.numQubits }];
  }
  ctx.numClbits += ctx.numQubits;
}

/** Same as `measure_all`, but only over qubits a prior gate actually touched. */
function handleMeasureActive(ctx: ExtractionContext) {
  const active = Array.from(ctx.activeQubits).sort((a, b) => a - b);
  const regOffset = ctx.numClbits;
  active.forEach((q, i) => ctx.pushGate({ gate: "measure", qubits: [q], clbits: [regOffset + i] }));
  if (active.length > 0) {
    ctx.classicalRegistersResult = [...(ctx.classicalRegistersResult ?? []), { name: "meas", size: active.length }];
  }
  ctx.numClbits += active.length;
}

function handleBarrier(ctx: ExtractionContext, node: Call) {
  if (node.args.length === 0) {
    ctx.pushGate({ gate: "barrier", qubits: [] });
    return;
  }
  const qubits = ctx.resolveQubitArgs(node.args);
  if (qubits === null) return;
  for (const q of qubits) ctx.reportRange("qubit", q, ctx.numQubits);
  const unique = Array.from(new Set(qubits)).sort((a, b) => a - b);
  ctx.pushGate({ gate: "barrier", qubits: unique });
}

function handleAppend(ctx: ExtractionContext, node: Call) {
  const gateCall = node.args[0];
  const qubitArg = node.args[1];
  if (gateCall?.nodeType !== "Call") return;
  const className = identifierName(gateCall.func);
  if (!className) return;
  if (gateCall.func.nodeType === "Name") {
    ctx.requireImport(className, `from qiskit.circuit.library import ${className}`);
  }

  const qubits = (qubitArg && resolveIndexList(qubitArg, ctx.resolveQubitIndex)) ?? [];
  if (qubits.length === 0) {
    ctx.reportMissingQubit(`${ctx.circuitVar}.append(${className}(), [...])`);
    return;
  }
  const params = gateCall.args.map(numericLiteral).filter((n): n is number => n !== null);
  ctx.pushGate({
    gate: gateKeyFromClassName(className),
    qubits,
    params: params.length ? params : undefined,
  });
}

function handleParamGate(ctx: ExtractionContext, node: Call, attr: string) {
  const angle = node.args[0] ? numericLiteral(node.args[0]) : null;
  const qubitArgs = node.args.slice(1).flatMap((arg) => resolveIndexList(arg, ctx.resolveQubitIndex) ?? []);
  if (qubitArgs.length === 0) {
    ctx.reportMissingQubit(`${ctx.circuitVar}.${attr}(angle, qubit)`);
    return;
  }
  ctx.pushGate({ gate: attr, qubits: qubitArgs, params: angle === null ? undefined : [angle] });
}

/** `qc.h([0, 1, 2])` — a single list arg to a single-qubit gate broadcasts over every qubit in it. Returns whether it handled the call. */
function handleBroadcastGate(ctx: ExtractionContext, node: Call, attr: string): boolean {
  if (node.args.length === 0) {
    ctx.reportMissingQubit(`${ctx.circuitVar}.${attr}(qubit)`);
    return true;
  }
  if (node.args.length === 1) {
    const broadcastQubits = ctx.resolveQubitSet(node.args[0]);
    if (broadcastQubits) {
      if (broadcastQubits.length === 0) {
        ctx.reportMissingQubit(`${ctx.circuitVar}.${attr}(qubit)`);
        return true;
      }
      for (const qubit of broadcastQubits) {
        ctx.pushGate({ gate: attr, qubits: [qubit] });
      }
      return true;
    }
  }
  return false;
}

function handleGenericGate(ctx: ExtractionContext, node: Call, attr: string) {
  const qubits: number[] = [];
  const params: number[] = [];
  for (const arg of node.args) {
    const qubitIdx = ctx.resolveQubitIndex(arg);
    if (qubitIdx !== null && !params.length) {
      qubits.push(qubitIdx);
      continue;
    }
    const num = numericLiteral(arg);
    if (num !== null) params.push(num);
  }

  if (qubits.length === 0) {
    ctx.reportMissingQubit(`${ctx.circuitVar}.${attr}(...)`);
    return;
  }

  ctx.pushGate({ gate: attr, qubits, params: params.length ? params : undefined });
}

/** Dispatches a `var.<attr>(...)` call on the tracked circuit variable to the right gate handler. */
export function handleAttributeCall(ctx: ExtractionContext, node: Call) {
  const funcAttr = node.func;
  if (funcAttr.nodeType !== "Attribute") return;
  ctx.handledAttributeCalls.add(funcAttr);
  const { value, attr } = funcAttr;
  if (value.nodeType !== "Name") return;
  if (attr === "draw") return;

  if (value.id !== ctx.circuitVar) {
    if (CIRCUIT_METHOD_NAMES.has(attr) && !ctx.boundNames.has(value.id)) {
      ctx.report(
        `\`${value.id}\` is used but never defined. Did you mean to assign it with \`${value.id} = QuantumCircuit(...)\` first?`,
      );
    }
    return;
  }

  if (attr === "measure") return handleMeasure(ctx, node);
  if (attr === "measure_all") return handleMeasureAll(ctx);
  if (attr === "measure_active") return handleMeasureActive(ctx);
  if (attr === "barrier") return handleBarrier(ctx, node);
  if (attr === "append") return handleAppend(ctx, node);
  if (["rx", "ry", "rz", "p", "u1", "cp", "cu1"].includes(attr)) return handleParamGate(ctx, node, attr);
  if (BROADCASTABLE_GATES.has(attr) && handleBroadcastGate(ctx, node, attr)) return;

  handleGenericGate(ctx, node, attr);
}
