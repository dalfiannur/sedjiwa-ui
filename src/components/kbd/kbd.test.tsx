import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kbd } from "./kbd";

const originalNavigator = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator",
);

function pretendPlatform(platform: string): void {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { platform },
  });
}

afterEach(() => {
  if (originalNavigator) {
    Object.defineProperty(globalThis, "navigator", originalNavigator);
  }
});

/** The visible key caps, in render order. */
function caps(): string[] {
  return Array.from(document.querySelectorAll('[data-slot="kbd"]')).map(
    (el) => el.textContent ?? "",
  );
}

describe("<Kbd />", () => {
  describe("free-form children", () => {
    it("renders what it is given", () => {
      render(<Kbd>Esc</Kbd>);
      expect(screen.getByText("Esc")).toBeInTheDocument();
    });

    it("uses a kbd element", () => {
      render(<Kbd>Esc</Kbd>);
      expect(screen.getByText("Esc").tagName).toBe("KBD");
    });
  });

  describe("mod on a Mac", () => {
    it("prints the command glyph", () => {
      pretendPlatform("MacIntel");
      render(<Kbd keys="mod+k" />);
      expect(caps()).toEqual(["⌘", "K"]);
    });

    it("prints the option glyph for alt", () => {
      pretendPlatform("MacIntel");
      render(<Kbd keys="alt+f" />);
      expect(caps()).toEqual(["⌥", "F"]);
    });
  });

  describe("mod elsewhere", () => {
    it("prints Ctrl on Windows", () => {
      pretendPlatform("Win32");
      render(<Kbd keys="mod+k" />);
      expect(caps()).toEqual(["Ctrl", "K"]);
    });

    it("prints Alt on Windows", () => {
      pretendPlatform("Win32");
      render(<Kbd keys="alt+f" />);
      expect(caps()).toEqual(["Alt", "F"]);
    });

    it("prints Ctrl on Linux", () => {
      pretendPlatform("Linux x86_64");
      render(<Kbd keys="mod+shift+p" />);
      expect(caps()).toEqual(["Ctrl", "Shift", "P"]);
    });
  });

  describe("modifier order", () => {
    // Fixed order, not the order they were typed: every hint in the app should
    // read the same way, and platforms have a conventional order of their own.
    it("normalises whatever order the shortcut was written in", () => {
      pretendPlatform("Win32");
      render(<Kbd keys="k+shift+mod" />);
      expect(caps()).toEqual(["Ctrl", "Shift", "K"]);
    });
  });

  describe("named keys", () => {
    it("spells out Enter", () => {
      pretendPlatform("Win32");
      render(<Kbd keys="enter" />);
      expect(caps()).toEqual(["Enter"]);
    });

    it("accepts the esc alias", () => {
      pretendPlatform("Win32");
      render(<Kbd keys="esc" />);
      expect(caps()).toEqual(["Esc"]);
    });

    it("draws the arrows as glyphs", () => {
      pretendPlatform("Win32");
      render(<Kbd keys="up" />);
      expect(caps()).toEqual(["↑"]);
    });

    it("names the space bar rather than printing a blank cap", () => {
      pretendPlatform("Win32");
      render(<Kbd keys="space" />);
      expect(caps()).toEqual(["Space"]);
    });
  });

  describe("accessibility", () => {
    // "⌘ K" read aloud is two symbols with no relationship. The group carries
    // a spoken name and the caps themselves are decorative.
    it("gives the group a spoken name", () => {
      pretendPlatform("MacIntel");
      render(<Kbd keys="mod+k" />);
      expect(screen.getByLabelText("Command K")).toBeInTheDocument();
    });

    it("spells the spoken name out on Windows too", () => {
      pretendPlatform("Win32");
      render(<Kbd keys="mod+shift+p" />);
      expect(screen.getByLabelText("Control Shift P")).toBeInTheDocument();
    });

    it("takes an override for the spoken name", () => {
      pretendPlatform("MacIntel");
      render(<Kbd keys="mod+k" aria-label="Buka pencarian" />);
      expect(screen.getByLabelText("Buka pencarian")).toBeInTheDocument();
    });
  });
});
