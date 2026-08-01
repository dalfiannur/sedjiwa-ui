// Gates every semantic subtle/text pair AND solid foreground/fill pair in
// src/styles/tokens.css at WCAG AA (4.5:1).
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
// Only returns the FIRST occurrence's body — callers that need every
// occurrence (e.g. a selector repeated inside multiple `@media` blocks) must
// use `findAllBlockBodies` instead.
function findBlockBody(css, selector, label) {
  const re = new RegExp(`${escapeRegExp(selector)}\\s*\\{`);
  const match = re.exec(css);
  if (!match) throw new Error(`Could not find "${label}" block`);
  return extractBody(css, match.index + match[0].length, label);
}

function extractBody(css, start, label) {
  let depth = 1;
  let i = start;
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") depth--;
  }
  if (depth !== 0) throw new Error(`Unbalanced braces in "${label}" block`);
  return css.slice(start, i - 1);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Finds every occurrence of `selector` (e.g. `:root` can appear again inside
// `@media print { :root { ... } }`) and returns each body in document order.
function findAllBlockBodies(css, selector, label) {
  const re = new RegExp(`${escapeRegExp(selector)}\\s*\\{`, "g");
  const bodies = [];
  let match;
  while ((match = re.exec(css)) !== null) {
    bodies.push(extractBody(css, match.index + match[0].length, label));
  }
  if (bodies.length === 0) throw new Error(`Could not find "${label}" block`);
  return bodies;
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

// Merges every occurrence of `selector` in document order so later
// declarations win, matching the CSS cascade (e.g. a `:root` block re-opened
// inside `@media print` further down the file overrides earlier values).
function parseBlock(css, selector) {
  const bodies = findAllBlockBodies(css, selector, selector);
  return Object.assign({}, ...bodies.map(parseTokens));
}

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const THEMES = [
  ["light", parseBlock(css, ":root")],
  ["dark", parseBlock(css, ".dark")],
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
      `${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2).padStart(6)}:1  subtle --${fgName} on --${bgName} (${theme})`
    );
  }
}

// Solid pairs: --<tone>-foreground on --<tone> (e.g. solid Badge variants).
// Distinct from the subtle pairs above — a token can pass one and fail the
// other, as success/info/destructive did here (near-white foreground on a
// mid-lightness solid fill measured ~3.32:1 before being darkened).
for (const [theme, tokens] of THEMES) {
  for (const tone of TONES) {
    const fgName = `${tone}-foreground`;
    const bgName = tone;
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
      `${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2).padStart(6)}:1  solid  --${fgName} on --${bgName} (${theme})`
    );
  }
}

// A subtle/text pair can be perfectly accessible in tokens.css and still render
// transparent-on-transparent if nobody mapped it into `@theme inline` in
// base.css — Tailwind only generates `bg-success-subtle` etc. for mapped vars.
const baseCss = readFileSync(new URL("../src/styles/base.css", import.meta.url), "utf8");
const themeInlineBodyRaw = findBlockBody(baseCss, "@theme inline", "@theme inline");
// Strip /* ... */ comments so a commented-out mapping (e.g.
// `/* --color-info-text: var(--info-text); */`) isn't mistaken for a live one
// by a substring check.
const themeInlineBody = themeInlineBodyRaw.replace(/\/\*[\s\S]*?\*\//g, "");
for (const tone of TONES) {
  for (const suffix of ["subtle", "text"]) {
    const varName = `--color-${tone}-${suffix}`;
    const declRe = new RegExp(`${escapeRegExp(varName)}\\s*:`);
    if (!declRe.test(themeInlineBody)) {
      console.log(`UNMAPPED ${varName} missing from @theme inline`);
      failures++;
    }
  }
}

console.log(`\n${failures} failing pair(s) at ${THRESHOLD}:1`);
process.exit(failures === 0 ? 0 : 1);
