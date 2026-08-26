import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// jsdom does not evaluate media queries for computed style, so the effect of
// this rule cannot be asserted by rendering. It was verified by hand in Chrome
// instead: with the block's condition inverted to one that was true, an element
// carrying `animate-in zoom-in-95 slide-in-from-top-2 fade-in-0` computed
// --tw-enter-scale 1 and --tw-enter-translate-y 0 while --tw-enter-opacity
// stayed 0 — movement gone, fade intact.
//
// What this test guards is the part that silently rots: the block being
// deleted, losing a property, or gaining --tw-*-opacity (which would kill the
// fade the kit explicitly wants kept).
// Read from the project root: import.meta.url is not a file: URL under vite's
// transform, so fileURLToPath cannot be used here.
const css = readFileSync("src/styles/base.css", "utf8");

const block = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));

describe("prefers-reduced-motion", () => {
  it("declares the reduce block", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it.each([
    "--tw-enter-scale",
    "--tw-exit-scale",
    "--tw-enter-translate-x",
    "--tw-enter-translate-y",
    "--tw-exit-translate-x",
    "--tw-exit-translate-y",
    "--tw-enter-rotate",
    "--tw-exit-rotate",
    "--tw-enter-blur",
    "--tw-exit-blur",
  ])("neutralises %s", (prop) => {
    expect(block).toMatch(new RegExp(`${prop}:\\s*[01]\\s*!important`));
  });

  // The kit says "skip scale, use fade only". Forcing opacity here would take
  // the fade away too, leaving overlays to appear with no transition at all.
  it("leaves the fade alone", () => {
    expect(block).not.toContain("--tw-enter-opacity");
    expect(block).not.toContain("--tw-exit-opacity");
  });
});
