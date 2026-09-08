import { Alert, Textarea, VStack } from "@chakra-ui/react";
import { useState } from "react";

/**
 * Scoped JSON fallback for the `circuit`/`expectedCircuit` field only — not a
 * visual gate builder. Keeps its own text buffer so an admin can type
 * invalid-but-in-progress JSON without losing keystrokes; `onChange` only
 * fires once it parses.
 */
export function CircuitJsonFieldEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value ?? { numQubits: 1, gates: [] }, null, 2));
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: string) {
    setText(next);
    try {
      onChange(JSON.parse(next));
      setError(null);
    } catch {
      setError("Not valid JSON yet — keep typing.");
    }
  }

  return (
    <VStack align="stretch" gap="1.5">
      <Textarea fontFamily="mono" fontSize="xs" rows={8} value={text} onChange={(e) => handleChange(e.target.value)} />
      {error && (
        <Alert.Root status="warning" size="sm">
          <Alert.Indicator />
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      )}
    </VStack>
  );
}
