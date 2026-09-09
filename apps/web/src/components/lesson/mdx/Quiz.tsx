import { Alert, Box, Button, HStack, RadioCard, VStack } from "@chakra-ui/react";
import { useDeleteQuizAttemptMutation, useMyQuizAttemptQuery, useSaveQuizAttemptMutation } from "@qislearn/graphql-schema";
import { useEffect, useState } from "react";
import { LuCircleHelp } from "react-icons/lu";
import type { QuizChoice } from "../../../content/schema";
import { useSession } from "../../../lib/authClient";
import { useIsLessonPreview, useLessonId } from "../LessonContext";
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
  const isPreview = useIsLessonPreview();
  const { registerExercise, reportResult } = useLessonProgress();
  const { data: session } = useSession();
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const { data: attemptData, loading: attemptLoading } = useMyQuizAttemptQuery({
    variables: { lessonSlug: lessonId, quizId },
    skip: !session || isPreview,
    fetchPolicy: "network-only",
  });
  const [saveQuizAttempt] = useSaveQuizAttemptMutation();
  const [deleteQuizAttempt] = useDeleteQuizAttemptMutation();

  useEffect(() => registerExercise(quizId), [quizId, registerExercise]);

  useEffect(() => {
    if (!session || attemptLoading) return;
    const attempt = attemptData?.myQuizAttempt;
    if (attempt) {
      setSelected(attempt.selectedChoiceId);
      setChecked(attempt.submitted);
    }
    // One-time "load the initial value" effect — see CodeExercise.tsx for
    // the same pattern and why `attemptData` is deliberately not a dep.
  }, [attemptLoading, session]);

  const choice = choices.find((c) => c.id === selected);

  useEffect(() => {
    reportResult(quizId, checked && !!choice?.correct);
  }, [quizId, checked, choice?.correct, reportResult]);

  function handleSelect(value: string) {
    setSelected(value);
    if (!session || isPreview) return;
    saveQuizAttempt({ variables: { lessonSlug: lessonId, quizId, selectedChoiceId: value, submitted: false } });
  }

  function handleSubmit() {
    if (!selected) return;
    setChecked(true);
    if (!session || isPreview) return;
    saveQuizAttempt({ variables: { lessonSlug: lessonId, quizId, selectedChoiceId: selected, submitted: true } });
  }

  function handleReset() {
    setSelected(null);
    setChecked(false);
    if (!session || isPreview) return;
    deleteQuizAttempt({ variables: { lessonSlug: lessonId, quizId } });
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
        <VStack className="quiz-choices" align="stretch" gap="2.5">
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

      <HStack className="no-print">
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
        <Alert.Root className="no-print" status={choice.correct ? "success" : "error"} rounded="l2">
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
