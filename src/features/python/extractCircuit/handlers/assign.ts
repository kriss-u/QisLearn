import type { Assign } from "py-ast";
import { keywordArg, numericLiteral, stringLiteral } from "../astHelpers";
import type { ExtractionContext } from "../context";

/** `var = QuantumRegister(...)` / `ClassicalRegister(...)` / `QuantumCircuit(...)` — the three assignment forms tracked. */
export function handleAssign(ctx: ExtractionContext, node: Assign) {
  for (const target of node.targets) {
    if (target.nodeType === "Name") ctx.boundNames.add(target.id);
  }

  if (node.value.nodeType !== "Call") return;
  const call = node.value;
  const target = node.targets[0];

  if (call.func.nodeType === "Name" && call.func.id === "QuantumRegister") {
    ctx.requireImport("QuantumRegister", "from qiskit import QuantumRegister");
    const size = call.args[0] ? numericLiteral(call.args[0]) : null;
    const nameArg = call.args[1] ?? keywordArg(call, "name");
    const regName = nameArg ? stringLiteral(nameArg) : null;
    if (target?.nodeType === "Name" && size !== null) {
      ctx.quantumRegisters.set(target.id, { size, name: regName ?? target.id });
    }
    return;
  }

  if (call.func.nodeType === "Name" && call.func.id === "ClassicalRegister") {
    ctx.requireImport("ClassicalRegister", "from qiskit import ClassicalRegister");
    const size = call.args[0] ? numericLiteral(call.args[0]) : null;
    const nameArg = call.args[1] ?? keywordArg(call, "name");
    const regName = nameArg ? stringLiteral(nameArg) : null;
    if (target?.nodeType === "Name" && size !== null) {
      ctx.classicalRegisters.set(target.id, { size, name: regName ?? target.id });
    }
    return;
  }

  if (call.func.nodeType === "Name" && call.func.id === "QuantumCircuit") {
    ctx.requireImport("QuantumCircuit", "from qiskit import QuantumCircuit");
    if (target?.nodeType === "Name") {
      ctx.circuitVar = target.id;

      ctx.numQubits = 0;
      ctx.numClbits = 0;
      const qLabelsAcc: string[] = [];
      const cRegsAcc: { name: string; size: number }[] = [];
      let sawQuantumArg = false;
      let sawClassicalArg = false;

      for (const arg of call.args) {
        if (arg.nodeType === "Name" && ctx.quantumRegisters.has(arg.id)) {
          const reg = ctx.quantumRegisters.get(arg.id)!;
          ctx.numQubits += reg.size;
          for (let i = 0; i < reg.size; i++) qLabelsAcc.push(`${reg.name}_${i}`);
          sawQuantumArg = true;
          continue;
        }
        if (arg.nodeType === "Name" && ctx.classicalRegisters.has(arg.id)) {
          const reg = ctx.classicalRegisters.get(arg.id)!;
          ctx.numClbits += reg.size;
          cRegsAcc.push({ name: reg.name, size: reg.size });
          sawClassicalArg = true;
          continue;
        }
        const lit = numericLiteral(arg);
        if (lit === null) continue;
        if (!sawQuantumArg) {
          ctx.numQubits = lit;
          sawQuantumArg = true;
        } else if (!sawClassicalArg) {
          ctx.numClbits = lit;
          cRegsAcc.push({ name: "c", size: lit });
          sawClassicalArg = true;
        }
      }

      ctx.qubitLabels = qLabelsAcc.length ? qLabelsAcc : undefined;
      ctx.classicalRegistersResult = cRegsAcc.length ? cRegsAcc : undefined;

      const nameKeyword = keywordArg(call, "name");
      ctx.circuitName = nameKeyword ? (stringLiteral(nameKeyword) ?? undefined) : undefined;
    }
    return;
  }
}
