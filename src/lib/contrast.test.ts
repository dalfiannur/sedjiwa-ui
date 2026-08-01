import { describe, expect, it } from "vitest";
import { contrastRatio, oklchToLinearSrgb, relativeLuminance } from "./contrast";

describe("contrast maths", () => {
  it("maps oklch white to linear 1", () => {
    const [r, g, b] = oklchToLinearSrgb(1, 0, 0);
    expect(r).toBeCloseTo(1, 3);
    expect(g).toBeCloseTo(1, 3);
    expect(b).toBeCloseTo(1, 3);
  });

  it("gives white-on-black the maximum ratio", () => {
    expect(contrastRatio([1, 0, 0], [0, 0, 0])).toBeCloseTo(21, 1);
  });

  it("matches the canonical WCAG boundary grey", () => {
    // #767676 on white is the textbook 4.54:1 boundary case. Its OKLCH
    // lightness is 0.5658, not 0.5462 (verified by forward-converting sRGB
    // #767676 -> linear -> OKLab with this same module's matrices and
    // round-tripping back through oklchToLinearSrgb: L=0.5658 reproduces the
    // linear value exactly and yields 4.5422:1). 0.5462 was checked and does
    // not correspond to this color; using it here would silently assert the
    // wrong grey, not verify the boundary case the comment names.
    expect(contrastRatio([0.5658, 0, 0], [1, 0, 0])).toBeCloseTo(4.54, 1);
  });

  it("is symmetric", () => {
    const a: [number, number, number] = [0.58, 0.22, 27];
    const b: [number, number, number] = [1, 0, 0];
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 6);
  });

  it("computes luminance on linearised channels", () => {
    expect(relativeLuminance([1, 1, 1])).toBeCloseTo(1, 6);
    expect(relativeLuminance([0, 0, 0])).toBeCloseTo(0, 6);
  });
});
