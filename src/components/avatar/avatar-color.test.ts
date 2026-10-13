import { describe, expect, it } from "vitest";
import { avatarColorClass, avatarColorIndex } from "./avatar-color";

describe("avatarColorIndex", () => {
  it("is stable and stays inside the palette", () => {
    expect(avatarColorIndex("628111@c.us")).toBe(avatarColorIndex("628111@c.us"));
    for (const k of ["", "a", "Tim Gudang", "120363@g.us"]) {
      expect(avatarColorIndex(k)).toBeGreaterThanOrEqual(0);
      expect(avatarColorIndex(k)).toBeLessThan(6);
    }
    expect(avatarColorClass("x")).toMatch(/^bg-label-\w+ text-label-\w+-text$/);
  });
});
