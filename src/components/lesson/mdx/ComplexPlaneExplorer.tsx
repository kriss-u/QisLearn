import { HStack, SimpleGrid, Slider, Text, useToken, VStack } from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { LuOrbit } from "react-icons/lu";
import { resolveCssVar } from "../../../features/export/resolveCssVar";
import { KatexSpan, useVizLatex, VizLatexToggle } from "../../viz/latexLabels";
import { PlaneArrow, PlanePanel, usePlaneGeometry } from "../../viz/PlanePanel";
import { VizSection } from "../../viz/VizSection";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";
import { ResetButton } from "./ResetButton";

export interface ComplexPlaneExplorerProps {
  title: string;
  description?: string;
}

const SIZE = 200;
const RANGE = 1.3;
const DEFAULT_R = 1;
const DEFAULT_THETA_DEG = 45;

function StatRow({ tex, plain, latex, value }: { tex: string; plain: string; latex: boolean; value: string }) {
  return (
    <>
      <Text color="fg.muted">{latex ? <KatexSpan tex={tex} /> : plain}</Text>
      <Text textAlign="right">{value}</Text>
    </>
  );
}

interface BodyProps {
  r: number;
  setR: (r: number) => void;
  thetaDeg: number;
  setThetaDeg: (t: number) => void;
  action: ReactNode;
}

function ComplexPlaneBody({ r, setR, thetaDeg, setThetaDeg, action }: BodyProps) {
  const latex = useVizLatex();
  const [pointColor] = useToken("colors", ["quantum.500"]).map(resolveCssVar);
  const geometry = usePlaneGeometry(SIZE, RANGE);

  const theta = (thetaDeg * Math.PI) / 180;
  const a = r * Math.cos(theta);
  const b = r * Math.sin(theta);

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" alignItems="center">
      <VizSection title="Complex plane" action={action}>
        <PlanePanel geometry={geometry} xLabel={{ tex: "\\mathrm{Re}", plain: "Re" }} yLabel={{ tex: "\\mathrm{Im}", plain: "Im" }}>
          <PlaneArrow geometry={geometry} x={a} y={b} color={pointColor} label={{ tex: "z", plain: "z" }} />
        </PlanePanel>
      </VizSection>

      <VStack align="stretch" gap="5">
        <VStack align="stretch" gap="1.5">
          <HStack justify="space-between">
            <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase">
              {latex ? <KatexSpan tex="\text{Modulus } r" /> : "Modulus r"}
            </Text>
            <Text fontSize="xs" fontFamily="mono" color="fg.muted">
              {r.toFixed(2)}
            </Text>
          </HStack>
          <Slider.Root min={0} max={1.2} step={0.01} value={[r]} onValueChange={(d) => setR(d.value[0])} colorPalette="quantum">
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
              {latex ? <KatexSpan tex="\text{Phase } \theta" /> : "Phase θ"}
            </Text>
            <Text fontSize="xs" fontFamily="mono" color="fg.muted">
              {thetaDeg.toFixed(0)}°
            </Text>
          </HStack>
          <Slider.Root min={0} max={360} step={1} value={[thetaDeg]} onValueChange={(d) => setThetaDeg(d.value[0])} colorPalette="quantum">
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

        <SimpleGrid columns={2} gap="3" fontFamily="mono" fontSize="sm">
          <StatRow tex="z = a + bi" plain="z = a + bi" latex={latex} value={`${a.toFixed(2)} ${b >= 0 ? "+" : "-"} ${Math.abs(b).toFixed(2)}i`} />
          <StatRow tex="|z|" plain="|z|" latex={latex} value={r.toFixed(3)} />
          <StatRow tex="|z|^2" plain="|z|²" latex={latex} value={(r * r).toFixed(3)} />
          <StatRow tex="z^*" plain="z*" latex={latex} value={`${a.toFixed(2)} ${b >= 0 ? "-" : "+"} ${Math.abs(b).toFixed(2)}i`} />
        </SimpleGrid>
      </VStack>
    </SimpleGrid>
  );
}

export function ComplexPlaneExplorer({ title, description }: ComplexPlaneExplorerProps) {
  const [r, setR] = useState(DEFAULT_R);
  const [thetaDeg, setThetaDeg] = useState(DEFAULT_THETA_DEG);

  function reset() {
    setR(DEFAULT_R);
    setThetaDeg(DEFAULT_THETA_DEG);
  }

  return (
    <MdxCard eyebrow={title} icon={<LuOrbit />} className="no-print">
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}

      <VizLatexToggle>
        {(latexAction) => (
          <ComplexPlaneBody
            r={r}
            setR={setR}
            thetaDeg={thetaDeg}
            setThetaDeg={setThetaDeg}
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
          {String.raw`Drag either slider: $r$ sets how far $z$ sits from the origin, $\theta$ sets its angle. If $z$ were a qubit amplitude, $|z|^2$ (bottom row) is exactly the measurement probability it contributes, regardless of what $\theta$ is, only $r$ matters for that number.`}
        </Markdown>
      </Text>
    </MdxCard>
  );
}
