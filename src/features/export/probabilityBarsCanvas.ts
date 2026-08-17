export interface ProbabilityBarsPngOptions {
  width?: number;
  scale?: number;
  barColor: string;
  trackColor: string;
  textColor: string;
  bgColor: string;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export async function drawProbabilityBarsPng(
  labels: string[],
  probs: number[],
  opts: ProbabilityBarsPngOptions,
): Promise<Blob> {
  const scale = opts.scale ?? 3;
  const rowHeight = 32;
  const padding = 16;
  const labelWidth = 64;
  const pctWidth = 48;
  const width = opts.width ?? 560;
  const height = labels.length * rowHeight + padding * 2;
  const barX = padding + labelWidth;
  const barWidth = width - padding * 2 - labelWidth - pctWidth;
  const barHeight = 10;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.scale(scale, scale);

  ctx.fillStyle = opts.bgColor;
  ctx.fillRect(0, 0, width, height);
  ctx.font = "600 13px monospace";
  ctx.textBaseline = "middle";

  labels.forEach((label, i) => {
    const y = padding + i * rowHeight + rowHeight / 2;

    ctx.fillStyle = opts.textColor;
    ctx.textAlign = "left";
    ctx.fillText(`|${label}⟩`, padding, y);

    ctx.fillStyle = opts.trackColor;
    roundRect(ctx, barX, y - barHeight / 2, barWidth, barHeight, barHeight / 2);
    ctx.fill();

    const filled = Math.max(0, Math.min(1, probs[i])) * barWidth;
    if (filled > 0) {
      ctx.fillStyle = opts.barColor;
      roundRect(ctx, barX, y - barHeight / 2, filled, barHeight, barHeight / 2);
      ctx.fill();
    }

    ctx.fillStyle = opts.textColor;
    ctx.font = "400 11px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${(probs[i] * 100).toFixed(1)}%`, width - padding, y);
    ctx.font = "600 13px monospace";
  });

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Probability bars PNG export failed"))), "image/png");
  });
}
