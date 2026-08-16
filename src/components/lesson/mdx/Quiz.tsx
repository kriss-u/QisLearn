import { Alert, Box, Button, HStack, RadioCard, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuCircleHelp } from "react-icons/lu";
import type { QuizChoice } from "../../../content/schema";
import { deleteQuizAnswer, getQuizAnswer, saveQuizAnswer } from "../../../db/repository";
import { useLessonId } from "../LessonContext";
import { useLessonProgress } from "../LessonProgressContext";
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
  const { registerExercise, reportResult } = useLessonProgress();
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => registerExercise(quizId), [quizId, registerExercise]);

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

  useEffect(() => {
    reportResult(quizId, checked && !!choice?.correct);
  }, [quizId, checked, choice?.correct, reportResult]);

  function handleSelect(value: string) {
    setSelected(value);
    saveQuizAnswer(lessonId, quizId, value, false);
  }

  function handleSubmit() {
    if (!selected) return;
    setChecked(true);
    saveQuizAnswer(lessonId, quizId, selected, true);
  }

  function handleReset() {
    setSelected(null);
    setChecked(false);
    deleteQuizAnswer(lessonId, quizId);
  }

  return (
    <MdxCard eyebrow="Check your understanding" icon={<LuCircleHelp />}>
      <Box fontWeight="medium" fontSize="lg">
        <Markdown inline>{question}</Markdown>
      </Box>

      <RadioCard.Root
        name={quizId}
        value={selected}
        disabled={checked}
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

      <HStack>
        <Button colorPalette="quantum" disabled={!selected || checked} onClick={handleSubmit}>
          Submit answer
        </Button>
        {checked && (
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        )}
      </HStack>

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
