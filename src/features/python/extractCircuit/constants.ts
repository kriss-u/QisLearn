/** `XGate` -> "x", `SwapGate` -> "swap", `PhaseGate`/`PGate` -> "p", etc. */
export const GATE_CLASS_OVERRIDES: Record<string, string> = {
  phasegate: "p",
  cnotgate: "cx",
  idgate: "id",
};

/** Circuit-method names understood as "this call is meant to act on a QuantumCircuit". */
export const CIRCUIT_METHOD_NAMES = new Set([
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
export const BROADCASTABLE_GATES = new Set(["x", "y", "z", "h", "s", "sdg", "t", "tdg", "id"]);
