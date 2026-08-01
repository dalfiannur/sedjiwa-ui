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

// Finds `selector`'s opening "{" and brace-counts forward to its matching "}",
// rather than matching the first "\n}" (a lazy match runs past a selector's own
// close and into whatever follows if the file is ever indented/nested, e.g.
// wrapped in `@layer base { :root {...} .dark {...} }`).
function findBlockBody(css, selector, label) {
  const re = new RegExp(`${selector}\\s*\\{`);
  const match = re.exec(css);
  if (!match) throw new Error(`Could not find "${label}" block`);
  const start = match.index + match[0].length;
  let depth = 1;
  let i = start;
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") depth--;
  }
  if (depth !== 0) throw new Error(`Unbalanced braces in "${label}" block`);
  return css.slice(start, i - 1);
}

function parseTokens(body) {
  const tokens = {};
  const tokenRe = /--([\w-]+):\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  let m;
  while ((m = tokenRe.exec(body)) !== null) {
    tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return tokens;
}

function parseBlock(css, selector) {
  return parseTokens(findBlockBody(css, selector, selector));
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

// A subtle/text pair can be perfectly accessible in tokens.css and still render
// transparent-on-transparent if nobody mapped it into `@theme inline` in
// base.css — Tailwind only generates `bg-success-subtle` etc. for mapped vars.
const baseCss = readFileSync(new URL("../src/styles/base.css", import.meta.url), "utf8");
const themeInlineBody = findBlockBody(baseCss, "@theme inline", "@theme inline");
for (const tone of TONES) {
  for (const suffix of ["subtle", "text"]) {
    const varName = `--color-${tone}-${suffix}`;
    if (!themeInlineBody.includes(varName)) {
      console.log(`UNMAPPED ${varName} missing from @theme inline`);
      failures++;
    }
  }
}

console.log(`\n${failures} failing pair(s) at ${THRESHOLD}:1`);
process.exit(failures === 0 ? 0 : 1);
