import { Box, useToken } from "@chakra-ui/react";
import Plot from "react-plotly.js";
import { basisLabels } from "../../features/quantum/simulate";
import type { StateVector } from "../../features/quantum/simulate";

export interface StateVectorChartProps {
  amplitudes: StateVector;
  numQubits: number;
}

export function StateVectorChart({ amplitudes, numQubits }: StateVectorChartProps) {
  const [fontColor, gridColor] = useToken("colors", ["fg.muted", "border"]);
  const labels = basisLabels(numQubits);
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
          xaxis: { gridcolor: gridColor, tickfont: { family: "monospace" } },
          yaxis: { range: [-1.05, 1.05], zeroline: true, gridcolor: gridColor, zerolinecolor: gridColor },
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%" }}
      />
    </Box>
  );
}
