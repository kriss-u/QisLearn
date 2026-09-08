import { HStack, SimpleGrid, Slider, Text, useToken, VStack } from "@chakra-ui/react";
import { useMemo, useState, type ReactNode } from "react";
import { LuWaves } from "react-icons/lu";
import { resolveCssVar } from "../../../features/export/resolveCssVar";
import { KatexSpan, useVizLatex, VizLatexToggle } from "../../viz/latexLabels";
import { PlaneArrow, PlanePanel, PlanePoint, usePlaneGeometry } from "../../viz/PlanePanel";
import { VizSection } from "../../viz/VizSection";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";
import { ResetButton } from "./ResetButton";

export interface QFTPhaseWheelProps {
  title: string;
  description?: string;
  numQubits?: number;
}

const SIZE = 200;
const RANGE = 1.3;
const DEFAULT_K = 1;

interface BodyProps {
  N: number;
  k: number;
  setK: (k: number) => void;
  action: ReactNode;
}

function QFTPhaseBody({ N, k, setK, action }: BodyProps) {
  const latex = useVizLatex();
  const [dotColor, highlightColor, mutedColor] = useToken("colors", ["fg.muted", "quantum.500", "border"]).map(resolveCssVar);
  const geometry = usePlaneGeometry(SIZE, RANGE);

  const points = useMemo(
    () =>
      Array.from({ length: N }, (_, n) => {
        const phase = (2 * Math.PI * k * n) / N;
        return { n, x: Math.cos(phase), y: Math.sin(phase) };
      }),
    [N, k],
  );

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" alignItems="center">
      <VizSection title="Output phases" action={action}>
        <PlanePanel geometry={geometry} xLabel={{ tex: "\\mathrm{Re}", plain: "Re" }} yLabel={{ tex: "\\mathrm{Im}", plain: "Im" }}>
          {points.map((p, i) => (
            <PlanePoint key={p.n} geometry={geometry} x={p.x} y={p.y} color={i === 0 ? highlightColor : mutedColor} r={5} />
          ))}
          <PlaneArrow geometry={geometry} x={points[1]?.x ?? 1} y={points[1]?.y ?? 0} color={dotColor} label={{ tex: "n=1", plain: "n=1" }} />
        </PlanePanel>
      </VizSection>

      <VStack align="stretch" gap="5">
        <VStack align="stretch" gap="1.5">
          <HStack justify="space-between">
            <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase">
              {latex ? <KatexSpan tex="\text{Basis state } |k\rangle" /> : "Basis state |k⟩"}
            </Text>
            <Text fontSize="xs" fontFamily="mono" color="fg.muted">
              k = {k} / {N - 1}
            </Text>
          </HStack>
          <Slider.Root min={0} max={N - 1} step={1} value={[k]} onValueChange={(d) => setK(d.value[0])} colorPalette="quantum">
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

        <VStack align="stretch" gap="1" fontFamily="mono" fontSize="xs">
          <Text color="fg.muted">Output amplitude on basis state n</Text>
          <Text>
            {latex ? <KatexSpan tex={`\\tfrac{1}{\\sqrt{${N}}} e^{2\\pi i k n / ${N}}`} /> : `(1/√${N})e^(2πikn/${N})`}
          </Text>
        </VStack>

        <Text fontSize="xs" color="fg.muted">
          <Markdown inline>
            {String.raw`$\text{QFT}|k\rangle$ gives every one of the ${N} basis states equal weight $1/\sqrt{${N}}$, but a different phase each. The dots are those ${N} phases for the $k$ you picked, evenly spaced around the circle, $k$ steps apart each time. The highlighted dot is $n=0$ (always phase 0); the arrow marks $n=1$, whose phase alone, $2\pi k/${N}$, is exactly what distinguishes one value of $k$ from another.`}
          </Markdown>
        </Text>
      </VStack>
    </SimpleGrid>
  );
}

export function QFTPhaseWheel({ title, description, numQubits = 3 }: QFTPhaseWheelProps) {
  const N = 2 ** numQubits;
  const [k, setK] = useState(DEFAULT_K);

  function reset() {
    setK(DEFAULT_K);
  }

  return (
    <MdxCard eyebrow={title} icon={<LuWaves />} className="no-print">
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}

      <VizLatexToggle>
        {(latexAction) => (
          <QFTPhaseBody
            N={N}
            k={k}
            setK={setK}
            action={
              <HStack gap="1">
                {latexAction}
                <ResetButton onClick={reset} />
              </HStack>
            }
          />
        )}
      </VizLatexToggle>
    </MdxCard>
  );
}
