import type { Gate } from "../../../content/schema";

/** Serializes a `Gate` to a string that's equal iff two gates are equivalent for comparison purposes. */
export function gateKey(gate: Gate): string {
  const clbits = gate.clbits ? `->${gate.clbits.join(",")}` : "";
  return `${gate.gate.toLowerCase()}(${gate.qubits.join(",")})${clbits}${gate.params ? `[${gate.params.join(",")}]` : ""}`;
}
