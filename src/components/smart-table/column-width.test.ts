import { describe, expect, it } from "vitest";
import { floorTrack, gridMinWidth, trackMinimum } from "./column-width";

describe("floorTrack", () => {
  it("leaves the track alone until the header is measured", () => {
    expect(floorTrack(undefined, 0)).toBe("minmax(0, 1fr)");
    expect(floorTrack("9rem", 0)).toBe("9rem");
  });

  it("floors flexible tracks at the header width", () => {
    expect(floorTrack(undefined, 96)).toBe("minmax(96px, 1fr)");
    expect(floorTrack("2fr", 96)).toBe("minmax(96px, 2fr)");
    expect(floorTrack("minmax(0, 1.5fr)", 96)).toBe("minmax(96px, 1.5fr)");
    expect(floorTrack("minmax(10rem, 1.5fr)", 96)).toBe(
      "minmax(max(10rem, 96px), 1.5fr)",
    );
  });

  it("lets a fixed track grow to fit its header", () => {
    expect(floorTrack("9rem", 96)).toBe("max(9rem, 96px)");
    expect(floorTrack("calc(4rem + 2px)", 96)).toBe("max(calc(4rem + 2px), 96px)");
  });

  it("leaves content-sized tracks alone", () => {
    expect(floorTrack("auto", 96)).toBe("auto");
    expect(floorTrack("max-content", 96)).toBe("max-content");
  });
});

describe("trackMinimum", () => {
  it("is the smallest width the floored track can take", () => {
    expect(trackMinimum(undefined, 96)).toBe("96px");
    expect(trackMinimum("minmax(10rem, 1.5fr)", 96)).toBe("max(10rem, 96px)");
    expect(trackMinimum("9rem", 96)).toBe("max(9rem, 96px)");
    expect(trackMinimum("auto", 96)).toBe("96px");
    expect(trackMinimum(undefined, 0)).toBe("0px");
  });
});

describe("gridMinWidth", () => {
  it("keeps the configured minimum until something is measured", () => {
    expect(gridMinWidth("48rem", ["0px", "0px"], false)).toBe("48rem");
  });

  it("grows to the sum of the column minimums", () => {
    expect(gridMinWidth("48rem", ["2.75rem", "96px", "max(9rem, 80px)"], true)).toBe(
      "max(48rem, calc(2.75rem + 96px + max(9rem, 80px)))",
    );
  });
});
