"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { type PropsWithChildren } from "react";
import { system } from "../../theme/system";
import { ColorModeProvider } from "./color-mode";

export function Provider({ children }: PropsWithChildren) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider defaultTheme="dark">{children}</ColorModeProvider>
    </ChakraProvider>
  );
}
