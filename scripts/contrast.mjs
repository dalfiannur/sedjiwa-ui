// Gates every semantic subtle/text token pair in src/styles/tokens.css at WCAG AA (4.5:1).
// Run: bun run scripts/contrast.mjs
import { readFileSync } from "node:fs";

const TONES = ["success", "warning", "info", "destructive"];
const THRESHOLD = 4.5;

function oklchToLinearSrgb(L, C, Hdeg) {
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

const clamp = (x) => Math.min(1, Math.max(0, x));

function luminance([L, C, H]) {
  const [r, g, b] = oklchToLinearSrgb(L, C, H).map(clamp);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

function parseBlock(css, selector) {
  const re = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`);
  const match = css.match(re);
  if (!match) throw new Error(`Could not find "${selector}" block in tokens.css`);
  const tokens = {};
  const tokenRe = /--([\w-]+):\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  let m;
  while ((m = tokenRe.exec(match[1])) !== null) {
    tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return tokens;
}

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const THEMES = [
  ["light", parseBlock(css, ":root")],
  ["dark", parseBlock(css, "\\.dark")],
];

let failures = 0;
for (const [theme, tokens] of THEMES) {
  for (const tone of TONES) {
    const fgName = `${tone}-text`;
    const bgName = `${tone}-subtle`;
    const fg = tokens[fgName];
    const bg = tokens[bgName];
    if (!fg || !bg) {
      console.log(`MISSING  --${fgName} / --${bgName} (${theme})`);
      failures++;
      continue;
    }
    const ratio = contrast(fg, bg);
    const ok = ratio >= THRESHOLD;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2).padStart(6)}:1  --${fgName} on --${bgName} (${theme})`
    );
  }
}

console.log(`\n${failures} failing pair(s) at ${THRESHOLD}:1`);
process.exit(failures === 0 ? 0 : 1);
