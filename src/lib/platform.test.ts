import { afterEach, describe, expect, it } from "vitest";
import { isMac } from "./platform";

const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");

function setNavigator(value: unknown): void {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value,
  });
}

afterEach(() => {
  if (original) Object.defineProperty(globalThis, "navigator", original);
});

describe("isMac", () => {
  it("reads userAgentData.platform when the browser offers it", () => {
    setNavigator({ userAgentData: { platform: "macOS" }, platform: "Win32" });
    expect(isMac()).toBe(true);
  });

  it("falls back to navigator.platform", () => {
    setNavigator({ platform: "MacIntel" });
    expect(isMac()).toBe(true);
  });

  it("recognises the touch platforms", () => {
    for (const platform of ["iPhone", "iPad", "iPod"]) {
      setNavigator({ platform });
      expect(isMac()).toBe(true);
    }
  });

  it("says no for Windows", () => {
    setNavigator({ platform: "Win32" });
    expect(isMac()).toBe(false);
  });

  it("says no for Linux", () => {
    setNavigator({ platform: "Linux x86_64" });
    expect(isMac()).toBe(false);
  });

  it("says no when the platform is missing entirely", () => {
    setNavigator({});
    expect(isMac()).toBe(false);
  });

  // Server-side rendering has no navigator at all, and guessing "Mac" there
  // would render the wrong glyph into the HTML before hydration.
  it("says no when there is no navigator", () => {
    setNavigator(undefined);
    expect(isMac()).toBe(false);
  });
});
