import {
  Alert,
  Box,
  Button,
  CloseButton,
  Drawer,
  HStack,
  IconButton,
  Input,
  Portal,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { LuMessageCircleQuestion, LuSend } from "react-icons/lu";
import { useSuggestLessonQuestionsMutation } from "@qislearn/graphql-schema";
import { API_ORIGIN, useSession } from "../../lib/authClient";
import { useLessonId } from "./LessonContext";
import { Markdown } from "./Markdown";

// Real freeform chat, not just clickable suggestions — the safety guard
// against off-topic/random questions lives server-side in the model's
// system prompt (apps/api/src/lesson-chat.ts): it's told to politely
// decline and suggest on-topic alternatives instead of answering anything
// unrelated to this course. Suggestions here are just starter prompts, the
// same idea as the sample-prompt chips on an LLM chat box, generated fresh
// each time the panel opens via `suggestLessonQuestions`.
export function AskPanel() {
  const lessonId = useLessonId();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [suggestQuestions, { loading: suggesting }] = useSuggestLessonQuestionsMutation();
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_ORIGIN}/api/lesson-chat`,
        credentials: "include",
        body: { lessonSlug: lessonId },
      }),
    [lessonId],
  );
  const { messages, sendMessage, status, error } = useChat({ id: lessonId, transport });

  function handleOpen() {
    setOpen(true);
    if (suggestions || !session) return;
    setSuggestError(null);
    suggestQuestions({ variables: { lessonSlug: lessonId } })
      .then(({ data }) => setSuggestions(data?.suggestLessonQuestions ?? []))
      .catch((err: unknown) => setSuggestError(err instanceof Error ? err.message : "Couldn't load suggestions."));
  }

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || status === "streaming" || status === "submitted") return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  const busy = status === "streaming" || status === "submitted";

  return (
    <>
      <Button className="no-print" size="sm" variant="outline" onClick={handleOpen}>
        <LuMessageCircleQuestion /> Ask
      </Button>

      <Drawer.Root open={open} onOpenChange={(d) => setOpen(d.open)} placement="end" size="md">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Ask about this lesson</Drawer.Title>
              </Drawer.Header>

              <Drawer.Body display="flex" flexDirection="column" gap="4" minH="0">
                {!session ? (
                  <Text color="fg.muted">Log in to ask questions about this lesson.</Text>
                ) : (
                  <>
                    <VStack flex="1" minH="0" overflowY="auto" align="stretch" gap="3">
                      {messages.map((m) => (
                        <Box key={m.id} alignSelf={m.role === "user" ? "flex-end" : "flex-start"} maxW="85%">
                          <Box
                            bg={m.role === "user" ? "colorPalette.solid" : "bg.muted"}
                            color={m.role === "user" ? "colorPalette.contrast" : "fg"}
                            colorPalette={m.role === "user" ? "quantum" : undefined}
                            px="3"
                            py="2"
                            rounded="l2"
                            fontSize="sm"
                          >
                            {m.parts.map((part, i) =>
                              part.type === "text" ? <Markdown key={i} inline>{part.text}</Markdown> : null,
                            )}
                          </Box>
                        </Box>
                      ))}
                      {status === "submitted" && (
                        <HStack color="fg.muted" fontSize="sm">
                          <Spinner size="xs" />
                          <Text>Thinking…</Text>
                        </HStack>
                      )}
                      {error && (
                        <Alert.Root status="error" size="sm">
                          <Alert.Indicator />
                          <Alert.Description>{error.message}</Alert.Description>
                        </Alert.Root>
                      )}
                    </VStack>

                    {messages.length === 0 && (
                      <VStack align="stretch" gap="1.5">
                        <Text fontSize="xs" color="fg.muted">
                          Try asking:
                        </Text>
                        {suggesting && (
                          <HStack color="fg.muted" fontSize="sm">
                            <Spinner size="xs" />
                            <Text>Coming up with questions…</Text>
                          </HStack>
                        )}
                        {suggestError && (
                          <Alert.Root status="error" size="sm">
                            <Alert.Indicator />
                            <Alert.Description>{suggestError}</Alert.Description>
                          </Alert.Root>
                        )}
                        {(suggestions ?? []).map((question) => (
                          <Button
                            key={question}
                            size="sm"
                            variant="outline"
                            justifyContent="flex-start"
                            onClick={() => handleSend(question)}
                          >
                            {question}
                          </Button>
                        ))}
                      </VStack>
                    )}
                  </>
                )}
              </Drawer.Body>

              <Drawer.Footer>
                <HStack w="full">
                  <Input
                    placeholder="Ask a question…"
                    value={input}
                    disabled={!session}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend(input);
                    }}
                  />
                  <IconButton
                    aria-label="Send question"
                    colorPalette="quantum"
                    disabled={!session || busy || !input.trim()}
                    onClick={() => handleSend(input)}
                  >
                    <LuSend />
                  </IconButton>
                </HStack>
              </Drawer.Footer>

              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
}
