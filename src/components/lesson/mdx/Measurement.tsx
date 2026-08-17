import { Button, HStack, SimpleGrid, Text, useToken } from "@chakra-ui/react";
import { useMemo, useRef, useState } from "react";
import { LuDices } from "react-icons/lu";
import type { Circuit } from "../../../content/schema";
import { copyPngToClipboard, downloadBlob } from "../../../features/export/clipboard";
import { svgElementToPngBlob } from "../../../features/export/pngExport";
import { drawProbabilityBarsPng } from "../../../features/export/probabilityBarsCanvas";
import { sampleShots } from "../../../features/quantum/sampleShots";
import { basisLabels, probabilities, simulateCircuit } from "../../../features/quantum/simulate";
import { CircuitDiagram } from "../../viz/CircuitDiagram";
import { VizLatexToggle } from "../../viz/latexLabels";
import { ProbabilityBars } from "../../viz/ProbabilityBars";
import { ShotsHistogram } from "../../viz/ShotsHistogram";
import { VizActions } from "../../viz/VizActions";
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
  const [barColor, trackColor, textColor, panelBg] = useToken("colors", ["ember.500", "bg.muted", "fg", "bg.panel"]);
  const [probBarColor] = useToken("colors", ["quantum.500"]);

  const circuitSvgRef = useRef<SVGSVGElement>(null);

  function run(nextShots: number) {
    setShots(nextShots);
    setCounts(sampleShots(finalProbabilities, nextShots));
  }

  async function handleCircuitCopy() {
    if (!circuitSvgRef.current) return;
    await copyPngToClipboard(svgElementToPngBlob(circuitSvgRef.current));
  }
  async function handleCircuitDownload() {
    if (!circuitSvgRef.current) return;
    downloadBlob(await svgElementToPngBlob(circuitSvgRef.current), "circuit.png");
  }

  function countsBlob() {
    const labels = basisLabels(circuit.numQubits);
    const pct = counts.map((c) => (shots > 0 ? c / shots : 0));
    return drawProbabilityBarsPng(labels, pct, { barColor, trackColor, textColor, bgColor: panelBg });
  }
  async function handleCountsCopy() {
    await copyPngToClipboard(countsBlob());
  }
  async function handleCountsDownload() {
    downloadBlob(await countsBlob(), "measured-counts.png");
  }

  function probabilitiesBlob() {
    return drawProbabilityBarsPng(basisLabels(circuit.numQubits), finalProbabilities, {
      barColor: probBarColor,
      trackColor,
      textColor,
      bgColor: panelBg,
    });
  }
  async function handleProbabilitiesCopy() {
    await copyPngToClipboard(probabilitiesBlob());
  }
  async function handleProbabilitiesDownload() {
    downloadBlob(await probabilitiesBlob(), "exact-probabilities.png");
  }

  return (
    <MdxCard eyebrow={title} icon={<LuDices />}>
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}

      <VizLatexToggle>
        {(latexAction) => (
          <VizSection
            title="Circuit"
            action={
              <HStack gap="1">
                {latexAction}
                <VizActions onCopy={handleCircuitCopy} onDownload={handleCircuitDownload} />
              </HStack>
            }
          >
            <CircuitDiagram ref={circuitSvgRef} circuit={circuit} showLegend={false} />
          </VizSection>
        )}
      </VizLatexToggle>

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
        <VizLatexToggle>
          {(latexAction) => (
            <VizSection
              title={`Measured counts (${shots.toLocaleString()} shots)`}
              action={
                <HStack gap="1">
                  {latexAction}
                  <VizActions onCopy={handleCountsCopy} onDownload={handleCountsDownload} />
                </HStack>
              }
            >
              <ShotsHistogram numQubits={circuit.numQubits} counts={counts} shots={shots} />
            </VizSection>
          )}
        </VizLatexToggle>
        <VizLatexToggle>
          {(latexAction) => (
            <VizSection
              title="Exact probabilities"
              action={
                <HStack gap="1">
                  {latexAction}
                  <VizActions onCopy={handleProbabilitiesCopy} onDownload={handleProbabilitiesDownload} />
                </HStack>
              }
            >
              <ProbabilityBars amplitudes={finalAmplitudes} numQubits={circuit.numQubits} />
            </VizSection>
          )}
        </VizLatexToggle>
      </SimpleGrid>

      <Text fontSize="xs" color="fg.muted">
        Each run of a real quantum circuit gives one random outcome, sampled from these exact probabilities. "Shots"
        is how many times the circuit is run — click a few shot counts above and watch the measured counts settle
        closer to the exact probabilities as shots go up.
      </Text>
    </MdxCard>
  );
}
