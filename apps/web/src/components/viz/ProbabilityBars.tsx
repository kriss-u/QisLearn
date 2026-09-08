import { Box, HStack, Progress, Text, VStack } from "@chakra-ui/react";
import { basisLabels, probabilities, type StateVector } from "../../features/quantum/simulate";
import { ketLatex } from "./gateLatexLabels";
import { KatexSpan, useVizLatex } from "./latexLabels";

export interface ProbabilityBarsProps {
  amplitudes: StateVector;
  numQubits: number;
}

export function ProbabilityBars({ amplitudes, numQubits }: ProbabilityBarsProps) {
  const labels = basisLabels(numQubits);
  const probs = probabilities(amplitudes);
  const latex = useVizLatex();

  return (
    <Box borderWidth="1px" borderColor="border" rounded="l3" bg="bg.panel" p="5">
      <VStack align="stretch" gap="3">
        {labels.map((label, i) => (
          <HStack key={label} gap="3">
            <Text fontFamily="mono" fontSize="sm" fontWeight="semibold" w="16">
              {latex ? <KatexSpan tex={ketLatex(label)} /> : `|${label}⟩`}
            </Text>
            <Progress.Root value={Math.min(100, probs[i] * 100)} flex="1" size="md" colorPalette="quantum">
              <Progress.Track rounded="full" bg="bg.muted">
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
            <Text fontFamily="mono" fontSize="xs" color="fg.muted" w="12" textAlign="right">
              {(probs[i] * 100).toFixed(1)}%
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
