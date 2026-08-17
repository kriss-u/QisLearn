import { HStack, Progress, Table, Text } from "@chakra-ui/react";
import { basisLabels, probabilities, type StateVector } from "../../features/quantum/simulate";
import { ketLatex } from "./gateLatexLabels";
import { KatexSpan, useVizLatex } from "./latexLabels";

export interface StateTableProps {
  amplitudes: StateVector;
  numQubits: number;
}

const ZERO_EPSILON = 1e-9;

function formatComponent(value: number): string {
  return Math.abs(value) < ZERO_EPSILON ? "0" : value.toFixed(3);
}

export function StateTable({ amplitudes, numQubits }: StateTableProps) {
  const labels = basisLabels(numQubits);
  const probs = probabilities(amplitudes);
  const latex = useVizLatex();

  return (
    <Table.ScrollArea borderWidth="1px" borderColor="border" rounded="l3">
      <Table.Root size="sm" variant="outline" colorPalette="quantum">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Basis state</Table.ColumnHeader>
            <Table.ColumnHeader>Re</Table.ColumnHeader>
            <Table.ColumnHeader>Im</Table.ColumnHeader>
            <Table.ColumnHeader>Probability</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {labels.map((label, i) => {
            const amp = amplitudes[i];
            const isZero = probs[i] < ZERO_EPSILON;
            return (
              <Table.Row key={label}>
                <Table.Cell fontFamily="mono" fontWeight="semibold">
                  {latex ? <KatexSpan tex={ketLatex(label)} /> : `|${label}⟩`}
                </Table.Cell>
                <Table.Cell fontFamily="mono" color={isZero ? "fg.muted" : undefined}>
                  {formatComponent(amp.re)}
                </Table.Cell>
                <Table.Cell fontFamily="mono" color={isZero ? "fg.muted" : undefined}>
                  {formatComponent(amp.im)}
                </Table.Cell>
                <Table.Cell fontFamily="mono" color={isZero ? "fg.muted" : "colorPalette.fg"}>
                  <HStack gap="3" justify="flex-end">
                    <Progress.Root value={probs[i] * 100} flex="1" minW="16" size="xs" colorPalette="quantum">
                      <Progress.Track rounded="full" bg="bg.muted">
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <Text as="span" fontWeight={isZero ? "normal" : "semibold"} textAlign="right" w="12">
                      {(probs[i] * 100).toFixed(1)}%
                    </Text>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
