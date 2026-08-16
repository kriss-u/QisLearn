import { Button, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { LuDices } from "react-icons/lu";
import type { Circuit } from "../../../content/schema";
import { sampleShots } from "../../../features/quantum/sampleShots";
import { probabilities, simulateCircuit } from "../../../features/quantum/simulate";
import { CircuitDiagram } from "../../viz/CircuitDiagram";
import { ProbabilityBars } from "../../viz/ProbabilityBars";
import { ShotsHistogram } from "../../viz/ShotsHistogram";
import { VizSection } from "../../viz/VizSection";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";

export interface MeasurementProps {
  title: string;
  description?: string;
  circuit: Circuit;
  shotsOptions?: number[];
}

const DEFAULT_SHOTS_OPTIONS = [10, 100, 1000, 10000];

export function Measurement({ title, description, circuit, shotsOptions = DEFAULT_SHOTS_OPTIONS }: MeasurementProps) {
  const finalAmplitudes = useMemo(() => {
    const snapshots = simulateCircuit(circuit);
    return snapshots[snapshots.length - 1].amplitudes;
  }, [circuit]);
  const finalProbabilities = useMemo(() => probabilities(finalAmplitudes), [finalAmplitudes]);

  const [shots, setShots] = useState(shotsOptions[Math.floor(shotsOptions.length / 2)]);
  const [counts, setCounts] = useState(() => sampleShots(finalProbabilities, shots));

  function run(nextShots: number) {
    setShots(nextShots);
    setCounts(sampleShots(finalProbabilities, nextShots));
  }

  return (
    <MdxCard eyebrow={title} icon={<LuDices />}>
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}

      <VizSection title="Circuit">
        <CircuitDiagram circuit={circuit} showLegend={false} />
      </VizSection>

      <HStack gap="3" wrap="wrap" align="center">
        <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
          Shots
        </Text>
        {shotsOptions.map((option) => (
          <Button
            key={option}
            size="sm"
            variant={option === shots ? "solid" : "outline"}
            colorPalette="ember"
            onClick={() => run(option)}
          >
            {option.toLocaleString()}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => run(shots)}>
          Run again
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <VizSection title={`Measured counts (${shots.toLocaleString()} shots)`}>
          <ShotsHistogram numQubits={circuit.numQubits} counts={counts} shots={shots} />
        </VizSection>
        <VizSection title="Exact probabilities">
          <ProbabilityBars amplitudes={finalAmplitudes} numQubits={circuit.numQubits} />
        </VizSection>
      </SimpleGrid>

      <Text fontSize="xs" color="fg.muted">
        Each run of a real quantum circuit gives one random outcome, sampled from these exact probabilities. "Shots"
        is how many times the circuit is run — click a few shot counts above and watch the measured counts settle
        closer to the exact probabilities as shots go up.
      </Text>
    </MdxCard>
  );
}
