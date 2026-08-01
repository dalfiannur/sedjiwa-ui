// WCAG contrast maths for oklch() tokens. Moved verbatim from
// scripts/contrast.mjs (the CSS token gate) so it can be unit-tested in-repo;
// see that script for the mirrored copy and why it isn't imported directly.

export function oklchToLinearSrgb(L: number, C: number, Hdeg: number): [number, number, number] {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const clamp = (x: number) => Math.min(1, Math.max(0, x));

// WCAG relative luminance: a weighted sum over already-linear RGB channels
// (not oklch). Callers passing oklch coordinates should convert with
// `oklchToLinearSrgb` first — see `contrastRatio`.
export function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const a = relativeLuminance(oklchToLinearSrgb(...fg).map(clamp) as [number, number, number]);
  const b = relativeLuminance(oklchToLinearSrgb(...bg).map(clamp) as [number, number, number]);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}
