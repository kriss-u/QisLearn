import { Button, HStack, IconButton, Input, VStack } from "@chakra-ui/react";
import { LuPlus, LuX } from "react-icons/lu";

export function StringArrayEditor({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  return (
    <VStack align="stretch" gap="1.5">
      {value.map((item, i) => (
        <HStack key={i}>
          <Input
            size="sm"
            fontFamily="mono"
            value={item}
            onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
          />
          <IconButton
            aria-label="Remove"
            size="sm"
            variant="ghost"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <LuX />
          </IconButton>
        </HStack>
      ))}
      <Button size="xs" variant="outline" alignSelf="start" onClick={() => onChange([...value, ""])}>
        <LuPlus /> Add
      </Button>
    </VStack>
  );
}

export function NumberArrayEditor({ value, onChange }: { value: number[]; onChange: (next: number[]) => void }) {
  return (
    <VStack align="stretch" gap="1.5">
      {value.map((item, i) => (
        <HStack key={i}>
          <Input
            size="sm"
            type="number"
            fontFamily="mono"
            value={item}
            onChange={(e) => onChange(value.map((v, j) => (j === i ? Number(e.target.value) : v)))}
          />
          <IconButton
            aria-label="Remove"
            size="sm"
            variant="ghost"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <LuX />
          </IconButton>
        </HStack>
      ))}
      <Button size="xs" variant="outline" alignSelf="start" onClick={() => onChange([...value, 0])}>
        <LuPlus /> Add
      </Button>
    </VStack>
  );
}
