import type { Circuit, Gate } from "../../content/schema";

function gateKey(gate: Gate): string {
  return `${gate.gate.toLowerCase()}(${gate.qubits.join(",")})${gate.params ? `[${gate.params.join(",")}]` : ""}`;
}

export interface CircuitComparison {
  matches: boolean;
  details: string[];
}

export function compareCircuits(actual: Circuit, expected: Circuit): CircuitComparison {
  const details: string[] = [];

  if (actual.numQubits !== expected.numQubits) {
    details.push(`Expected ${expected.numQubits} qubit(s), found ${actual.numQubits}.`);
  }

  const actualKeys = actual.gates.map(gateKey);
  const expectedKeys = expected.gates.map(gateKey);

  if (actualKeys.join("|") !== expectedKeys.join("|")) {
    details.push(
      `Expected gate sequence [${expectedKeys.join(", ")}], found [${actualKeys.join(", ")}].`,
    );
  }

  return { matches: details.length === 0, details };
}
