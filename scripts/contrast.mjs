// Gates every semantic subtle/text pair AND solid foreground/fill pair in
// src/styles/tokens.css at WCAG AA (4.5:1).
// Run: bun run scripts/contrast.mjs
//
// The oklch -> linear sRGB -> WCAG luminance/contrast maths lives in
// src/lib/contrast.ts, which is unit-tested (src/lib/contrast.test.ts). This
// script imports it directly rather than redefining it: bun's runtime
// transpiles TypeScript on the fly regardless of the importing file's own
// extension, so a plain `import` from a .mjs script works without a build
// step. If that ever stops being true, restore a verbatim copy here and mark
// it clearly as mirroring src/lib/contrast.ts.
import { readFileSync } from "node:fs";
import { contrastRatio } from "../src/lib/contrast.ts";

const TONES = ["success", "warning", "info", "destructive"];
// User-chosen label colours. Not semantic, but they carry text on a fill
// exactly like the subtle pairs do, so they are gated the same way — the
// whole reason the palette is fixed rather than an open colour prop.
const LABELS = ["teal", "blue", "amber", "rose", "violet", "lime"];
const THRESHOLD = 4.5;

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
const light = parseBlock(css, ":root");
const dark = parseBlock(css, ".dark");

// Optional themes override only some tokens, so each is measured stacked on
// the default it sits over — exactly what the cascade does in a browser. The
// selectors are anchored at the start of a line: the dark block's selector
// list contains the light block's selector as a substring.
const THEME_FILES = ["teal"];
function parseThemeBlock(themeCss, re, label) {
  const match = re.exec(themeCss);
  if (!match) throw new Error(`Could not find "${label}" block`);
  return parseTokens(extractBody(themeCss, match.index + match[0].length, label));
}

const THEMES = [
  ["light", light],
  ["dark", dark],
  ...THEME_FILES.flatMap((name) => {
    const themeCss = readFileSync(new URL(`../src/styles/themes/${name}.css`, import.meta.url), "utf8");
    const attr = escapeRegExp(`[data-theme="${name}"]`);
    return [
      [`${name} light`, { ...light, ...parseThemeBlock(themeCss, new RegExp(`^${attr}\\s*\\{`, "m"), `${name} light`) }],
      [`${name} dark`, { ...dark, ...parseThemeBlock(themeCss, new RegExp(`^\\.dark${attr}[^{]*\\{`, "m"), `${name} dark`) }],
    ];
  }),
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
    const ratio = contrastRatio(fg, bg);
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
    const ratio = contrastRatio(fg, bg);
    const ok = ratio >= THRESHOLD;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2).padStart(6)}:1  solid  --${fgName} on --${bgName} (${theme})`
    );
  }
}

for (const [theme, tokens] of THEMES) {
  for (const label of LABELS) {
    const fgName = `label-${label}-text`;
    const bgName = `label-${label}`;
    const fg = tokens[fgName];
    const bg = tokens[bgName];
    if (!fg || !bg) {
      console.log(`MISSING  --${fgName} / --${bgName} (${theme})`);
      failures++;
      continue;
    }
    const ratio = contrastRatio(fg, bg);
    const ok = ratio >= THRESHOLD;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2).padStart(6)}:1  label  --${fgName} on --${bgName} (${theme})`
    );
  }
}

// Header text on the TableHead fill. --table-header is a color-mix, which
// parseTokens cannot read, so it is rebuilt here from --primary and
// --table-header-base. TABLE_HEADER_MIX mirrors the 11% in tokens.css.
const TABLE_HEADER_MIX = 0.11;

function oklchToOklab([L, C, H]) {
  const h = (H * Math.PI) / 180;
  return [L, C * Math.cos(h), C * Math.sin(h)];
}

function oklabToOklch([L, a, b]) {
  const H = (Math.atan2(b, a) * 180) / Math.PI;
  return [L, Math.hypot(a, b), (H + 360) % 360];
}

function mixOklab(p, q, fraction) {
  const [pa, qa] = [oklchToOklab(p), oklchToOklab(q)];
  return oklabToOklch(pa.map((v, i) => v * fraction + qa[i] * (1 - fraction)));
}

for (const [theme, tokens] of THEMES) {
  const fg = tokens["foreground"];
  const primary = tokens["primary"];
  const base = tokens["table-header-base"];
  const bg = primary && base ? mixOklab(primary, base, TABLE_HEADER_MIX) : undefined;
  if (!fg || !bg) {
    console.log(`MISSING  --foreground / --primary / --table-header-base (${theme})`);
    failures++;
    continue;
  }
  const ratio = contrastRatio(fg, bg);
  const ok = ratio >= THRESHOLD;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2).padStart(6)}:1  table  --foreground on --table-header (${theme})`
  );
}

// Interactive states on solid Button fills.
//
// A token can sit comfortably above 4.5:1 at rest and fail the moment it is
// hovered, held or toggled on, because those states shift the fill. Nothing
// above sees that: every check so far reads tokens at full opacity, which is
// exactly how primary shipped at 2.97:1 when pressed in 0.42.1.
//
// button.variants.ts darkens solid fills with
// `color-mix(in oklab, var(--tone) N%, black)`. Mixing with black in oklab
// scales L, a and b by N — and scaling a/b is the same as scaling chroma at a
// fixed hue, so the mixed colour is just the token with L and C multiplied.
const STATE_STEPS = [
  ["hover", 0.92],
  ["on", 0.88],
  ["active", 0.85],
];
const SOLID_BUTTON_TONES = ["primary", "destructive", "secondary"];

function mixWithBlack([L, C, H], fraction) {
  return [L * fraction, C * fraction, H];
}

for (const [theme, tokens] of THEMES) {
  for (const tone of SOLID_BUTTON_TONES) {
    const fg = tokens[`${tone}-foreground`];
    const bg = tokens[tone];
    if (!fg || !bg) {
      console.log(`MISSING  --${tone}-foreground / --${tone} (${theme})`);
      failures++;
      continue;
    }
    for (const [state, fraction] of STATE_STEPS) {
      const ratio = contrastRatio(fg, mixWithBlack(bg, fraction));
      const ok = ratio >= THRESHOLD;
      if (!ok) failures++;
      console.log(
        `${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2).padStart(6)}:1  state  --${tone}-foreground on --${tone} :${state} (${theme})`
      );
    }
  }
}

// One-off pairs that don't follow the <tone>-subtle / <tone>-text convention.
// --calendar-outside is the dimmed adjacent-month day in Calendar. Those days
// stay clickable, so they are interactive text (4.5:1), and a Calendar can be
// rendered on any of three surfaces depending on whether the picker is modal,
// inline in a dialog, or inline on a page — so all three are gated, not just
// the one the default story happens to use.
//
// --primary / --sidebar-primary are not tones, so neither loop above reaches
// them, yet both carry text: the default Button and the active Sidebar item.
// That gap went unnoticed until --primary was re-cut around DashStack's
// #4880FF, whose own lightness measures 3.62:1 under a near-white foreground.
// Gate them here so the next hue change cannot quietly drop below AA.
const EXPLICIT_PAIRS = [
  ["calendar-outside", "background"],
  ["calendar-outside", "card"],
  ["calendar-outside", "popover"],
  ["primary-foreground", "primary"],
  ["sidebar-primary-foreground", "sidebar-primary"],
];
for (const [theme, tokens] of THEMES) {
  for (const [fgName, bgName] of EXPLICIT_PAIRS) {
    const fg = tokens[fgName];
    const bg = tokens[bgName];
    if (!fg || !bg) {
      console.log(`MISSING  --${fgName} / --${bgName} (${theme})`);
      failures++;
      continue;
    }
    const ratio = contrastRatio(fg, bg);
    const ok = ratio >= THRESHOLD;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2).padStart(6)}:1  on     --${fgName} on --${bgName} (${theme})`
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
const MUST_BE_MAPPED = [
  ...TONES.flatMap((tone) => [`--color-${tone}-subtle`, `--color-${tone}-text`]),
  ...LABELS.flatMap((l) => [`--color-label-${l}`, `--color-label-${l}-text`]),
  "--color-calendar-outside",
];
for (const varName of MUST_BE_MAPPED) {
  const declRe = new RegExp(`${escapeRegExp(varName)}\\s*:`);
  if (!declRe.test(themeInlineBody)) {
    console.log(`UNMAPPED ${varName} missing from @theme inline`);
    failures++;
  }
}

console.log(`\n${failures} failing pair(s) at ${THRESHOLD}:1`);
process.exit(failures === 0 ? 0 : 1);
