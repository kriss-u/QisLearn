import { Badge, Box, HStack, VStack } from "@chakra-ui/react";
import type { PropsWithChildren, ReactNode } from "react";
import { InlineMath } from "../InlineMath";

export function MdxCard({
  eyebrow,
  icon,
  children,
}: PropsWithChildren<{ eyebrow: string; icon?: ReactNode }>) {
  return (
    <Box borderWidth="1px" borderColor="border" rounded="l3" bg="bg.panel" p={{ base: "5", md: "6" }} my="8">
      <VStack align="stretch" gap="4">
        <Badge colorPalette="quantum" variant="subtle" alignSelf="flex-start" size="sm">
          <HStack gap="1.5">
            {icon}
            <InlineMath>{eyebrow}</InlineMath>
          </HStack>
        </Badge>
        {children}
      </VStack>
    </Box>
  );
}
