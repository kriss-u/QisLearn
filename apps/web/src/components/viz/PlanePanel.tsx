import { Box, useToken } from "@chakra-ui/react";
import type { HTMLAttributes, ReactNode } from "react";
import { resolveCssVar } from "../../features/export/resolveCssVar";
import { renderKatex, useVizLatex } from "./latexLabels";

const MONO_FONT = "'Fira Code', ui-monospace, monospace";

export interface PlaneGeometry {
  size: number;
  toX: (x: number) => number;
  toY: (y: number) => number;
}

export function usePlaneGeometry(size: number, range: number): PlaneGeometry {
  const half = size / 2;
  return {
    size,
    toX: (x: number) => half + (x / range) * half,
    toY: (y: number) => half - (y / range) * half,
  };
}

/** Renders a short axis/vector label as KaTeX (via foreignObject) or plain SVG text, matching the plain/LaTeX toggle every other diagram in this app uses. */
export function PlaneLabel({
  x,
  y,
  align,
  color,
  fontSizePx = 12,
  latex,
  tex,
  plain,
}: {
  x: number;
  y: number;
  align: "start" | "middle" | "end";
  color: string;
  fontSizePx?: number;
  latex: boolean;
  tex: string;
  plain: string;
}) {
  if (!latex) {
    return (
      <text x={x} y={y} textAnchor={align} fontFamily={MONO_FONT} fontSize={fontSizePx} fill={color}>
        {plain}
      </text>
    );
  }
  const width = 64;
  const height = fontSizePx + 8;
  const boxX = align === "end" ? x - width : align === "middle" ? x - width / 2 : x;
  const justify = align === "end" ? "flex-end" : align === "middle" ? "center" : "flex-start";
  const xhtmlProps = { xmlns: "http://www.w3.org/1999/xhtml" } as HTMLAttributes<HTMLDivElement>;
  return (
    <foreignObject x={boxX} y={y - height / 2} width={width} height={height} style={{ overflow: "visible" }}>
      <div
        {...xhtmlProps}
        style={{
          display: "flex",
          justifyContent: justify,
          alignItems: "center",
          height: "100%",
          color,
          fontSize: fontSizePx,
          lineHeight: 1,
        }}
        dangerouslySetInnerHTML={{ __html: renderKatex(tex) }}
      />
    </foreignObject>
  );
}

export interface PlanePanelProps {
  geometry: PlaneGeometry;
  unitCircle?: boolean;
  xLabel?: { tex: string; plain: string };
  yLabel?: { tex: string; plain: string };
  maxW?: number | string;
  children?: ReactNode;
}

export function PlanePanel({ geometry, unitCircle = true, xLabel, yLabel, maxW = "220px", children }: PlanePanelProps) {
  const latex = useVizLatex();
  const { size, toX } = geometry;
  const [axisColor, mutedColor, panelBg] = useToken("colors", ["border", "fg.muted", "bg.panel"]).map(
    resolveCssVar,
  );
  const origin = toX(0);
  const unitR = toX(1) - toX(0);

  return (
    <Box borderWidth="1px" borderColor="border" rounded="l3" bg="bg.panel" overflow="hidden" maxW={maxW} mx="auto" w="full">
      <svg width="100%" viewBox={`0 0 ${size} ${size}`} role="img">
        <rect x={0} y={0} width={size} height={size} fill={panelBg} />
        {unitCircle && (
          <circle cx={origin} cy={origin} r={unitR} fill="none" stroke={axisColor} strokeDasharray="4 4" />
        )}
        <line x1={0} y1={origin} x2={size} y2={origin} stroke={axisColor} strokeWidth={1} />
        <line x1={origin} y1={0} x2={origin} y2={size} stroke={axisColor} strokeWidth={1} />
        {xLabel && (
          <PlaneLabel
            x={size - 6}
            y={origin - 8}
            align="end"
            color={mutedColor}
            latex={latex}
            tex={xLabel.tex}
            plain={xLabel.plain}
          />
        )}
        {yLabel && (
          <PlaneLabel
            x={origin + 8}
            y={14}
            align="start"
            color={mutedColor}
            latex={latex}
            tex={yLabel.tex}
            plain={yLabel.plain}
          />
        )}
        {children}
      </svg>
    </Box>
  );
}

export function PlaneArrow({
  geometry,
  x,
  y,
  color,
  label,
  dashed = false,
}: {
  geometry: PlaneGeometry;
  x: number;
  y: number;
  color: string;
  label?: { tex: string; plain: string };
  dashed?: boolean;
}) {
  const latex = useVizLatex();
  const { toX, toY } = geometry;
  const x1 = toX(0);
  const y1 = toY(0);
  const x2 = toX(x);
  const y2 = toY(y);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const perpX = -uy;
  const perpY = ux;

  const headLen = 15;
  const headWidth = 6.5;
  const backX = x2 - headLen * ux;
  const backY = y2 - headLen * uy;
  const notchX = backX + 4 * ux;
  const notchY = backY + 4 * uy;
  const rightX = backX + headWidth * perpX;
  const rightY = backY + headWidth * perpY;
  const leftX = backX - headWidth * perpX;
  const leftY = backY - headWidth * perpY;
  const shaftEndX = backX + 2 * ux;
  const shaftEndY = backY + 2 * uy;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={len > headLen ? shaftEndX : x1}
        y2={len > headLen ? shaftEndY : y1}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={dashed ? "5 4" : undefined}
      />
      <polygon points={`${x2},${y2} ${rightX},${rightY} ${notchX},${notchY} ${leftX},${leftY}`} fill={color} />
      {label && (
        <PlaneLabel
          x={x2 + (x2 >= x1 ? 8 : -8)}
          y={y2 + (y2 >= y1 ? 16 : -8)}
          align={x2 >= x1 ? "start" : "end"}
          color={color}
          fontSizePx={13}
          latex={latex}
          tex={label.tex}
          plain={label.plain}
        />
      )}
    </g>
  );
}

export function PlanePoint({
  geometry,
  x,
  y,
  color,
  r = 4,
}: {
  geometry: PlaneGeometry;
  x: number;
  y: number;
  color: string;
  r?: number;
}) {
  const { toX, toY } = geometry;
  return <circle cx={toX(x)} cy={toY(y)} r={r} fill={color} />;
}
