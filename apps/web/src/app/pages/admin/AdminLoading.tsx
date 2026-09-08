import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <Center minH="60vh">
      <VStack gap="3">
        <Spinner size="xl" colorPalette="quantum" borderWidth="3px" />
        <Text fontSize="sm" color="fg.muted">
          {label}
        </Text>
      </VStack>
    </Center>
  );
}
