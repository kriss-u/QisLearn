import { Accordion, Alert, Box, Button, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import { Suspense, lazy, useEffect, useState } from "react";
import { LuCode } from "react-icons/lu";
import type { Circuit } from "../../../content/schema";
import { getCodeSnapshot, saveCodeSnapshot } from "../../../db/repository";
import { compareCircuits } from "../../../features/python/compareCircuit";
import { extractCircuit } from "../../../features/python/extractCircuit";
import { CircuitDiagram } from "../../viz/CircuitDiagram";
import { useLessonId } from "../LessonContext";
import { useLessonProgress } from "../LessonProgressContext";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";

const PyEditor = lazy(() => import("../../editor/PyEditor").then((m) => ({ default: m.PyEditor })));

export interface CodeExerciseProps {
  id: string;
  prompt: string;
  starterCode: string;
  solutionCode?: string;
  expectedCircuit?: Circuit;
  hints?: string[];
}

interface CheckResult {
  ok: boolean;
  messages: string[];
}

export function CodeExercise({ id: exerciseId, prompt, starterCode, expectedCircuit, hints = [] }: CodeExerciseProps) {
  const lessonId = useLessonId();
  const { registerExercise, reportResult } = useLessonProgress();
  const [code, setCode] = useState(starterCode);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => registerExercise(exerciseId), [exerciseId, registerExercise]);

  useEffect(() => {
    reportResult(exerciseId, result?.ok ?? false);
  }, [exerciseId, result?.ok, reportResult]);

  useEffect(() => {
    let cancelled = false;
    getCodeSnapshot(lessonId, exerciseId).then((snapshot) => {
      if (!cancelled && snapshot) setCode(snapshot.code);
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId, exerciseId]);

  useEffect(() => {
    if (!loaded) return;
    const timeout = setTimeout(() => {
      saveCodeSnapshot(lessonId, exerciseId, code);
    }, 500);
    return () => clearTimeout(timeout);
  }, [code, lessonId, exerciseId, loaded]);

  const extracted = extractCircuit(code);

  function handleCodeChange(value: string) {
    setCode(value);
    if (result && !result.ok) setResult(null);
  }

  function handleCheck() {
    if (extracted.issues.length > 0) {
      setResult({ ok: false, messages: extracted.issues.map((i) => i.message) });
      return;
    }
    if (!expectedCircuit) {
      setResult({ ok: true, messages: ["Circuit parsed successfully."] });
      return;
    }
    if (!extracted.circuit) {
      setResult({ ok: false, messages: ["Could not detect a circuit in your code."] });
      return;
    }
    const comparison = compareCircuits(extracted.circuit, expectedCircuit);
    setResult({
      ok: comparison.matches,
      messages: comparison.matches ? ["Correct! Your circuit matches the expected result."] : comparison.details,
    });
  }

  return (
    <MdxCard eyebrow="Exercise" icon={<LuCode />}>
      <Box color="fg.muted" fontSize="md">
        <Markdown inline>{prompt}</Markdown>
      </Box>

      <Suspense fallback={<Skeleton h="220px" rounded="l3" />}>
        <PyEditor value={code} onChange={handleCodeChange} readOnly={result?.ok === true} />
      </Suspense>

      <HStack gap="3">
        <Button colorPalette="quantum" onClick={handleCheck} disabled={result?.ok === true}>
          Check my circuit
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setCode(starterCode);
            setResult(null);
          }}
        >
          Reset
        </Button>
      </HStack>

      {result && (
        <Alert.Root status={result.ok ? "success" : "error"} rounded="l2">
          <Alert.Indicator />
          <Alert.Content>
            {result.messages.map((message, i) => (
              <Alert.Description key={i}>{message}</Alert.Description>
            ))}
          </Alert.Content>
        </Alert.Root>
      )}

      {extracted.circuit && extracted.circuit.gates.length > 0 && (
        <Box>
          <Text fontSize="xs" color="fg.muted" mb="2">
            Live preview of the circuit detected in your code
          </Text>
          <CircuitDiagram circuit={extracted.circuit} />
        </Box>
      )}

      {hints.length > 0 && (
        <Accordion.Root collapsible variant="enclosed">
          <Accordion.Item value="hints">
            <Accordion.ItemTrigger>
              <Text fontSize="sm" fontWeight="medium">
                Need a hint?
              </Text>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>
                <VStack align="stretch" gap="2">
                  {hints.map((hint, i) => (
                    <Box key={i} fontSize="sm" color="fg.muted">
                      <Markdown inline>{`${i + 1}. ${hint}`}</Markdown>
                    </Box>
                  ))}
                </VStack>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      )}
    </MdxCard>
  );
}
