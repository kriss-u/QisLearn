import type { Circuit } from "../../../content/schema";
import { gateKey } from "./gateKey";

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
