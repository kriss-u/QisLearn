import { Alert, Box, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { extractCircuit } from "../../../../features/python/extractCircuit";
import { CircuitDiagram } from "../../../../components/viz/CircuitDiagram";
import type { Circuit, Gate } from "../../../../content/schema";
import { PyCodeFieldEditor } from "./PyCodeFieldEditor";

const STARTER_CODE = `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)
`;

function gateToLine(gate: Gate): string {
  if (gate.gate === "measure") {
    return `qc.measure(${gate.qubits[0] ?? 0}, ${gate.clbits?.[0] ?? 0})`;
  }
  if (gate.gate === "barrier") {
    return gate.qubits.length > 0 ? `qc.barrier(${gate.qubits.join(", ")})` : "qc.barrier()";
  }
  const args = [...(gate.params ?? []).map(String), ...gate.qubits.map(String)];
  return `qc.${gate.gate}(${args.join(", ")})`;
}

/**
 * Renders a `Circuit` back as the Qiskit-style Python that would produce it,
 * so editing an existing block starts from valid, re-parseable source
 * instead of a blank slate. Best-effort: named registers/qubit labels don't
 * round-trip (the plain `QuantumCircuit(n, m)` form is used instead), which
 * is fine since the admin is editing the gate list, not preserving register
 * naming.
 */
function circuitToPython(circuit: Circuit): string {
  const totalClbits = (circuit.classicalRegisters ?? []).reduce((sum, r) => sum + r.size, 0);
  const ctorArgs = [String(circuit.numQubits), ...(totalClbits > 0 ? [String(totalClbits)] : [])];
  const nameArg = circuit.name ? `, name="${circuit.name}"` : "";
  return [
    "from qiskit import QuantumCircuit",
    "",
    `qc = QuantumCircuit(${ctorArgs.join(", ")}${nameArg})`,
    ...circuit.gates.map(gateToLine),
  ].join("\n");
}

/**
 * Editing a circuit as raw JSON meant hand-writing gate objects by index —
 * error-prone and nothing like how circuits are written anywhere else in
 * this project. This instead reuses the same static Qiskit-style Python
 * parser (`extractCircuit`) that grades learner code, so admins write
 * `qc.h(0)` / `qc.cx(0, 1)` the same way lesson content already teaches,
 * see the parsed result as a live gate diagram, and the stored `data` is
 * guaranteed to be shaped exactly the way the grader itself would produce
 * it from equivalent learner code.
 */
export function CircuitFieldEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (next: Circuit) => void;
}) {
  const [code, setCode] = useState(() => {
    const existing = value as Circuit | undefined;
    return existing && existing.gates ? circuitToPython(existing) : STARTER_CODE;
  });

  const extracted = extractCircuit(code);

  function handleChange(next: string) {
    setCode(next);
    const result = extractCircuit(next);
    if (result.circuit) onChange(result.circuit);
  }

  return (
    <VStack align="stretch" gap="2" w="full">
      <PyCodeFieldEditor value={code} onChange={handleChange} minHeight="180px" />
      {extracted.issues.length > 0 && (
        <Alert.Root status="warning" size="sm">
          <Alert.Indicator />
          <Alert.Content>
            {extracted.issues.map((issue, i) => (
              <Alert.Description key={i}>{issue.message}</Alert.Description>
            ))}
          </Alert.Content>
        </Alert.Root>
      )}
      {extracted.circuit && extracted.circuit.numQubits > 0 && (
        <Box w="full" borderWidth="1px" borderColor="border" rounded="l2" p="3" bg="bg.panel" overflowX="auto">
          <Text fontSize="xs" color="fg.muted" mb="2">
            Live preview of the circuit detected above
          </Text>
          <CircuitDiagram circuit={extracted.circuit} />
        </Box>
      )}
    </VStack>
  );
}
