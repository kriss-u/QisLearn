import { HStack, Text } from "@chakra-ui/react";
import { useRef } from "react";
import { LuBox } from "react-icons/lu";
import { copyPngToClipboard, downloadBlob } from "../../../features/export/clipboard";
import { svgElementToPngBlob } from "../../../features/export/pngExport";
import { OracleBox, type OracleBoxProps } from "../../viz/OracleBox";
import { VizActions } from "../../viz/VizActions";
import { VizLatexToggle } from "../../viz/latexLabels";
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
  const svgRef = useRef<SVGSVGElement>(null);

  async function handleCopy() {
    if (!svgRef.current) return;
    await copyPngToClipboard(svgElementToPngBlob(svgRef.current));
  }
  async function handleDownload() {
    if (!svgRef.current) return;
    downloadBlob(await svgElementToPngBlob(svgRef.current), "oracle.png");
  }

  return (
    <MdxCard eyebrow={title} icon={<LuBox />}>
      {description && (
        <Text color="fg.muted" fontSize="md" mt="-2">
          <Markdown inline>{description}</Markdown>
        </Text>
      )}
      <VizLatexToggle>
        {(latexAction) => (
          <VizSection
            title="Black Box"
            action={
              <HStack gap="1">
                {latexAction}
                <VizActions onCopy={handleCopy} onDownload={handleDownload} />
              </HStack>
            }
          >
            <OracleBox ref={svgRef} {...boxProps} />
          </VizSection>
        )}
      </VizLatexToggle>
    </MdxCard>
  );
}
