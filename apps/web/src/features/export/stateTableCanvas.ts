import { formatComponent } from "../../components/viz/StateTable";
import { basisLabels, probabilities, type StateVector } from "../quantum/simulate";
import { roundRect } from "./canvasShapes";

const ZERO_EPSILON = 1e-9;

export interface StateTablePngOptions {
  width?: number;
  scale?: number;
  barColor: string;
  trackColor: string;
  textColor: string;
  mutedColor: string;
  bgColor: string;
  borderColor: string;
}

export async function drawStateTablePng(
  amplitudes: StateVector,
  numQubits: number,
  opts: StateTablePngOptions,
): Promise<Blob> {
  const labels = basisLabels(numQubits);
  const probs = probabilities(amplitudes);

  const scale = opts.scale ?? 3;
  const padding = 16;
  const headerHeight = 28;
  const rowHeight = 32;
  const width = opts.width ?? 480;
  const height = padding * 2 + headerHeight + labels.length * rowHeight;

  const colBasis = padding;
  const colRe = width * 0.32;
  const colIm = width * 0.48;
  const colProb = width * 0.64;
  const barWidth = width - colProb - padding - 48;
  const barHeight = 8;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.scale(scale, scale);

  ctx.fillStyle = opts.bgColor;
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = "middle";

  const headerY = padding + headerHeight / 2;
  ctx.font = "600 11px monospace";
  ctx.fillStyle = opts.mutedColor;
  ctx.textAlign = "left";
  ctx.fillText("BASIS STATE", colBasis, headerY);
  ctx.fillText("RE", colRe, headerY);
  ctx.fillText("IM", colIm, headerY);
  ctx.fillText("PROBABILITY", colProb, headerY);

  ctx.strokeStyle = opts.borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, padding + headerHeight);
  ctx.lineTo(width, padding + headerHeight);
  ctx.stroke();

  labels.forEach((label, i) => {
    const amp = amplitudes[i];
    const isZero = probs[i] < ZERO_EPSILON;
    const textColor = isZero ? opts.mutedColor : opts.textColor;
    const y = padding + headerHeight + i * rowHeight + rowHeight / 2;

    ctx.font = "600 13px monospace";
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.fillText(`|${label}⟩`, colBasis, y);

    ctx.font = "400 12px monospace";
    ctx.fillText(formatComponent(amp.re), colRe, y);
    ctx.fillText(formatComponent(amp.im), colIm, y);

    ctx.fillStyle = opts.trackColor;
    roundRect(ctx, colProb, y - barHeight / 2, barWidth, barHeight, barHeight / 2);
    ctx.fill();

    const filled = Math.max(0, Math.min(1, probs[i])) * barWidth;
    if (filled > 0) {
      ctx.fillStyle = opts.barColor;
      roundRect(ctx, colProb, y - barHeight / 2, filled, barHeight, barHeight / 2);
      ctx.fill();
    }

    ctx.font = "600 12px monospace";
    ctx.fillStyle = textColor;
    ctx.textAlign = "right";
    ctx.fillText(`${(probs[i] * 100).toFixed(1)}%`, width - padding, y);
  });

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("State table PNG export failed"))), "image/png");
  });
}
