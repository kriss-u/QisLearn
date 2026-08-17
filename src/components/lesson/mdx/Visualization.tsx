import { Box, HStack, SimpleGrid, Skeleton, Text, useToken, VStack } from "@chakra-ui/react";
import { Suspense, lazy, useMemo, useRef, useState } from "react";
import { LuAtom } from "react-icons/lu";
import type { Circuit, VisualizationView } from "../../../content/schema";
import { copyPngToClipboard, copyTextToClipboard, downloadBlob } from "../../../features/export/clipboard";
import { canvasToPngBlob, plotlyToPngBlob, svgElementToPngBlob } from "../../../features/export/pngExport";
import { drawProbabilityBarsPng } from "../../../features/export/probabilityBarsCanvas";
import { resolveCssVar } from "../../../features/export/resolveCssVar";
import { drawStateTablePng } from "../../../features/export/stateTableCanvas";
import { stateTableToCsv } from "../../../features/export/stateTableExport";
import { basisLabels, blochVector, probabilities, simulateCircuit } from "../../../features/quantum/simulate";
import { CircuitDiagram } from "../../viz/CircuitDiagram";
import { qubitLatex } from "../../viz/gateLatexLabels";
import { GateTimeline } from "../../viz/GateTimeline";
import { KatexSpan, useVizLatex, VizLatexToggle } from "../../viz/latexLabels";
import { ProbabilityBars } from "../../viz/ProbabilityBars";
import { defaultQubitLabel } from "../../viz/qubitLabel";
import { StateTable } from "../../viz/StateTable";
import { VizActions, VizFormatActions } from "../../viz/VizActions";
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

function BlochQubitLabel({ index, numQubits, label }: { index: number; numQubits: number; label?: string }) {
  const latex = useVizLatex();
  return (
    <Text fontSize="sm" fontFamily="mono" fontWeight="semibold" color="colorPalette.fg">
      {label ?? (latex ? <KatexSpan tex={qubitLatex(index, numQubits)} /> : defaultQubitLabel(index, numQubits))}
    </Text>
  );
}

export function Visualization({ title, description, circuit, views = DEFAULT_VIEWS }: VisualizationProps) {
  const snapshots = useMemo(() => simulateCircuit(circuit), [circuit]);
  const [stepIndex, setStepIndex] = useState(snapshots.length - 1);
  const [barColor, trackColor, probTextColor, mutedColor, panelBg, borderColor] = useToken("colors", [
    "quantum.500",
    "bg.muted",
    "fg",
    "fg.muted",
    "bg.panel",
    "border",
  ]).map(resolveCssVar);

  const circuitSvgRef = useRef<SVGSVGElement>(null);
  const statevectorGraphDivRef = useRef<HTMLElement | null>(null);
  const blochCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const snapshot = snapshots[stepIndex];
  const activeGateIndex = snapshot.afterGateIndex;
  const showBloch = views.includes("bloch") && circuit.numQubits <= 2;

  const stepLabels = snapshots.map((s) => ({ gateName: s.gate?.gate ?? null }));

  async function handleCircuitCopy() {
    if (!circuitSvgRef.current) return;
    await copyPngToClipboard(svgElementToPngBlob(circuitSvgRef.current));
  }
  async function handleCircuitDownload() {
    if (!circuitSvgRef.current) return;
    downloadBlob(await svgElementToPngBlob(circuitSvgRef.current), "circuit.png");
  }

  async function handleStatevectorCopy() {
    if (!statevectorGraphDivRef.current) return;
    await copyPngToClipboard(plotlyToPngBlob(statevectorGraphDivRef.current));
  }
  async function handleStatevectorDownload() {
    if (!statevectorGraphDivRef.current) return;
    downloadBlob(await plotlyToPngBlob(statevectorGraphDivRef.current), "state-amplitudes.png");
  }

  function probabilityBarsBlob() {
    return drawProbabilityBarsPng(basisLabels(circuit.numQubits), probabilities(snapshot.amplitudes), {
      barColor,
      trackColor,
      textColor: probTextColor,
      bgColor: panelBg,
    });
  }
  async function handleProbabilitiesCopy() {
    await copyPngToClipboard(probabilityBarsBlob());
  }
  async function handleProbabilitiesDownload() {
    downloadBlob(await probabilityBarsBlob(), "measurement-probabilities.png");
  }

  function stateTableBlob() {
    return drawStateTablePng(snapshot.amplitudes, circuit.numQubits, {
      barColor,
      trackColor,
      textColor: probTextColor,
      mutedColor,
      bgColor: panelBg,
      borderColor,
    });
  }
  async function handleTableCopyImage() {
    await copyPngToClipboard(stateTableBlob());
  }
  async function handleTableDownloadImage() {
    downloadBlob(await stateTableBlob(), "exact-state.png");
  }
  async function handleTableCopyCsv() {
    await copyTextToClipboard(stateTableToCsv(snapshot.amplitudes, circuit.numQubits));
  }
  async function handleTableDownloadCsv() {
    const csv = stateTableToCsv(snapshot.amplitudes, circuit.numQubits);
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "exact-state.csv");
  }

  async function handleBlochCopy(q: number) {
    const canvas = blochCanvasRefs.current[q];
    if (!canvas) return;
    await copyPngToClipboard(canvasToPngBlob(canvas));
  }
  async function handleBlochDownload(q: number) {
    const canvas = blochCanvasRefs.current[q];
    if (!canvas) return;
    downloadBlob(await canvasToPngBlob(canvas), `bloch-q${q}.png`);
  }

  return (
    <MdxCard eyebrow={title} icon={<LuAtom />} className="no-print">
      {description && (
        <Box color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Box>
      )}

      <VStack align="stretch" gap="8">
        {views.includes("circuit") && (
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
                <CircuitDiagram ref={circuitSvgRef} circuit={circuit} activeGateIndex={activeGateIndex} />

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
          </VizLatexToggle>
        )}

        {(views.includes("statevector") || views.includes("probabilities")) && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
            {views.includes("statevector") && (
              <VizLatexToggle>
                {(latexAction) => (
                  <VizSection
                    title="State Amplitudes"
                    action={
                      <HStack gap="1">
                        {latexAction}
                        <VizActions onCopy={handleStatevectorCopy} onDownload={handleStatevectorDownload} />
                      </HStack>
                    }
                  >
                    <Suspense fallback={<Skeleton h="280px" rounded="l3" />}>
                      <StateVectorChart
                        amplitudes={snapshot.amplitudes}
                        numQubits={circuit.numQubits}
                        onGraphDivReady={(graphDiv) => {
                          statevectorGraphDivRef.current = graphDiv;
                        }}
                      />
                    </Suspense>
                  </VizSection>
                )}
              </VizLatexToggle>
            )}
            {views.includes("probabilities") && (
              <VizLatexToggle>
                {(latexAction) => (
                  <VizSection
                    title="Measurement Probabilities"
                    action={
                      <HStack gap="1">
                        {latexAction}
                        <VizActions onCopy={handleProbabilitiesCopy} onDownload={handleProbabilitiesDownload} />
                      </HStack>
                    }
                  >
                    <ProbabilityBars amplitudes={snapshot.amplitudes} numQubits={circuit.numQubits} />
                  </VizSection>
                )}
              </VizLatexToggle>
            )}
          </SimpleGrid>
        )}

        {views.includes("table") && (
          <VizLatexToggle>
            {(latexAction) => (
              <VizSection
                title="Exact State"
                action={
                  <HStack gap="1">
                    {latexAction}
                    <VizFormatActions
                      onCopyImage={handleTableCopyImage}
                      onCopyCsv={handleTableCopyCsv}
                      onDownloadImage={handleTableDownloadImage}
                      onDownloadCsv={handleTableDownloadCsv}
                    />
                  </HStack>
                }
              >
                <StateTable amplitudes={snapshot.amplitudes} numQubits={circuit.numQubits} />
              </VizSection>
            )}
          </VizLatexToggle>
        )}

        {showBloch && (
          <VizLatexToggle>
            {(latexAction) => (
              <VizSection title="Bloch Sphere" action={latexAction}>
                <SimpleGrid columns={{ base: 1, sm: circuit.numQubits }} gap="6">
                  {Array.from({ length: circuit.numQubits }, (_, q) => (
                    <VStack key={q} gap="3">
                      <HStack justify="space-between" w="full">
                        <BlochQubitLabel index={q} numQubits={circuit.numQubits} label={circuit.qubitLabels?.[q]} />
                        <VizActions onCopy={() => handleBlochCopy(q)} onDownload={() => handleBlochDownload(q)} />
                      </HStack>
                      <Suspense fallback={<Skeleton h="320px" rounded="l3" w="full" />}>
                        <BlochSphere
                          vector={blochVector(snapshot.amplitudes, q)}
                          onCanvasReady={(canvas) => {
                            blochCanvasRefs.current[q] = canvas;
                          }}
                        />
                      </Suspense>
                    </VStack>
                  ))}
                </SimpleGrid>
              </VizSection>
            )}
          </VizLatexToggle>
        )}
      </VStack>
    </MdxCard>
  );
}
