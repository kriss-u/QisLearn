import { HStack, Progress, SimpleGrid, Slider, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { LuGauge } from "react-icons/lu";
import { KatexSpan, useVizLatex, VizLatexToggle } from "../../viz/latexLabels";
import { VizSection } from "../../viz/VizSection";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";
import { ResetButton } from "./ResetButton";

export interface PhaseEstimationPlaygroundProps {
  title: string;
  description?: string;
}

const DEFAULT_THETA_PCT = 37;
const DEFAULT_T = 3;

function ProbabilityRows({ probs, M, bestM }: { probs: number[]; M: number; bestM: number }) {
  const latex = useVizLatex();
  return (
    <VStack align="stretch" gap="2">
      {probs.map((p, m) => (
        <HStack key={m} gap="3">
          <Text fontFamily="mono" fontSize="xs" color="fg.muted" w="14">
            {latex ? <KatexSpan tex={`${m}/${M}`} /> : `${m}/${M}`}
          </Text>
          <Progress.Root value={Math.min(100, p * 100)} flex="1" size="sm" colorPalette={m === bestM ? "quantum" : "gray"}>
            <Progress.Track rounded="full" bg="bg.muted">
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontFamily="mono" fontSize="xs" color="fg.muted" w="14" textAlign="right">
            {(p * 100).toFixed(1)}%
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

function outcomeDistribution(thetaFraction: number, t: number): number[] {
  const M = 2 ** t;
  const probs: number[] = [];
  for (let m = 0; m < M; m++) {
    const delta = thetaFraction - m / M;
    if (Math.abs(delta) < 1e-9) {
      probs.push(1);
      continue;
    }
    const numerator = Math.sin(Math.PI * delta * M);
    const denominator = Math.sin(Math.PI * delta);
    const amp = numerator / (M * denominator);
    probs.push(amp * amp);
  }
  return probs;
}

export function PhaseEstimationPlayground({ title, description }: PhaseEstimationPlaygroundProps) {
  const [thetaPct, setThetaPct] = useState(DEFAULT_THETA_PCT);
  const [t, setT] = useState(DEFAULT_T);
  const latex = useVizLatex();

  const thetaFraction = thetaPct / 100;
  const probs = useMemo(() => outcomeDistribution(thetaFraction, t), [thetaFraction, t]);
  const M = 2 ** t;
  const bestM = Math.round(thetaFraction * M) % M;
  const bestProb = probs[bestM];

  function reset() {
    setThetaPct(DEFAULT_THETA_PCT);
    setT(DEFAULT_T);
  }

  return (
    <MdxCard eyebrow={title} icon={<LuGauge />} className="no-print">
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
        <VStack align="stretch" gap="1.5">
          <HStack justify="space-between">
            <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase">
              {latex ? <KatexSpan tex="\text{True phase } \theta \text{ (as a fraction of } 2\pi\text{)}" /> : "True phase θ (as a fraction of 2π)"}
            </Text>
            <Text fontSize="xs" fontFamily="mono" color="fg.muted">
              {thetaFraction.toFixed(3)}
            </Text>
          </HStack>
          <Slider.Root min={1} max={99} step={1} value={[thetaPct]} onValueChange={(d) => setThetaPct(d.value[0])} colorPalette="quantum">
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0}>
                <Slider.HiddenInput />
              </Slider.Thumb>
            </Slider.Control>
          </Slider.Root>
        </VStack>

        <VStack align="stretch" gap="1.5">
          <HStack justify="space-between">
            <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase">
              {latex ? <KatexSpan tex="\text{Counting qubits } t" /> : "Counting qubits t"}
            </Text>
            <Text fontSize="xs" fontFamily="mono" color="fg.muted">
              {t} ({M} outcomes)
            </Text>
          </HStack>
          <Slider.Root min={2} max={6} step={1} value={[t]} onValueChange={(d) => setT(d.value[0])} colorPalette="quantum">
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0}>
                <Slider.HiddenInput />
              </Slider.Thumb>
            </Slider.Control>
          </Slider.Root>
        </VStack>
      </SimpleGrid>

      <VizLatexToggle>
        {(latexAction) => (
          <VizSection
            title={`Probability of measuring each m/${M}`}
            action={
              <HStack gap="1">
                {latexAction}
                <ResetButton onClick={reset} />
              </HStack>
            }
          >
            <ProbabilityRows probs={probs} M={M} bestM={bestM} />
          </VizSection>
        )}
      </VizLatexToggle>

      <Text fontSize="xs" color="fg.muted">
        <Markdown inline>
          {String.raw`The best estimate is $m = ${bestM}$ (that is, $\theta \approx ${bestM}/${M} = ${(bestM / M).toFixed(3)}$), hit with probability ${(bestProb * 100).toFixed(1)}%. Push $t$ up: more counting qubits means more possible outcomes $m$, so the distribution concentrates tighter around the true $\theta$ instead of spreading probability across neighboring values.`}
        </Markdown>
      </Text>
    </MdxCard>
  );
}
