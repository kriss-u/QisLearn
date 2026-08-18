import { Button, HStack, Progress, SimpleGrid, Slider, Text, useToken, VStack } from "@chakra-ui/react";
import { useMemo, useState, type ReactNode } from "react";
import { LuTarget } from "react-icons/lu";
import { resolveCssVar } from "../../../features/export/resolveCssVar";
import { KatexSpan, useVizLatex, VizLatexToggle } from "../../viz/latexLabels";
import { PlaneArrow, PlanePanel, usePlaneGeometry } from "../../viz/PlanePanel";
import { VizSection } from "../../viz/VizSection";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";
import { ResetButton } from "./ResetButton";

export interface GroverRotationPlaygroundProps {
  title: string;
  description?: string;
  nOptions?: number[];
}

const SIZE = 200;
const RANGE = 1.3;
const DEFAULT_N_OPTIONS = [4, 16, 64, 256];
const DEFAULT_K = 1;

interface BodyProps {
  n: number;
  k: number;
  setK: (k: number) => void;
  kOpt: number;
  kMax: number;
  action: ReactNode;
}

function GroverRotationBody({ n, k, setK, kOpt, kMax, action }: BodyProps) {
  const latex = useVizLatex();
  const [stateColor, startColor] = useToken("colors", ["quantum.500", "fg.muted"]).map(resolveCssVar);
  const geometry = usePlaneGeometry(SIZE, RANGE);

  const theta = Math.asin(1 / Math.sqrt(n));
  const angle = (2 * k + 1) * theta;
  const successProb = Math.sin(angle) ** 2;
  const startAngle = theta;

  const kValues = useMemo(() => Array.from({ length: kMax + 1 }, (_, i) => i), [kMax]);

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" alignItems="center">
      <VizSection title="State in the (|s'⟩, |ω⟩) plane" action={action}>
        <PlanePanel geometry={geometry} xLabel={{ tex: "|s'\\rangle", plain: "|s'⟩" }} yLabel={{ tex: "|\\omega\\rangle", plain: "|ω⟩" }}>
          <PlaneArrow
            geometry={geometry}
            x={Math.cos(startAngle)}
            y={Math.sin(startAngle)}
            color={startColor}
            label={{ tex: "\\text{start}", plain: "start" }}
            dashed
          />
          <PlaneArrow
            geometry={geometry}
            x={Math.cos(angle)}
            y={Math.sin(angle)}
            color={stateColor}
            label={{ tex: "\\text{state}", plain: "state" }}
          />
        </PlanePanel>
      </VizSection>

      <VStack align="stretch" gap="5">
        <VStack align="stretch" gap="1.5">
          <HStack justify="space-between">
            <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase">
              {latex ? <KatexSpan tex="\text{Grover iterations } k" /> : "Grover iterations k"}
            </Text>
            <Text fontSize="xs" fontFamily="mono" color="fg.muted">
              {k} {k === kOpt ? "(optimal)" : ""}
            </Text>
          </HStack>
          <Slider.Root min={0} max={kValues.length - 1} step={1} value={[k]} onValueChange={(d) => setK(d.value[0])} colorPalette="quantum">
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
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="fg.muted">
              {latex ? <KatexSpan tex="P(\text{measure } \omega)" /> : "P(measure ω)"}
            </Text>
            <Text fontFamily="mono" fontSize="sm">
              {(successProb * 100).toFixed(1)}%
            </Text>
          </HStack>
          <Progress.Root value={successProb * 100} size="md" colorPalette="quantum">
            <Progress.Track rounded="full" bg="bg.muted">
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </VStack>

        <Text fontSize="xs" fontFamily="mono" color="fg.muted">
          {latex ? <KatexSpan tex={`k_{\\text{opt}} \\approx \\tfrac{\\pi}{4}\\sqrt{N} \\approx ${kOpt}`} /> : `k_opt ≈ π/4·√N ≈ ${kOpt}`}
        </Text>
      </VStack>
    </SimpleGrid>
  );
}

export function GroverRotationPlayground({ title, description, nOptions = DEFAULT_N_OPTIONS }: GroverRotationPlaygroundProps) {
  const defaultN = nOptions[1] ?? nOptions[0];
  const [n, setN] = useState(defaultN);
  const [k, setK] = useState(DEFAULT_K);

  const theta = Math.asin(1 / Math.sqrt(n));
  const kOpt = Math.max(0, Math.round(Math.PI / (4 * theta) - 0.5));
  const kMax = Math.max(4, kOpt * 2 + 2);

  function reset() {
    setN(defaultN);
    setK(DEFAULT_K);
  }

  return (
    <MdxCard eyebrow={title} icon={<LuTarget />} className="no-print">
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}

      <HStack gap="2" wrap="wrap">
        <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase" alignSelf="center">
          N =
        </Text>
        {nOptions.map((option) => (
          <Button
            key={option}
            size="sm"
            variant={option === n ? "solid" : "outline"}
            colorPalette="quantum"
            onClick={() => {
              setN(option);
              setK(0);
            }}
          >
            {option}
          </Button>
        ))}
      </HStack>

      <VizLatexToggle>
        {(latexAction) => (
          <GroverRotationBody
            n={n}
            k={k}
            setK={setK}
            kOpt={kOpt}
            kMax={kMax}
            action={
              <HStack gap="1">
                {latexAction}
                <ResetButton onClick={reset} />
              </HStack>
            }
          />
        )}
      </VizLatexToggle>

      <Text fontSize="xs" color="fg.muted">
        <Markdown inline>
          {String.raw`Each iteration rotates the state by $2\theta$ toward $|\omega\rangle$. Slide $k$ up past $k_{\text{opt}}$ and watch the success probability peak, then fall again, overshoot is real in Grover's algorithm, unlike classical search. Try a bigger $N$: the starting angle $\theta$ shrinks, so more iterations are needed, but the achievable peak probability stays close to 1.`}
        </Markdown>
      </Text>
    </MdxCard>
  );
}
