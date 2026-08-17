export function qubitLatex(index: number, numQubits: number): string {
  return numQubits === 1 ? "q" : `q_{${index}}`;
}

/**
 * Converts an author-written wire label (e.g. "x_0", "count1", "ancilla") into KaTeX
 * source, so lesson-supplied `qubitLabels`/register names also honor the latex-mode
 * toggle instead of only the auto-generated "q_0" labels. Multi-letter names are
 * wrapped in \text{} since raw KaTeX italicizes and spaces out bare letter runs.
 */
export function customLabelLatex(label: string): string {
  const underscored = /^([A-Za-z]+)_(\d+)$/.exec(label);
  if (underscored) {
    const [, name, index] = underscored;
    return name.length === 1 ? `${name}_{${index}}` : `\\text{${name}}_{${index}}`;
  }
  const trailingDigits = /^([A-Za-z]+)(\d+)$/.exec(label);
  if (trailingDigits) {
    const [, name, index] = trailingDigits;
    return name.length === 1 ? `${name}_{${index}}` : `\\text{${name}}_{${index}}`;
  }
  return label.length === 1 ? label : `\\text{${label}}`;
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
