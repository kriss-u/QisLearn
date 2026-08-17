import { Text } from "@chakra-ui/react";
import { LuBox } from "react-icons/lu";
import { OracleBox, type OracleBoxProps } from "../../viz/OracleBox";
import { VizSection } from "../../viz/VizSection";
import { Markdown } from "../Markdown";
import { MdxCard } from "./MdxCard";

export interface OracleFigureProps extends OracleBoxProps {
  title: string;
  description?: string;
}

/**
 * MDX-facing wrapper around OracleBox, following the same
 * `<MdxCard eyebrow icon>` + `<VizSection>` shell every other lesson tag
 * (CodeExercise/Quiz/Visualization/Measurement) uses.
 */
export function OracleFigure({ title, description, ...boxProps }: OracleFigureProps) {
  return (
    <MdxCard eyebrow={title} icon={<LuBox />}>
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}
      <VizSection title="Black Box">
        <OracleBox {...boxProps} />
      </VizSection>
    </MdxCard>
  );
}
