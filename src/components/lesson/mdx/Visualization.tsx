import { Box, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react";
import { Suspense, lazy, useMemo, useState } from "react";
import { LuAtom } from "react-icons/lu";
import type { Circuit, VisualizationView } from "../../../content/schema";
import { blochVector, simulateCircuit } from "../../../features/quantum/simulate";
import { CircuitDiagram } from "../../viz/CircuitDiagram";
import { GateTimeline } from "../../viz/GateTimeline";
import { ProbabilityBars } from "../../viz/ProbabilityBars";
import { defaultQubitLabel } from "../../viz/qubitLabel";
import { VizSection } from "../../viz/VizSection";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";

const BlochSphere = lazy(() => import("../../viz/BlochSphere").then((m) => ({ default: m.BlochSphere })));
const StateVectorChart = lazy(() =>
  import("../../viz/StateVectorChart").then((m) => ({ default: m.StateVectorChart })),
);

export interface VisualizationProps {
  title: string;
  description?: string;
  circuit: Circuit;
  views?: VisualizationView[];
}

const DEFAULT_VIEWS: VisualizationView[] = ["circuit", "statevector"];

export function Visualization({ title, description, circuit, views = DEFAULT_VIEWS }: VisualizationProps) {
  const snapshots = useMemo(() => simulateCircuit(circuit), [circuit]);
  const [stepIndex, setStepIndex] = useState(snapshots.length - 1);

  const snapshot = snapshots[stepIndex];
  const activeGateIndex = snapshot.afterGateIndex;
  const showBloch = views.includes("bloch") && circuit.numQubits <= 2;

  const stepLabels = snapshots.map((s) => (s.gate ? s.gate.gate.toUpperCase() : "Start"));

  return (
    <MdxCard eyebrow={title} icon={<LuAtom />}>
      {description && (
        <Box color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Box>
      )}

      <VStack align="stretch" gap="8">
        {views.includes("circuit") && (
          <VizSection title="Circuit">
            <CircuitDiagram circuit={circuit} activeGateIndex={activeGateIndex} />

            {circuit.gates.length > 0 && (
              <Box px="1" mt="6" pb="2">
                <Text fontSize="xs" color="fg.muted" mb="4">
                  Step through the circuit:{" "}
                  <Text as="span" fontWeight="semibold" color="colorPalette.fg">
                    {stepIndex === 0 ? "initial state" : `after gate ${stepIndex} of ${snapshots.length - 1}`}
                  </Text>
                </Text>
                <GateTimeline index={stepIndex} labels={stepLabels} onChange={setStepIndex} />
              </Box>
            )}
          </VizSection>
        )}

        {(views.includes("statevector") || views.includes("probabilities")) && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
            {views.includes("statevector") && (
              <VizSection title="State Amplitudes">
                <Suspense fallback={<Skeleton h="280px" rounded="l3" />}>
                  <StateVectorChart amplitudes={snapshot.amplitudes} numQubits={circuit.numQubits} />
                </Suspense>
              </VizSection>
            )}
            {views.includes("probabilities") && (
              <VizSection title="Measurement Probabilities">
                <ProbabilityBars amplitudes={snapshot.amplitudes} numQubits={circuit.numQubits} />
              </VizSection>
            )}
          </SimpleGrid>
        )}

        {showBloch && (
          <VizSection title="Bloch Sphere">
            <SimpleGrid columns={{ base: 1, sm: circuit.numQubits }} gap="6">
              {Array.from({ length: circuit.numQubits }, (_, q) => (
                <VStack key={q} gap="3">
                  <Text fontSize="sm" fontFamily="mono" fontWeight="semibold" color="colorPalette.fg">
                    {defaultQubitLabel(q, circuit.numQubits)}
                  </Text>
                  <Suspense fallback={<Skeleton h="320px" rounded="l3" w="full" />}>
                    <BlochSphere vector={blochVector(snapshot.amplitudes, q)} />
                  </Suspense>
                </VStack>
              ))}
            </SimpleGrid>
          </VizSection>
        )}
      </VStack>
    </MdxCard>
  );
}
