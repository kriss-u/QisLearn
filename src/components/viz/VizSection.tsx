import { Box, HStack, Text } from "@chakra-ui/react";
import type { PropsWithChildren, ReactNode } from "react";

export function VizSection({
  title,
  action,
  children,
}: PropsWithChildren<{ title: string; action?: ReactNode }>) {
  return (
    <Box>
      <HStack justify="space-between" mb="3">
        <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="fg.muted">
          {title}
        </Text>
        {action}
      </HStack>
      {children}
    </Box>
  );
}
