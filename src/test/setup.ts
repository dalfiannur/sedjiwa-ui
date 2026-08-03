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

// Node 26 ships its own global `localStorage`, whose getter returns undefined
// unless the process was started with `--localstorage-file`. Vitest's jsdom
// environment makes `window === globalThis`, so Node's accessor shadows jsdom's
// implementation and `window.localStorage` comes back undefined — while
// `sessionStorage`, which Node does not define, works normally. jsdom's own copy
// is unreachable (`document.defaultView` is that same object), so supply one.
//
// Only the methods are provided, not `localStorage.foo` property access: no
// source or test here uses it, and a Proxy would buy faithfulness nobody needs.
if (typeof window.localStorage === "undefined") {
  const store = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return store.size;
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    getItem: (key: string) => store.get(String(key)) ?? null,
    setItem: (key: string, value: string) => {
      store.set(String(key), String(value));
    },
    removeItem: (key: string) => {
      store.delete(String(key));
    },
    clear: () => {
      store.clear();
    },
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get: () => storage,
  });
}

afterEach(() => {
  cleanup();
});
