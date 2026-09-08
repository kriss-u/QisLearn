import { Box, Button, Grid, HStack, IconButton, Input, VStack } from "@chakra-ui/react";
import { LuPlus, LuX } from "react-icons/lu";
import { KatexSpan } from "../../../../components/viz/latexLabels";

export interface MatrixPresetValue {
  id: string;
  label: string;
  matrix: [[number, number], [number, number]];
}

function matrixTex(matrix: MatrixPresetValue["matrix"]): string {
  const fmt = (n: number) => (Number.isFinite(n) ? String(n) : "0");
  return `\\begin{bmatrix} ${fmt(matrix[0][0])} & ${fmt(matrix[0][1])} \\\\ ${fmt(matrix[1][0])} & ${fmt(matrix[1][1])} \\end{bmatrix}`;
}

export function MatrixPresetsEditor({
  value,
  onChange,
}: {
  value: MatrixPresetValue[];
  onChange: (next: MatrixPresetValue[]) => void;
}) {
  function update(i: number, patch: Partial<MatrixPresetValue>) {
    onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  }

  function updateCell(i: number, row: 0 | 1, col: 0 | 1, cellValue: number) {
    const preset = value[i];
    if (!preset) return;
    const matrix: MatrixPresetValue["matrix"] = [
      [preset.matrix[0][0], preset.matrix[0][1]],
      [preset.matrix[1][0], preset.matrix[1][1]],
    ];
    matrix[row][col] = cellValue;
    update(i, { matrix });
  }

  return (
    <VStack align="stretch" gap="3">
      {value.map((preset, i) => (
        <VStack key={i} align="stretch" gap="2" borderWidth="1px" borderColor="border" rounded="l2" p="2">
          <HStack>
            <Input
              variant="flushed"
              size="sm"
              fontFamily="mono"
              placeholder="ID"
              maxW="28"
              value={preset.id}
              onChange={(e) => update(i, { id: e.target.value })}
            />
            <Input
              variant="flushed"
              size="sm"
              fontFamily="mono"
              placeholder="Label"
              value={preset.label}
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <IconButton
              aria-label="Remove preset"
              size="sm"
              variant="ghost"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              <LuX />
            </IconButton>
          </HStack>
          <HStack gap="4" align="center">
            {/* Bracket-shaped grid so the 4 numbers read as a matrix, not a bare 2x2 form. */}
            <HStack gap="0" align="stretch">
              <Box borderLeftWidth="2px" borderTopWidth="2px" borderBottomWidth="2px" borderColor="fg.muted" w="2" />
              <Grid templateColumns="repeat(2, 4.5rem)" gap="1.5" p="1.5">
                {([0, 1] as const).flatMap((row) =>
                  ([0, 1] as const).map((col) => (
                    <Input
                      key={`${row}-${col}`}
                      size="sm"
                      fontFamily="mono"
                      type="number"
                      textAlign="center"
                      value={preset.matrix[row][col]}
                      onChange={(e) => updateCell(i, row, col, Number(e.target.value))}
                    />
                  )),
                )}
              </Grid>
              <Box borderRightWidth="2px" borderTopWidth="2px" borderBottomWidth="2px" borderColor="fg.muted" w="2" />
            </HStack>
            <KatexSpan tex={matrixTex(preset.matrix)} />
          </HStack>
        </VStack>
      ))}
      <Button
        size="xs"
        variant="outline"
        alignSelf="start"
        onClick={() =>
          onChange([
            ...value,
            {
              id: "",
              label: "",
              matrix: [
                [1, 0],
                [0, 1],
              ],
            },
          ])
        }
      >
        <LuPlus /> Add preset
      </Button>
    </VStack>
  );
}
