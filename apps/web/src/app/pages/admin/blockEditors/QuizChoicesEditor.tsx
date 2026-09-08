import { Button, HStack, IconButton, Input, Text, VStack } from "@chakra-ui/react";
import { LuPlus, LuX } from "react-icons/lu";
import { MarkdownFieldEditor } from "./MarkdownFieldEditor";

export interface QuizChoiceValue {
  id: string;
  text: string;
  correct: boolean;
}

export function QuizChoicesEditor({
  value,
  onChange,
}: {
  value: QuizChoiceValue[];
  onChange: (next: QuizChoiceValue[]) => void;
}) {
  function update(i: number, patch: Partial<QuizChoiceValue>) {
    onChange(value.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }

  return (
    <VStack align="stretch" gap="3">
      {value.map((choice, i) => (
        <VStack key={i} align="stretch" gap="1.5" borderWidth="1px" borderColor="border" rounded="l2" p="2">
          <HStack>
            <Input
              variant="flushed"
              size="sm"
              fontFamily="mono"
              placeholder="Choice ID"
              maxW="28"
              value={choice.id}
              onChange={(e) => update(i, { id: e.target.value })}
            />
            <HStack gap="1">
              <input
                type="checkbox"
                checked={choice.correct}
                onChange={(e) => update(i, { correct: e.target.checked })}
              />
              <Text fontSize="xs" color="fg.muted">
                Correct
              </Text>
            </HStack>
            <IconButton
              aria-label="Remove choice"
              size="sm"
              variant="ghost"
              ml="auto"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              <LuX />
            </IconButton>
          </HStack>
          <MarkdownFieldEditor value={choice.text} onChange={(text) => update(i, { text })} height={140} />
        </VStack>
      ))}
      <Button
        size="xs"
        variant="outline"
        alignSelf="start"
        onClick={() => onChange([...value, { id: "", text: "", correct: false }])}
      >
        <LuPlus /> Add choice
      </Button>
    </VStack>
  );
}
