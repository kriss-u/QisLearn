import { Badge, Button, HStack, SimpleGrid, Slider, Text, useToken, VStack } from "@chakra-ui/react";
import { useMemo, useState, type ReactNode } from "react";
import { LuGrid2X2 } from "react-icons/lu";
import { resolveCssVar } from "../../../features/export/resolveCssVar";
import { KatexSpan, useVizLatex, VizLatexToggle } from "../../viz/latexLabels";
import { PlaneArrow, PlanePanel, usePlaneGeometry } from "../../viz/PlanePanel";
import { VizSection } from "../../viz/VizSection";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";
import { ResetButton } from "./ResetButton";

export interface MatrixPreset {
  id: string;
  label: string;
  matrix: [[number, number], [number, number]];
}

export interface MatrixTransformPlaygroundProps {
  title: string;
  description?: string;
  presets: MatrixPreset[];
  defaultPresetId?: string;
  showTrace?: boolean;
  showEigenReadout?: boolean;
}

const SIZE = 200;
const RANGE = 1.6;
const TRACE_SAMPLES = 72;
const DEFAULT_ANGLE_DEG = 20;

function apply(matrix: MatrixPreset["matrix"], x: number, y: number): [number, number] {
  return [matrix[0][0] * x + matrix[0][1] * y, matrix[1][0] * x + matrix[1][1] * y];
}

interface BodyProps {
  preset: MatrixPreset;
  angleDeg: number;
  setAngleDeg: (deg: number) => void;
  showTrace: boolean;
  showEigenReadout: boolean;
  action: ReactNode;
}

function MatrixTransformBody({ preset, angleDeg, setAngleDeg, showTrace, showEigenReadout, action }: BodyProps) {
  const latex = useVizLatex();
  const [inputColor, outputColor, traceColor] = useToken("colors", [
    "fg.muted",
    "quantum.500",
    "violetAccent.500",
  ]).map(resolveCssVar);
  const geometry = usePlaneGeometry(SIZE, RANGE);

  const angle = (angleDeg * Math.PI) / 180;
  const vx = Math.cos(angle);
  const vy = Math.sin(angle);
  const [ox, oy] = apply(preset.matrix, vx, vy);
  const outLen = Math.hypot(ox, oy);

  const dot = vx * ox + vy * oy;
  const cross = vx * oy - vy * ox;
  const isEigenDirection = Math.abs(cross) < 0.02;

  const tracePath = useMemo(() => {
    const points: string[] = [];
    for (let i = 0; i <= TRACE_SAMPLES; i++) {
      const t = (i / TRACE_SAMPLES) * 2 * Math.PI;
      const [tx, ty] = apply(preset.matrix, Math.cos(t), Math.sin(t));
      points.push(`${geometry.toX(tx)},${geometry.toY(ty)}`);
    }
    return points.join(" ");
  }, [preset, geometry]);

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" alignItems="center">
      <VizSection title="Vector transform" action={action}>
        <PlanePanel geometry={geometry} xLabel={{ tex: "x", plain: "x" }} yLabel={{ tex: "y", plain: "y" }}>
          {showTrace && <polyline points={tracePath} fill="none" stroke={traceColor} strokeWidth={1.5} opacity={0.6} />}
          <PlaneArrow geometry={geometry} x={vx} y={vy} color={inputColor} label={{ tex: "v", plain: "v" }} dashed />
          <PlaneArrow geometry={geometry} x={ox} y={oy} color={outputColor} label={{ tex: "Mv", plain: "Mv" }} />
        </PlanePanel>
      </VizSection>

      <VStack align="stretch" gap="5">
        <VStack align="stretch" gap="1.5">
          <HStack justify="space-between">
            <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase">
              {latex ? <KatexSpan tex="\text{Angle of } v" /> : "Input direction (angle of v)"}
            </Text>
            <Text fontSize="xs" fontFamily="mono" color="fg.muted">
              {angleDeg.toFixed(0)}°
            </Text>
          </HStack>
          <Slider.Root min={0} max={360} step={1} value={[angleDeg]} onValueChange={(d) => setAngleDeg(d.value[0])} colorPalette="quantum">
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
          <Text color="fg.muted">{latex ? <KatexSpan tex="v" /> : "v"}</Text>
          <Text textAlign="right">
            ({vx.toFixed(2)}, {vy.toFixed(2)})
          </Text>
          <Text color="fg.muted">{latex ? <KatexSpan tex="Mv" /> : "Mv"}</Text>
          <Text textAlign="right">
            ({ox.toFixed(2)}, {oy.toFixed(2)})
          </Text>
          <Text color="fg.muted">{latex ? <KatexSpan tex="\|Mv\|" /> : "‖Mv‖"}</Text>
          <Text textAlign="right">{outLen.toFixed(3)}</Text>
        </SimpleGrid>

        {showEigenReadout && (
          <Badge alignSelf="flex-start" colorPalette={isEigenDirection ? "quantum" : "gray"} variant="subtle" size="lg">
            {isEigenDirection ? (
              <HStack gap="1">
                <Text as="span">Eigendirection:</Text>
                {latex ? <KatexSpan tex={`\\lambda \\approx ${dot.toFixed(2)}`} /> : <Text as="span">λ ≈ {dot.toFixed(2)}</Text>}
              </HStack>
            ) : (
              <Text as="span">
                {latex ? <KatexSpan tex="Mv" /> : "Mv"} is not parallel to {latex ? <KatexSpan tex="v" /> : "v"}
              </Text>
            )}
          </Badge>
        )}
      </VStack>
    </SimpleGrid>
  );
}

export function MatrixTransformPlayground({
  title,
  description,
  presets,
  defaultPresetId,
  showTrace = false,
  showEigenReadout = false,
}: MatrixTransformPlaygroundProps) {
  const initialPresetId = defaultPresetId ?? presets[0].id;
  const [presetId, setPresetId] = useState(initialPresetId);
  const [angleDeg, setAngleDeg] = useState(DEFAULT_ANGLE_DEG);
  const preset = presets.find((p) => p.id === presetId) ?? presets[0];

  function reset() {
    setPresetId(initialPresetId);
    setAngleDeg(DEFAULT_ANGLE_DEG);
  }

  return (
    <MdxCard eyebrow={title} icon={<LuGrid2X2 />} className="no-print">
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}

      <HStack gap="2" wrap="wrap">
        {presets.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={p.id === presetId ? "solid" : "outline"}
            colorPalette="quantum"
            onClick={() => setPresetId(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </HStack>

      <VizLatexToggle>
        {(latexAction) => (
          <MatrixTransformBody
            preset={preset}
            angleDeg={angleDeg}
            setAngleDeg={setAngleDeg}
            showTrace={showTrace}
            showEigenReadout={showEigenReadout}
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
          {showEigenReadout
            ? String.raw`Sweep the angle until the dashed input arrow $v$ and the solid output arrow $Mv$ point along the same line (or exactly opposite): that's an eigendirection, and the badge shows its eigenvalue $\lambda$.`
            : showTrace
              ? String.raw`The violet loop traces every possible output $Mv$ as $v$ sweeps a full circle. A circle in, circle out means $M$ preserves length for every direction, exactly the unitary condition; a squashed or stretched loop means it doesn't.`
              : String.raw`Drag the slider to sweep $v$ around the unit circle and watch how $M$ reshapes it into $Mv$.`}
        </Markdown>
      </Text>
    </MdxCard>
  );
}
