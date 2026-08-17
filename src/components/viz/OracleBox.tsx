import { Box, useToken } from "@chakra-ui/react";

export interface OracleBoxProps {
  /** Labels for the input (query) wires, drawn passing straight through the box unchanged. */
  inputLabels: string[];
  /** Label for the ancilla wire going in, e.g. "y" — omit for a plain "outputs unchanged" oracle. */
  ancillaInLabel?: string;
  /** Label for the ancilla wire coming out, e.g. "y ⊕ f(x)". Defaults to ancillaInLabel if omitted. */
  ancillaOutLabel?: string;
  /** Box label, e.g. "U_f". */
  boxLabel?: string;
}

const MONO_FONT = "'Fira Code', ui-monospace, monospace";
const ROW_HEIGHT = 48;
const LEFT_MARGIN = 64;
const RIGHT_MARGIN = 64;
const BOX_WIDTH = 96;
const TOP_MARGIN = 24;

/**
 * A static, non-simulated "black box" oracle figure — wires in, one labeled
 * box, wires out. Used for the pedagogical "here's an opaque U_f" beat before
 * a lesson reveals the oracle's real gate-by-gate circuit via <Visualization/>.
 * Deliberately not driven by simulateCircuit: it isn't a real Circuit, just a
 * conceptual diagram, so it stays out of the grading/simulation code paths.
 */
export function OracleBox({ inputLabels, ancillaInLabel, ancillaOutLabel, boxLabel = "Uf" }: OracleBoxProps) {
  const [wireColor, boxFill, boxStroke, textColor] = useToken("colors", [
    "border",
    "bg.muted",
    "quantum.400",
    "fg",
  ]);

  const wires = [...inputLabels, ...(ancillaInLabel ? [ancillaInLabel] : [])];
  const numWires = wires.length;
  const width = LEFT_MARGIN + BOX_WIDTH + RIGHT_MARGIN;
  const height = TOP_MARGIN * 2 + ROW_HEIGHT * (numWires - 1);
  const boxTop = TOP_MARGIN - ROW_HEIGHT / 2 + (inputLabels.length > 0 ? ROW_HEIGHT / 2 : 0);
  const boxBottom =
    TOP_MARGIN + ROW_HEIGHT * (numWires - 1) + ROW_HEIGHT / 2 - (inputLabels.length > 0 ? ROW_HEIGHT / 2 : 0);
  const wireY = (i: number) => TOP_MARGIN + i * ROW_HEIGHT;
  const boxX = LEFT_MARGIN;
  const boxY = boxTop;
  const boxHeight = Math.max(boxBottom - boxTop, ROW_HEIGHT);

  return (
    <Box overflowX="auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Oracle black box">
        {wires.map((label, i) => {
          const y = wireY(i);
          const isAncilla = ancillaInLabel !== undefined && i === numWires - 1;
          const outLabel = isAncilla ? (ancillaOutLabel ?? ancillaInLabel) : label;
          return (
            <g key={label + i}>
              <line x1={LEFT_MARGIN - 24} y1={y} x2={boxX} y2={y} stroke={wireColor} strokeWidth={1.5} />
              <line
                x1={boxX + BOX_WIDTH}
                y1={y}
                x2={width - (RIGHT_MARGIN - 24)}
                y2={y}
                stroke={wireColor}
                strokeWidth={1.5}
              />
              <text
                x={LEFT_MARGIN - 30}
                y={y + 5}
                fontSize={13}
                fill={textColor}
                fontFamily={MONO_FONT}
                fontWeight={600}
                textAnchor="end"
              >
                {label}
              </text>
              <text
                x={width - (RIGHT_MARGIN - 30)}
                y={y + 5}
                fontSize={13}
                fill={textColor}
                fontFamily={MONO_FONT}
                fontWeight={600}
                textAnchor="start"
              >
                {outLabel}
              </text>
            </g>
          );
        })}

        <rect x={boxX} y={boxY} width={BOX_WIDTH} height={boxHeight} rx={10} fill={boxFill} stroke={boxStroke} strokeWidth={2} />
        <text
          x={boxX + BOX_WIDTH / 2}
          y={boxY + boxHeight / 2 + 6}
          fontSize={18}
          fill={textColor}
          fontFamily={MONO_FONT}
          fontWeight={700}
          textAnchor="middle"
        >
          {boxLabel}
        </text>
      </svg>
    </Box>
  );
}
