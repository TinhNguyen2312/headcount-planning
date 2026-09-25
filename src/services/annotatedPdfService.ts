import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { Finding } from "@/types";
import type { FindingStatus } from "@/constants/enums";

export type RgbColor = { r: number; g: number; b: number };
export type StatusColors = Readonly<Record<FindingStatus, RgbColor>>;

const STATUSES: readonly FindingStatus[] = [
  "fail",
  "warning",
  "pending",
  "pass",
  "approved",
  "unknown",
];

function parseHsl(value: string): RgbColor | null {
  const match = value.match(/hsl\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%/i);
  if (!match) return null;
  const h = Number(match[1]) / 360;
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;
  const hueToRgb = (p: number, q: number, t: number) => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hueToRgb(p, q, h + 1 / 3),
    g: hueToRgb(p, q, h),
    b: hueToRgb(p, q, h - 1 / 3),
  };
}

export function readStatusColors(): StatusColors {
  if (typeof window === "undefined") {
    return {
      fail: { r: 0.9, g: 0.2, b: 0.2 },
      warning: { r: 0.9, g: 0.6, b: 0.1 },
      pending: { r: 0.2, g: 0.4, b: 0.9 },
      pass: { r: 0.1, g: 0.7, b: 0.3 },
      approved: { r: 0.6, g: 0.2, b: 0.8 },
      unknown: { r: 0.5, g: 0.5, b: 0.5 },
    };
  }
  const style = getComputedStyle(document.documentElement);
  const fallback: RgbColor = { r: 0.5, g: 0.5, b: 0.5 };
  return Object.fromEntries(
    STATUSES.map((status) => [
      status,
      parseHsl(style.getPropertyValue(`--status-${status}`)) ?? fallback,
    ]),
  ) as StatusColors;
}

export async function buildAnnotatedPdf(
  sourceBytes: ArrayBuffer | Uint8Array,
  findings: readonly Finding[],
  colors: StatusColors,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(sourceBytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  for (const finding of findings) {
    const page = pages[finding.pageNumber - 1];
    if (!page) continue;

    const { width: W, height: H } = page.getSize();
    const rotation = ((page.getRotation().angle % 360) + 360) % 360;
    const displayW = rotation === 90 || rotation === 270 ? H : W;
    const displayH = rotation === 90 || rotation === 270 ? W : H;

    const toPage = (u: number, v: number) => {
      switch (rotation) {
        case 90:
          return { x: v, y: u };
        case 180:
          return { x: W - u, y: v };
        case 270:
          return { x: W - v, y: H - u };
        default:
          return { x: u, y: H - v };
      }
    };
    const rectOf = (u: number, v: number, w: number, h: number) => {
      const a = toPage(u, v);
      const b = toPage(u + w, v + h);
      return {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(a.x - b.x),
        height: Math.abs(a.y - b.y),
      };
    };

    const color = colors[finding.status];
    const stroke = rgb(color.r, color.g, color.b);
    const borderWidth = Math.max(1.5, displayW * 0.002);
    const fontSize = Math.max(8, displayW * 0.008);

    const box = finding.boundingBox;
    const bu = (box.x / 100) * displayW;
    const bv = (box.y / 100) * displayH;
    const bw = (box.width / 100) * displayW;
    const bh = (box.height / 100) * displayH;

    page.drawRectangle({ ...rectOf(bu, bv, bw, bh), borderColor: stroke, borderWidth });

    const padX = fontSize * 0.4;
    const labelW = font.widthOfTextAtSize(finding.ruleIndex, fontSize) + padX * 2;
    const labelH = fontSize * 1.5;
    page.drawRectangle({
      ...rectOf(bu, bv - labelH, labelW, labelH),
      color: rgb(1, 1, 1),
      borderColor: stroke,
      borderWidth: Math.max(1, borderWidth * 0.6),
    });
    const textOrigin = toPage(bu + padX, bv - labelH * 0.28);
    page.drawText(finding.ruleIndex, {
      x: textOrigin.x,
      y: textOrigin.y,
      size: fontSize,
      font,
      color: rgb(0.09, 0.09, 0.09),
      rotate: degrees(rotation),
    });
  }

  return pdf.save();
}

export async function exportAnnotatedPdf({
  pdfUrl,
  findings,
  fileName,
}: {
  pdfUrl: string;
  findings: readonly Finding[];
  fileName: string;
}): Promise<void> {
  const response = await fetch(pdfUrl);
  if (!response.ok) throw new Error(`Không tải được PDF gốc (${response.status}).`);
  const bytes = await buildAnnotatedPdf(
    await response.arrayBuffer(),
    findings,
    readStatusColors(),
  );

  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
