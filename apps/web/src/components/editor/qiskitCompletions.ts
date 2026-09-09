import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";

const IMPORT_SNIPPETS: Completion[] = [
  { label: "from qiskit import QuantumCircuit", type: "text" },
  {
    label: "from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister",
    type: "text",
  },
  { label: "from qiskit import transpile", type: "text" },
  { label: "from qiskit.primitives import StatevectorSampler", type: "text" },
  { label: "from qiskit.quantum_info import Statevector", type: "text" },
  { label: "from qiskit.visualization import plot_histogram", type: "text" },
  { label: "from qiskit_aer import AerSimulator", type: "text" },
];

const NAMES: Completion[] = [
  { label: "QuantumCircuit", type: "class" },
  { label: "QuantumRegister", type: "class" },
  { label: "ClassicalRegister", type: "class" },
  { label: "AerSimulator", type: "class" },
  { label: "StatevectorSampler", type: "class" },
  { label: "Statevector", type: "class" },
  { label: "transpile", type: "function" },
  { label: "plot_histogram", type: "function" },
  { label: "plot_bloch_multivector", type: "function" },
  // single-qubit gates
  { label: "h", type: "method", info: "Hadamard gate" },
  { label: "x", type: "method", info: "Pauli-X (NOT) gate" },
  { label: "y", type: "method", info: "Pauli-Y gate" },
  { label: "z", type: "method", info: "Pauli-Z gate" },
  { label: "s", type: "method", info: "S (phase) gate" },
  { label: "t", type: "method", info: "T gate" },
  { label: "rx", type: "method", info: "Rotation around X axis" },
  { label: "ry", type: "method", info: "Rotation around Y axis" },
  { label: "rz", type: "method", info: "Rotation around Z axis" },
  { label: "p", type: "method", info: "Phase gate" },
  { label: "u", type: "method", info: "Generic single-qubit unitary" },
  // multi-qubit gates
  { label: "cx", type: "method", info: "Controlled-X (CNOT) gate" },
  { label: "cy", type: "method", info: "Controlled-Y gate" },
  { label: "cz", type: "method", info: "Controlled-Z gate" },
  { label: "ccx", type: "method", info: "Toffoli (CCX) gate" },
  { label: "swap", type: "method", info: "SWAP gate" },
  { label: "crx", type: "method", info: "Controlled rotation around X axis" },
  { label: "cry", type: "method", info: "Controlled rotation around Y axis" },
  { label: "crz", type: "method", info: "Controlled rotation around Z axis" },
  // circuit ops
  { label: "measure", type: "method" },
  { label: "measure_all", type: "method" },
  { label: "barrier", type: "method" },
  { label: "draw", type: "method" },
  { label: "run", type: "method" },
  { label: "result", type: "method" },
];

const ALL_COMPLETIONS: Completion[] = [...IMPORT_SNIPPETS, ...NAMES];

export function qiskitCompletionSource(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[\w.]*/);
  if (!word) return null;
  if (word.from === word.to && !context.explicit) return null;

  return {
    from: word.from,
    options: ALL_COMPLETIONS,
    validFor: /^[\w.]*$/,
  };
}
