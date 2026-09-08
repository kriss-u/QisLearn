import { Badge, Button, HStack, SimpleGrid, Text, VStack, Wrap } from "@chakra-ui/react";
import { useMemo, useState, type ReactNode } from "react";
import { LuRepeat } from "react-icons/lu";
import { KatexSpan, useVizLatex, VizLatexToggle } from "../../viz/latexLabels";
import { VizSection } from "../../viz/VizSection";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";
import { ResetButton } from "./ResetButton";

export interface ModularExponentiationExplorerProps {
  title: string;
  description?: string;
  modulus?: number;
  bases?: number[];
  maxK?: number;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function SequenceBody({
  modulus,
  maxK,
  sequence,
  period,
  action,
}: {
  modulus: number;
  maxK: number;
  sequence: number[];
  period: number | null;
  action: ReactNode;
}) {
  const latex = useVizLatex();
  return (
    <VizSection title="Powers of a, mod N" action={action}>
      <Text fontSize="xs" color="fg.muted" mb="3">
        {latex ? <KatexSpan tex={`a^k \\bmod ${modulus}, \\text{ for } k = 0..${maxK}`} /> : `a^k mod ${modulus}, for k = 0..${maxK}`}
      </Text>
      <VStack align="stretch" gap="3">
        <Wrap gap="2">
          {sequence.map((value, k) => {
            const closesPeriod = period !== null && k === period;
            return (
              <Badge key={k} size="lg" variant={closesPeriod ? "solid" : "subtle"} colorPalette={closesPeriod ? "quantum" : "gray"} fontFamily="mono">
                {latex ? <KatexSpan tex={`k=${k}: ${value}`} /> : `k=${k}: ${value}`}
              </Badge>
            );
          })}
        </Wrap>
      </VStack>
    </VizSection>
  );
}

export function ModularExponentiationExplorer({
  title,
  description,
  modulus = 15,
  bases = [2, 4, 7, 8, 11, 13],
  maxK = 12,
}: ModularExponentiationExplorerProps) {
  const validBases = useMemo(() => bases.filter((base) => gcd(base, modulus) === 1), [bases, modulus]);
  const defaultA = validBases[0];
  const [a, setA] = useState(defaultA);
  const latex = useVizLatex();

  const sequence = useMemo(() => {
    const values: number[] = [];
    let current = 1;
    for (let k = 0; k <= maxK; k++) {
      values.push(current);
      current = (current * a) % modulus;
    }
    return values;
  }, [a, modulus, maxK]);

  const period = useMemo(() => {
    for (let r = 1; r <= maxK; r++) {
      if (sequence[r] === 1) return r;
    }
    return null;
  }, [sequence, maxK]);

  function reset() {
    setA(defaultA);
  }

  return (
    <MdxCard eyebrow={title} icon={<LuRepeat />} className="no-print">
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}

      <HStack gap="2" wrap="wrap">
        <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase" alignSelf="center">
          {latex ? <KatexSpan tex="a =" /> : "a ="}
        </Text>
        {validBases.map((option) => (
          <Button key={option} size="sm" variant={option === a ? "solid" : "outline"} colorPalette="quantum" onClick={() => setA(option)}>
            {option}
          </Button>
        ))}
      </HStack>

      <VizLatexToggle>
        {(latexAction) => (
          <SequenceBody
            modulus={modulus}
            maxK={maxK}
            sequence={sequence}
            period={period}
            action={
              <HStack gap="1">
                {latexAction}
                <ResetButton onClick={reset} />
              </HStack>
            }
          />
        )}
      </VizLatexToggle>

      <SimpleGrid columns={2} gap="3" fontFamily="mono" fontSize="sm">
        <Text color="fg.muted">
          {latex ? <KatexSpan tex="\text{Order } r \text{ (smallest } k \text{ with } a^k \equiv 1\text{)}" /> : "Order r (smallest k with a^k ≡ 1)"}
        </Text>
        <Text textAlign="right">{period ?? `> ${maxK}`}</Text>
      </SimpleGrid>

      <Text fontSize="xs" color="fg.muted">
        <Markdown inline>
          {String.raw`Switch $a$ and watch the sequence of remainders repeat with a different period every time. That period $r$ is exactly the number Quantum Phase Estimation is used to extract: the sequence $a^0, a^1, a^2, \ldots \bmod ${modulus}$ is periodic with period $r$ for any $a$ coprime to ${modulus}$, and once you know $r$, the classical post-processing in the next lesson turns it into ${modulus}'s factors.`}
        </Markdown>
      </Text>
    </MdxCard>
  );
}
