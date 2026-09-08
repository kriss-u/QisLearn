export interface GateStyle {
  fill: string;
  textColor: string;
  label: string;
}

const DEFAULT_STYLE: GateStyle = { fill: "#64748b", textColor: "white", label: "?" };

/**
 * Visual identity per gate: each gets a distinct, consistent hue so gates stay
 * recognizable across circuit diagrams and legends. Deliberately avoids
 * purple/violet and green/yellow to stay clear of the app's old default
 * palette — rotation gates share a blue family, everything else spans
 * blue/rose/red/ember/teal/cyan/slate instead.
 */
const GATE_STYLES: Record<string, GateStyle> = {
  x: { fill: "#3b82f6", textColor: "white", label: "X" },
  y: { fill: "#e11d48", textColor: "white", label: "Y" },
  z: { fill: "#ef4444", textColor: "white", label: "Z" },
  h: { fill: "#f2591a", textColor: "white", label: "H" },
  s: { fill: "#14b8a6", textColor: "white", label: "S" },
  sdg: { fill: "#0d9488", textColor: "white", label: "S†" },
  t: { fill: "#22d3ee", textColor: "#08272e", label: "T" },
  tdg: { fill: "#0891b2", textColor: "white", label: "T†" },
  id: { fill: "#94a3b8", textColor: "white", label: "I" },
  rx: { fill: "#2563eb", textColor: "white", label: "Rx" },
  ry: { fill: "#1d4ed8", textColor: "white", label: "Ry" },
  rz: { fill: "#1e40af", textColor: "white", label: "Rz" },
  p: { fill: "#1e40af", textColor: "white", label: "P" },
  u1: { fill: "#1e40af", textColor: "white", label: "U1" },
  measure: { fill: "#475569", textColor: "white", label: "M" },
};

export function getGateStyle(gate: string): GateStyle {
  const style = GATE_STYLES[gate.toLowerCase()];
  return style ?? { ...DEFAULT_STYLE, label: gate.toUpperCase() };
}

export const CONTROL_GATE_STYLES: Record<string, GateStyle> = {
  cx: GATE_STYLES.x,
  cnot: GATE_STYLES.x,
  cz: GATE_STYLES.z,
  cp: { fill: "#1e40af", textColor: "white", label: "P" },
  cu1: { fill: "#1e40af", textColor: "white", label: "P" },
  swap: { fill: "#64748b", textColor: "white", label: "SWAP" },
};

export function getControlGateStyle(gate: string): GateStyle {
  return CONTROL_GATE_STYLES[gate.toLowerCase()] ?? DEFAULT_STYLE;
}
