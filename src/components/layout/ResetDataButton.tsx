import { Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { useProgressStore } from "../../store/progressStore";

export function ResetDataButton() {
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const resetProgress = useProgressStore((s) => s.resetProgress);

  async function handleReset() {
    setResetting(true);
    await resetProgress();
    window.location.href = "/";
  }

  return (
    <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)} placement="center" role="alertdialog">
      <Dialog.Trigger asChild>
        <Button variant="outline" colorPalette="red" size="sm" w="full">
          <LuTrash2 /> Reset all data
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content rounded="l3">
            <Dialog.Header>
              <Dialog.Title>Reset all data?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text color="fg.muted">
                This permanently deletes everything stored in this browser: lesson progress, completion
                status, and any code you've written in exercises. Lesson content itself isn't affected.
                This can't be undone.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="ghost">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button colorPalette="red" onClick={handleReset} loading={resetting}>
                Reset everything
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
