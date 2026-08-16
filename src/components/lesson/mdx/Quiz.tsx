import { Alert, Box, Button, RadioCard, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuCircleHelp } from "react-icons/lu";
import type { QuizChoice } from "../../../content/schema";
import { getQuizAnswer, saveQuizAnswer } from "../../../db/repository";
import { useLessonId } from "../LessonContext";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";

export interface QuizProps {
  id: string;
  question: string;
  choices: QuizChoice[];
  explanation?: string;
}

export function Quiz({ id: quizId, question, choices, explanation }: QuizProps) {
  const lessonId = useLessonId();
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getQuizAnswer(lessonId, quizId).then((answer) => {
      if (cancelled || !answer) return;
      setSelected(answer.selectedChoiceId);
      setChecked(answer.checked);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId, quizId]);

  const choice = choices.find((c) => c.id === selected);

  function handleSelect(value: string) {
    setSelected(value);
    setChecked(false);
    saveQuizAnswer(lessonId, quizId, value, false);
  }

  function handleSubmit() {
    if (!selected) return;
    setChecked(true);
    saveQuizAnswer(lessonId, quizId, selected, true);
  }

  return (
    <MdxCard eyebrow="Check your understanding" icon={<LuCircleHelp />}>
      <Box fontWeight="medium" fontSize="lg">
        <Markdown inline>{question}</Markdown>
      </Box>

      <RadioCard.Root
        name={quizId}
        value={selected}
        onValueChange={(details) => {
          if (details.value) handleSelect(details.value);
        }}
      >
        <VStack align="stretch" gap="2.5">
          {choices.map((option) => (
            <RadioCard.Item key={option.id} value={option.id}>
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemText>
                  <Markdown inline>{option.text}</Markdown>
                </RadioCard.ItemText>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          ))}
        </VStack>
      </RadioCard.Root>

      <Button alignSelf="flex-start" colorPalette="quantum" disabled={!selected} onClick={handleSubmit}>
        Submit answer
      </Button>

      {checked && choice && (
        <Alert.Root status={choice.correct ? "success" : "error"} rounded="l2">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{choice.correct ? "Correct!" : "Not quite."}</Alert.Title>
            {explanation && (
              <Alert.Description>
                <Markdown inline>{explanation}</Markdown>
              </Alert.Description>
            )}
          </Alert.Content>
        </Alert.Root>
      )}
    </MdxCard>
  );
}
