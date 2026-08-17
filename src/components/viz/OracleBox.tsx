import { Box, useToken } from "@chakra-ui/react";
import { forwardRef } from "react";
import { SvgKatexLabel, useVizLatex } from "./latexLabels";

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
const MIN_MARGIN = 64;
const LABEL_STUB = 30;
const LABEL_CHAR_WIDTH = 8;
const BOX_WIDTH = 96;
const TOP_MARGIN = 24;
/** Vertical gap between the box's top/bottom edge and its outermost wires, so wires don't touch the corners. */
const BOX_INSET = 16;

/** Wide enough to hold `label` (in either plain-text or roughly-similar-width KaTeX form) plus its wire stub. */
function marginFor(labels: string[]): number {
  const maxChars = Math.max(0, ...labels.map((l) => l.length));
  return Math.max(MIN_MARGIN, LABEL_STUB + 10 + maxChars * LABEL_CHAR_WIDTH);
}

/**
 * Converts a plain oracle-figure label into KaTeX source, so labels like
 * "x0"/"Uf" read as $x_0$/$U_f$ in latex mode without authors having to hand-write
 * LaTeX in lesson MDX. Falls back to the label unchanged when no pattern matches.
 */
function toOracleLatex(label: string): string {
  const withOplus = label.replace(/⊕/g, "\\oplus");
  const trailingDigits = /^([A-Za-z]+?)(\d+)$/.exec(withOplus);
  if (trailingDigits) return `${trailingDigits[1]}_{${trailingDigits[2]}}`;
  const capThenLower = /^([A-Z])([a-z]+)$/.exec(withOplus);
  if (capThenLower) return `${capThenLower[1]}_{${capThenLower[2]}}`;
  return withOplus;
}

/**
 * A static, non-simulated "black box" oracle figure — wires in, one labeled
 * box, wires out. Used for the pedagogical "here's an opaque U_f" beat before
 * a lesson reveals the oracle's real gate-by-gate circuit via <Visualization/>.
 * Deliberately not driven by simulateCircuit: it isn't a real Circuit, just a
 * conceptual diagram, so it stays out of the grading/simulation code paths.
 */
export const OracleBox = forwardRef<SVGSVGElement, OracleBoxProps>(function OracleBox(
  { inputLabels, ancillaInLabel, ancillaOutLabel, boxLabel = "Uf" },
  ref,
) {
  const [wireColor, boxFill, boxStroke, textColor] = useToken("colors", [
    "border",
    "bg.muted",
    "quantum.400",
    "fg",
  ]);
  const latex = useVizLatex();

  const wires = [...inputLabels, ...(ancillaInLabel ? [ancillaInLabel] : [])];
  const numWires = wires.length;
  const outLabels = wires.map((label, i) =>
    ancillaInLabel !== undefined && i === numWires - 1 ? (ancillaOutLabel ?? ancillaInLabel) : label,
  );
  const leftMargin = marginFor(wires);
  const rightMargin = marginFor(outLabels);
  const width = leftMargin + BOX_WIDTH + rightMargin;
  const height = TOP_MARGIN * 2 + ROW_HEIGHT * (numWires - 1);
  const wireY = (i: number) => TOP_MARGIN + i * ROW_HEIGHT;
  const boxX = leftMargin;
  const boxY = wireY(0) - BOX_INSET;
  const boxHeight = wireY(numWires - 1) - wireY(0) + BOX_INSET * 2;

  return (
    <Box overflowX="auto">
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Oracle black box"
      >
        {wires.map((label, i) => {
          const y = wireY(i);
          const outLabel = outLabels[i];
          return (
            <g key={label + i}>
              <line x1={leftMargin - 24} y1={y} x2={boxX} y2={y} stroke={wireColor} strokeWidth={1.5} />
              <line
                x1={boxX + BOX_WIDTH}
                y1={y}
                x2={width - (rightMargin - 24)}
                y2={y}
                stroke={wireColor}
                strokeWidth={1.5}
              />
              {latex ? (
                <SvgKatexLabel
                  x={0}
                  y={y}
                  width={leftMargin - LABEL_STUB}
                  height={20}
                  align="start"
                  tex={toOracleLatex(label)}
                  color={textColor}
                  fontSizePx={13}
                />
              ) : (
                <text
                  x={leftMargin - LABEL_STUB}
                  y={y + 5}
                  fontSize={13}
                  fill={textColor}
                  fontFamily={MONO_FONT}
                  fontWeight={600}
                  textAnchor="end"
                >
                  {label}
                </text>
              )}
              {latex ? (
                <SvgKatexLabel
                  x={width - (rightMargin - LABEL_STUB)}
                  y={y}
                  width={rightMargin - LABEL_STUB}
                  height={20}
                  align="start"
                  tex={toOracleLatex(outLabel)}
                  color={textColor}
                  fontSizePx={13}
                />
              ) : (
                <text
                  x={width - (rightMargin - LABEL_STUB)}
                  y={y + 5}
                  fontSize={13}
                  fill={textColor}
                  fontFamily={MONO_FONT}
                  fontWeight={600}
                  textAnchor="start"
                >
                  {outLabel}
                </text>
              )}
            </g>
          );
        })}

        <rect x={boxX} y={boxY} width={BOX_WIDTH} height={boxHeight} rx={10} fill={boxFill} stroke={boxStroke} strokeWidth={2} />
        {latex ? (
          <SvgKatexLabel
            x={boxX}
            y={boxY + boxHeight / 2}
            width={BOX_WIDTH}
            height={24}
            align="center"
            tex={toOracleLatex(boxLabel)}
            color={textColor}
            fontSizePx={18}
          />
        ) : (
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
        )}
      </svg>
    </Box>
  );
});
