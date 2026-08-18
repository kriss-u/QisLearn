import { Badge, Button, HStack, Progress, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState, type ReactNode } from "react";
import { LuBoxes } from "react-icons/lu";
import { ketLatex } from "../../viz/gateLatexLabels";
import { KatexSpan, useVizLatex, VizLatexToggle } from "../../viz/latexLabels";
import { VizSection } from "../../viz/VizSection";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";
import { ResetButton } from "./ResetButton";

type SingleQubitState = { label: string; ket: string; amps: [number, number] };

const STATES: SingleQubitState[] = [
  { label: "|0⟩", ket: "0", amps: [1, 0] },
  { label: "|1⟩", ket: "1", amps: [0, 1] },
  { label: "|+⟩", ket: "+", amps: [1 / Math.sqrt(2), 1 / Math.sqrt(2)] },
  { label: "|-⟩", ket: "-", amps: [1 / Math.sqrt(2), -1 / Math.sqrt(2)] },
];

const DEFAULT_INDEX = 2;
const BELL_STATE = [1 / Math.sqrt(2), 0, 0, 1 / Math.sqrt(2)];
const BASIS_LABELS = ["00", "01", "10", "11"];

export interface TensorProductBuilderProps {
  title: string;
  description?: string;
}

function AmplitudesBody({
  first,
  second,
  shown,
  showBell,
  action,
}: {
  first: SingleQubitState;
  second: SingleQubitState;
  shown: number[];
  showBell: boolean;
  action: ReactNode;
}) {
  const latex = useVizLatex();
  return (
    <VizSection title={showBell ? "Bell state (entangled)" : "Joint amplitudes"} action={action}>
      <VStack align="stretch" gap="3">
        {!showBell && (
          <Text fontFamily="mono" fontSize="sm" color="fg.muted">
            {latex ? <KatexSpan tex={`${ketLatex(first.ket)} \\otimes ${ketLatex(second.ket)}`} /> : `${first.label} ⊗ ${second.label}`}
          </Text>
        )}
        {BASIS_LABELS.map((label, i) => (
          <HStack key={label} gap="3">
            <Text fontFamily="mono" fontSize="sm" fontWeight="semibold" w="14">
              {latex ? <KatexSpan tex={ketLatex(label)} /> : `|${label}⟩`}
            </Text>
            <Progress.Root value={Math.min(100, Math.abs(shown[i]) * 100)} flex="1" size="md" colorPalette={showBell ? "violetAccent" : "quantum"}>
              <Progress.Track rounded="full" bg="bg.muted">
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
            <Text fontFamily="mono" fontSize="xs" color="fg.muted" w="16" textAlign="right">
              {shown[i].toFixed(3)}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VizSection>
  );
}

export function TensorProductBuilder({ title, description }: TensorProductBuilderProps) {
  const [firstIdx, setFirstIdx] = useState(DEFAULT_INDEX);
  const [secondIdx, setSecondIdx] = useState(DEFAULT_INDEX);
  const [showBell, setShowBell] = useState(false);
  const latex = useVizLatex();

  const first = STATES[firstIdx];
  const second = STATES[secondIdx];

  const product = useMemo(() => {
    const [a0, a1] = first.amps;
    const [b0, b1] = second.amps;
    return [a0 * b0, a0 * b1, a1 * b0, a1 * b1];
  }, [first, second]);

  const shown = showBell ? BELL_STATE : product;

  function reset() {
    setFirstIdx(DEFAULT_INDEX);
    setSecondIdx(DEFAULT_INDEX);
    setShowBell(false);
  }

  return (
    <MdxCard eyebrow={title} icon={<LuBoxes />} className="no-print">
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
        <VStack align="stretch" gap="2">
          <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase">
            Qubit 0 (left)
          </Text>
          <HStack gap="2" wrap="wrap">
            {STATES.map((s, i) => (
              <Button
                key={s.label}
                size="sm"
                variant={i === firstIdx && !showBell ? "solid" : "outline"}
                colorPalette="quantum"
                onClick={() => {
                  setFirstIdx(i);
                  setShowBell(false);
                }}
              >
                {latex ? <KatexSpan tex={ketLatex(s.ket)} /> : s.label}
              </Button>
            ))}
          </HStack>
        </VStack>
        <VStack align="stretch" gap="2">
          <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase">
            Qubit 1 (right)
          </Text>
          <HStack gap="2" wrap="wrap">
            {STATES.map((s, i) => (
              <Button
                key={s.label}
                size="sm"
                variant={i === secondIdx && !showBell ? "solid" : "outline"}
                colorPalette="quantum"
                onClick={() => {
                  setSecondIdx(i);
                  setShowBell(false);
                }}
              >
                {latex ? <KatexSpan tex={ketLatex(s.ket)} /> : s.label}
              </Button>
            ))}
          </HStack>
        </VStack>
      </SimpleGrid>

      <VizLatexToggle>
        {(latexAction) => (
          <AmplitudesBody
            first={first}
            second={second}
            shown={shown}
            showBell={showBell}
            action={
              <HStack gap="1">
                <Button
                  size="xs"
                  variant={showBell ? "solid" : "ghost"}
                  colorPalette="violetAccent"
                  onClick={() => setShowBell((v) => !v)}
                >
                  {showBell ? "Back to builder" : "Try the Bell state instead"}
                </Button>
                {latexAction}
                <ResetButton onClick={reset} />
              </HStack>
            }
          />
        )}
      </VizLatexToggle>

      {showBell && (
        <Badge alignSelf="flex-start" colorPalette="violetAccent" variant="subtle">
          No choice of qubit 0 / qubit 1 states above can ever reproduce this row: it is not a tensor product.
        </Badge>
      )}

      <Text fontSize="xs" color="fg.muted">
        Pick a single-qubit state for each qubit and watch the four joint amplitudes update live, every entry is
        just one amplitude from the left state times one from the right. Then flip to the Bell state: it is a
        perfectly valid 2-qubit state, but no button combination above builds it, which is exactly what "entangled"
        means.
      </Text>
    </MdxCard>
  );
}
