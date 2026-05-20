import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// @testing-library/react's asyncWrapper checks `typeof jest !== 'undefined'` to detect
// fake timers and advance them. Expose `vi` as `jest` so the detection works with Vitest.
// Without this, fake-timer tests that go through userEvent will hang indefinitely.
(globalThis as Record<string, unknown>).jest = vi;

// jsdom does not implement window.matchMedia; provide a minimal stub so
// libraries like sonner that call it during mount don't throw.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom does not implement ResizeObserver; provide a minimal stub so
// Radix UI primitives (e.g. Tooltip) that use it during mount don't throw.
if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

afterEach(() => {
  cleanup();
});
