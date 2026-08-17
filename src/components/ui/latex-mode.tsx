import { IconButton, type IconButtonProps } from "@chakra-ui/react";
import { forwardRef } from "react";
import { LuSigma } from "react-icons/lu";
import { useSettingsStore } from "../../store/settingsStore";
import { Tooltip } from "./tooltip";

export const LatexModeButton = forwardRef<HTMLButtonElement, Omit<IconButtonProps, "aria-label">>(
  function LatexModeButton(props, ref) {
    const latexRendering = useSettingsStore((s) => s.latexRendering);
    const toggleLatexRendering = useSettingsStore((s) => s.toggleLatexRendering);
    const label = latexRendering ? "Disable LaTeX-style labels" : "Enable LaTeX-style labels";

    return (
      <Tooltip content={label}>
        <IconButton
          onClick={toggleLatexRendering}
          variant={latexRendering ? "subtle" : "ghost"}
          aria-label={label}
          size="sm"
          ref={ref}
          {...props}
        >
          <LuSigma />
        </IconButton>
      </Tooltip>
    );
  },
);
