import type { Circuit, Gate } from "../../content/schema";
import { cAbs2, cAdd, cMul, type Complex } from "./complex";
import { SINGLE_QUBIT_GATES, type Matrix2 } from "./gates";

export type StateVector = Complex[];

export interface StateSnapshot {
  afterGateIndex: number;
  gate: Gate | null;
  amplitudes: StateVector;
}

function zeroState(numQubits: number): StateVector {
  const size = 2 ** numQubits;
  const state: StateVector = Array.from({ length: size }, () => ({ re: 0, im: 0 }));
  state[0] = { re: 1, im: 0 };
  return state;
}

function applySingleQubitGate(state: StateVector, matrix: Matrix2, qubit: number): StateVector {
  const size = state.length;
  const next: StateVector = Array.from({ length: size }, () => ({ re: 0, im: 0 }));
  const mask = 1 << qubit;

  for (let i = 0; i < size; i++) {
    if ((i & mask) !== 0) continue;
    const j = i | mask;
    const a0 = state[i];
    const a1 = state[j];
    next[i] = cAdd(cMul(matrix[0][0], a0), cMul(matrix[0][1], a1));
    next[j] = cAdd(cMul(matrix[1][0], a0), cMul(matrix[1][1], a1));
  }
  return next;
}

function applyControlledX(state: StateVector, control: number, target: number): StateVector {
  const size = state.length;
  const next: StateVector = [...state];
  const controlMask = 1 << control;
  const targetMask = 1 << target;

  for (let i = 0; i < size; i++) {
    if ((i & controlMask) === 0) continue;
    const j = i ^ targetMask;
    if (j > i) {
      next[i] = state[j];
      next[j] = state[i];
    }
  }
  return next;
}

function applyControlledZ(state: StateVector, control: number, target: number): StateVector {
  const size = state.length;
  const next: StateVector = [...state];
  const controlMask = 1 << control;
  const targetMask = 1 << target;

  for (let i = 0; i < size; i++) {
    if ((i & controlMask) !== 0 && (i & targetMask) !== 0) {
      next[i] = { re: -state[i].re, im: -state[i].im };
    }
  }
  return next;
}

function applySwap(state: StateVector, a: number, b: number): StateVector {
  const size = state.length;
  const next: StateVector = [...state];
  const maskA = 1 << a;
  const maskB = 1 << b;

  for (let i = 0; i < size; i++) {
    const bitAValue = (i & maskA) !== 0;
    const bitBValue = (i & maskB) !== 0;
    if (bitAValue === bitBValue) continue;
    const j = i ^ maskA ^ maskB;
    if (j > i) {
      next[i] = state[j];
      next[j] = state[i];
    }
  }
  return next;
}

export function applyGate(state: StateVector, gate: Gate): StateVector {
  const name = gate.gate.toLowerCase();

  if (name === "barrier") {
    return state;
  }
  if (name === "cx" || name === "cnot") {
    return applyControlledX(state, gate.qubits[0], gate.qubits[1]);
  }
  if (name === "cz") {
    return applyControlledZ(state, gate.qubits[0], gate.qubits[1]);
  }
  if (name === "swap") {
    return applySwap(state, gate.qubits[0], gate.qubits[1]);
  }

  const factory = SINGLE_QUBIT_GATES[name];
  if (!factory) {
    throw new Error(`Unsupported gate: ${gate.gate}`);
  }
  return applySingleQubitGate(state, factory(gate.params), gate.qubits[0]);
}

export function simulateCircuit(circuit: Circuit): StateSnapshot[] {
  let state = zeroState(circuit.numQubits);
  const snapshots: StateSnapshot[] = [{ afterGateIndex: -1, gate: null, amplitudes: state }];

  circuit.gates.forEach((gate, index) => {
    state = applyGate(state, gate);
    snapshots.push({ afterGateIndex: index, gate, amplitudes: state });
  });

  return snapshots;
}

export function probabilities(state: StateVector): number[] {
  return state.map(cAbs2);
}

/**
 * Basis state kets in Qiskit's little-endian convention: |q_{n-1}...q_1 q_0>.
 * Since amplitude index `i` already has q0 at bit 0 (LSB), the plain binary
 * string of `i` reads MSB-first left to right, which is exactly this order.
 */
export function basisLabels(numQubits: number): string[] {
  const size = 2 ** numQubits;
  return Array.from({ length: size }, (_, i) => i.toString(2).padStart(numQubits, "0"));
}

/**
 * Bloch vector for a single qubit obtained from the reduced density matrix,
 * traced out over all other qubits. Follows Qiskit's little-endian indexing,
 * where qubit `q` occupies bit position `q` (q0 is the least-significant bit).
 */
export function blochVector(state: StateVector, qubit: number): [number, number, number] {
  const mask = 1 << qubit;
  let rho00 = 0;
  let rho11 = 0;
  let rho01Re = 0;
  let rho01Im = 0;

  for (let i = 0; i < state.length; i++) {
    if ((i & mask) !== 0) continue;
    const j = i | mask;
    const a0 = state[i];
    const a1 = state[j];
    rho00 += cAbs2(a0);
    rho11 += cAbs2(a1);
    rho01Re += a0.re * a1.re + a0.im * a1.im;
    rho01Im += a0.im * a1.re - a0.re * a1.im;
  }

  const x = 2 * rho01Re;
  const y = -2 * rho01Im;
  const z = rho00 - rho11;
  return [x, y, z];
}
