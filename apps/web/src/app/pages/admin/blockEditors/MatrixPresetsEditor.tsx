import { Button, Grid, HStack, IconButton, Input, VStack } from "@chakra-ui/react";
import { LuPlus, LuX } from "react-icons/lu";

export interface MatrixPresetValue {
  id: string;
  label: string;
  matrix: [[number, number], [number, number]];
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
              size="sm"
              fontFamily="mono"
              placeholder="ID"
              maxW="28"
              value={preset.id}
              onChange={(e) => update(i, { id: e.target.value })}
            />
            <Input
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
          <Grid templateColumns="repeat(2, 5rem)" gap="2">
            {([0, 1] as const).flatMap((row) =>
              ([0, 1] as const).map((col) => (
                <Input
                  key={`${row}-${col}`}
                  size="sm"
                  fontFamily="mono"
                  type="number"
                  value={preset.matrix[row][col]}
                  onChange={(e) => updateCell(i, row, col, Number(e.target.value))}
                />
              )),
            )}
          </Grid>
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
