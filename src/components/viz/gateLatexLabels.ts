export function qubitLatex(index: number, numQubits: number): string {
  return numQubits === 1 ? "q" : `q_{${index}}`;
}

const GATE_LATEX: Record<string, string> = {
  sdg: "S^\\dagger",
  tdg: "T^\\dagger",
  rx: "R_x",
  ry: "R_y",
  rz: "R_z",
  u1: "U_1",
  swap: "\\text{SWAP}",
  cnot: "X",
};

export function getGateLatex(gate: string, plainLabel: string): string {
  return GATE_LATEX[gate.toLowerCase()] ?? plainLabel;
}

export function ketLatex(basisLabel: string): string {
  return `|${basisLabel}\\rangle`;
}
