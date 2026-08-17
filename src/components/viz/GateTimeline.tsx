import { HStack, IconButton, Slider, Text } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from "react-icons/lu";
import { getGateLatex } from "./gateLatexLabels";
import { KatexSpan, useVizLatex } from "./latexLabels";

export interface GateTimelineStep {
  gateName: string | null;
}

export interface GateTimelineProps {
  index: number;
  labels: GateTimelineStep[];
  onChange: (index: number) => void;
}

export function GateTimeline({ index, labels, onChange }: GateTimelineProps) {
  const latex = useVizLatex();
  const max = labels.length - 1;
  const marks = labels.map((step, i) => ({ value: i, step }));

  return (
    <HStack gap="3" align="center">
      <IconButton
        aria-label="First step"
        variant="ghost"
        size="sm"
        disabled={index === 0}
        onClick={() => onChange(0)}
      >
        <LuChevronsLeft />
      </IconButton>
      <IconButton
        aria-label="Previous step"
        variant="ghost"
        size="sm"
        disabled={index === 0}
        onClick={() => onChange(Math.max(0, index - 1))}
      >
        <LuChevronLeft />
      </IconButton>

      <Slider.Root
        flex="1"
        min={0}
        max={max}
        step={1}
        value={[index]}
        onValueChange={(details) => onChange(details.value[0])}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0}>
            <Slider.HiddenInput />
          </Slider.Thumb>
        </Slider.Control>
        <Slider.MarkerGroup>
          {marks.map((mark) => {
            const { gateName } = mark.step;
            const plainLabel = gateName == null ? "Start" : gateName.toUpperCase();
            return (
              <Slider.Marker key={mark.value} value={mark.value}>
                <Slider.MarkerIndicator />
                <Slider.MarkerLabel fontSize="2xs" color="fg.muted" fontFamily="mono" mt="1.5" whiteSpace="nowrap">
                  {latex && gateName != null ? <KatexSpan tex={getGateLatex(gateName, plainLabel)} /> : plainLabel}
                </Slider.MarkerLabel>
              </Slider.Marker>
            );
          })}
        </Slider.MarkerGroup>
      </Slider.Root>

      <IconButton
        aria-label="Next step"
        variant="ghost"
        size="sm"
        disabled={index === max}
        onClick={() => onChange(Math.min(max, index + 1))}
      >
        <LuChevronRight />
      </IconButton>
      <IconButton
        aria-label="Last step"
        variant="ghost"
        size="sm"
        disabled={index === max}
        onClick={() => onChange(max)}
      >
        <LuChevronsRight />
      </IconButton>

      <Text fontSize="xs" color="fg.muted" fontFamily="mono" flexShrink={0} minW="16" textAlign="right">
        {index + 1} / {labels.length}
      </Text>
    </HStack>
  );
}
