import { Box, HStack, Progress, Text, VStack } from "@chakra-ui/react";
import { basisLabels } from "../../features/quantum/simulate";

export interface ShotsHistogramProps {
  numQubits: number;
  counts: number[];
  shots: number;
}

export function ShotsHistogram({ numQubits, counts, shots }: ShotsHistogramProps) {
  const labels = basisLabels(numQubits);

  return (
    <Box borderWidth="1px" borderColor="border" rounded="l3" bg="bg.panel" p="5" h="full">
      <VStack align="stretch" gap="3">
        {labels.map((label, i) => {
          const pct = shots > 0 ? (counts[i] / shots) * 100 : 0;
          return (
            <HStack key={label} gap="3">
              <Text fontFamily="mono" fontSize="sm" fontWeight="semibold" w="16">
                {`|${label}⟩`}
              </Text>
              <Progress.Root value={pct} flex="1" size="md" colorPalette="ember">
                <Progress.Track rounded="full" bg="bg.muted">
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              <Text fontFamily="mono" fontSize="xs" color="fg.muted" w="24" textAlign="right">
                {counts[i]} ({pct.toFixed(1)}%)
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
}
