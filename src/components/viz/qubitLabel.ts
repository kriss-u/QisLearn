export function defaultQubitLabel(index: number, numQubits: number): string {
  return numQubits === 1 ? "q" : `q_${index}`;
}
