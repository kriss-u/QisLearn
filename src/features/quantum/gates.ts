import { c, type Complex } from "./complex";

export type Matrix2 = [[Complex, Complex], [Complex, Complex]];

const SQRT1_2 = Math.SQRT1_2;

export const PAULI_X: Matrix2 = [
  [c(0), c(1)],
  [c(1), c(0)],
];

export const PAULI_Y: Matrix2 = [
  [c(0), c(0, -1)],
  [c(0, 1), c(0)],
];

export const PAULI_Z: Matrix2 = [
  [c(1), c(0)],
  [c(0), c(-1)],
];

export const HADAMARD: Matrix2 = [
  [c(SQRT1_2), c(SQRT1_2)],
  [c(SQRT1_2), c(-SQRT1_2)],
];

export const S_GATE: Matrix2 = [
  [c(1), c(0)],
  [c(0), c(0, 1)],
];

export const T_GATE: Matrix2 = [
  [c(1), c(0)],
  [c(0), c(SQRT1_2, SQRT1_2)],
];

export const IDENTITY: Matrix2 = [
  [c(1), c(0)],
  [c(0), c(1)],
];

export function rx(theta: number): Matrix2 {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  return [
    [c(cos), c(0, -sin)],
    [c(0, -sin), c(cos)],
  ];
}

export function ry(theta: number): Matrix2 {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  return [
    [c(cos), c(-sin)],
    [c(sin), c(cos)],
  ];
}

export function rz(theta: number): Matrix2 {
  const half = theta / 2;
  return [
    [c(Math.cos(-half), Math.sin(-half)), c(0)],
    [c(0), c(Math.cos(half), Math.sin(half))],
  ];
}

/** Phase gate: diag(1, e^{iθ}). Unlike `rz`, leaves |0⟩'s amplitude untouched — the phase lands entirely on |1⟩. */
export function p(theta: number): Matrix2 {
  return [
    [c(1), c(0)],
    [c(0), c(Math.cos(theta), Math.sin(theta))],
  ];
}

export const SINGLE_QUBIT_GATES: Record<string, (params?: number[]) => Matrix2> = {
  x: () => PAULI_X,
  y: () => PAULI_Y,
  z: () => PAULI_Z,
  h: () => HADAMARD,
  s: () => S_GATE,
  t: () => T_GATE,
  id: () => IDENTITY,
  rx: (params) => rx(params?.[0] ?? 0),
  ry: (params) => ry(params?.[0] ?? 0),
  rz: (params) => rz(params?.[0] ?? 0),
  p: (params) => p(params?.[0] ?? 0),
  u1: (params) => p(params?.[0] ?? 0),
};

export const TWO_QUBIT_GATES = new Set(["cx", "cnot", "cz", "swap", "cp", "cu1"]);
