import katexCss from "katex/dist/katex.min.css?raw";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Chakra's `useToken` returns `var(--chakra-colors-...)` references for semantic (light/dark
 * aware) tokens, not literal colors — resolved via the page's CSS custom properties. The cloned
 * SVG is serialized into a standalone document (loaded via a detached `<img>`), which has no
 * access to those custom properties, so any `var(...)` paint would render invisible. Walk the
 * still-attached live element tree (in the same order `cloneNode(true)` preserves) and bake each
 * computed color into the corresponding clone node before serializing.
 */
function inlineComputedColors(liveRoot: SVGSVGElement, cloneRoot: SVGSVGElement) {
  const liveEls: Element[] = [liveRoot, ...Array.from(liveRoot.querySelectorAll("*"))];
  const cloneEls: Element[] = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll("*"))];

  liveEls.forEach((live, i) => {
    const clone = cloneEls[i];
    if (!clone) return;
    const computed = getComputedStyle(live);

    for (const attr of ["stroke", "fill"] as const) {
      const raw = live.getAttribute(attr);
      if (raw?.includes("var(")) {
        const resolved = computed[attr];
        if (resolved) clone.setAttribute(attr, resolved);
      }
    }

    if (live instanceof HTMLElement && clone instanceof HTMLElement && live.style.color.includes("var(")) {
      clone.style.color = computed.color;
    }
  });
}

export async function svgElementToPngBlob(svg: SVGSVGElement, opts: { scale?: number } = {}): Promise<Blob> {
  const scale = opts.scale ?? 3;
  const width = svg.width.baseVal.value || svg.clientWidth;
  const height = svg.height.baseVal.value || svg.clientHeight;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  inlineComputedColors(svg, clone);
  if (clone.querySelector("foreignObject")) {
    const style = document.createElementNS(SVG_NS, "style");
    style.textContent = katexCss;
    const defs = document.createElementNS(SVG_NS, "defs");
    defs.appendChild(style);
    clone.insertBefore(defs, clone.firstChild);
  }

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = new Image();
    img.src = url;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("SVG PNG export failed"))), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function plotlyToPngBlob(
  graphDiv: HTMLElement,
  opts: { scale?: number } = {},
): Promise<Blob> {
  const scale = opts.scale ?? 3;
  const Plotly = (await import("plotly.js")).default;
  const dataUrl = await Plotly.toImage(graphDiv, {
    format: "png",
    width: (graphDiv.clientWidth || 700) * scale,
    height: (graphDiv.clientHeight || 400) * scale,
  });
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas PNG export failed"))), "image/png");
  });
}
