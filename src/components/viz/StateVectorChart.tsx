import { Box, useToken } from "@chakra-ui/react";
import Plot from "react-plotly.js";
import "katex/dist/katex.min.css";
import { basisLabels } from "../../features/quantum/simulate";
import type { StateVector } from "../../features/quantum/simulate";
import { useVizLatex } from "./latexLabels";

export interface StateVectorChartProps {
  amplitudes: StateVector;
  numQubits: number;
  onGraphDivReady?: (graphDiv: HTMLElement) => void;
}

/**
 * Plotly renders tick labels as SVG <text>, which can't host real KaTeX markup — but KaTeX's own
 * webfonts (registered globally via katex.min.css) are just CSS font-families, so setting the
 * tick font to KaTeX's upright text face gets genuine KaTeX-consistent glyphs for the bra-ket
 * brackets and digits without needing MathJax or a foreignObject hack.
 */
const PLAIN_TICK_FONT = "'Fira Code', ui-monospace, monospace";
const LATEX_TICK_FONT = "KaTeX_Main, 'Cambria Math', serif";

export function StateVectorChart({ amplitudes, numQubits, onGraphDivReady }: StateVectorChartProps) {
  const [fontColor, gridColor] = useToken("colors", ["fg.muted", "border"]);
  const latex = useVizLatex();
  const labels = basisLabels(numQubits).map((b) => `|${b}⟩`);
  const real = amplitudes.map((a) => a.re);
  const imag = amplitudes.map((a) => a.im);

  return (
    <Box borderWidth="1px" borderColor="border" rounded="l3" bg="bg.panel" p="4">
      <Plot
        data={[
          { x: labels, y: real, name: "Re(amplitude)", type: "bar", marker: { color: "#6366f1" } },
          { x: labels, y: imag, name: "Im(amplitude)", type: "bar", marker: { color: "#f59e0b" } },
        ]}
        layout={{
          autosize: true,
          height: 300,
          margin: { t: 20, b: 40, l: 40, r: 10 },
          barmode: "group",
          legend: { orientation: "h", font: { color: fontColor } },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { size: 12, color: fontColor },
          xaxis: {
            gridcolor: gridColor,
            tickfont: { family: latex ? LATEX_TICK_FONT : PLAIN_TICK_FONT, size: latex ? 15 : 12 },
          },
          yaxis: { range: [-1.05, 1.05], zeroline: true, gridcolor: gridColor, zerolinecolor: gridColor },
          hoverlabel: { font: { family: latex ? LATEX_TICK_FONT : PLAIN_TICK_FONT } },
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%" }}
        onInitialized={(_, graphDiv) => onGraphDivReady?.(graphDiv)}
        onUpdate={(_, graphDiv) => onGraphDivReady?.(graphDiv)}
      />
    </Box>
  );
}
