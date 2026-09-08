import { Alert, Dialog, IconButton, Portal } from "@chakra-ui/react";
import { Component, type ReactNode } from "react";
import { LuX } from "react-icons/lu";
import { ContentBlockList } from "../../../components/lesson/ContentBlockList";
import { LessonProvider } from "../../../components/lesson/LessonContext";
import { LessonLayout } from "../../../components/lesson/LessonLayout";
import { LessonProgressProvider } from "../../../components/lesson/LessonProgressContext";
import type { ContentBlockData } from "../../../content";
import type { LessonFrontmatter } from "../../../content/schema";

class PreviewErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Description>
            Can't render this preview yet ({this.state.error.message}) — one of the blocks below is still missing a
            required field.
          </Alert.Description>
        </Alert.Root>
      );
    }
    return this.props.children;
  }
}

export function LessonPreviewDialog({
  open,
  onOpenChange,
  frontmatter,
  blocks,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frontmatter: LessonFrontmatter;
  blocks: ContentBlockData[];
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(d) => onOpenChange(d.open)} size="full" placement="top">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content overflowY="auto" bg="bg">
            <Dialog.CloseTrigger asChild position="fixed" top="4" right="4" zIndex="2">
              <IconButton aria-label="Close preview" variant="solid" colorPalette="gray" rounded="full">
                <LuX />
              </IconButton>
            </Dialog.CloseTrigger>
            <Dialog.Body py={{ base: "6", md: "10" }}>
              {/* Same components the real /lesson/:slug route renders through
                  (LessonLayout, ContentBlockList) fed by the admin's current
                  unsaved edits instead of a fetch, so this always matches
                  what learners will see once saved — no separate preview
                  template to keep in sync. A distinct fake lessonId keeps
                  any CodeExercise/Quiz interaction here from writing into
                  the admin's own real progress on this lesson. */}
              <PreviewErrorBoundary key={JSON.stringify({ frontmatter, blocks })}>
                <LessonProvider value={{ lessonId: `preview-${frontmatter.id}` }}>
                  <LessonProgressProvider lessonId={`preview-${frontmatter.id}`}>
                    <LessonLayout lesson={frontmatter}>
                      <ContentBlockList blocks={blocks} />
                    </LessonLayout>
                  </LessonProgressProvider>
                </LessonProvider>
              </PreviewErrorBoundary>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
