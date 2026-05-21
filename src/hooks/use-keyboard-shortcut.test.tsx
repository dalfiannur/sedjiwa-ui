import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";

const originalPlatform = Object.getOwnPropertyDescriptor(window.navigator, "platform");

function setPlatform(platform: string) {
  Object.defineProperty(window.navigator, "platform", {
    value: platform,
    configurable: true,
  });
}

afterEach(() => {
  if (originalPlatform) {
    Object.defineProperty(window.navigator, "platform", originalPlatform);
  }
});

describe("useKeyboardShortcut — single key", () => {
  it("fires the handler when the key is pressed on window", async () => {
    const user = userEvent.setup();
    const onShortcut = vi.fn();
    renderHook(() => useKeyboardShortcut("escape", onShortcut));
    await user.keyboard("{Escape}");
    expect(onShortcut).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys", async () => {
    const user = userEvent.setup();
    const onShortcut = vi.fn();
    renderHook(() => useKeyboardShortcut("escape", onShortcut));
    await user.keyboard("a");
    expect(onShortcut).not.toHaveBeenCalled();
  });
});

describe("useKeyboardShortcut — modifier matching", () => {
  it("requires the exact modifier set", async () => {
    const user = userEvent.setup();
    const onShortcut = vi.fn();
    renderHook(() => useKeyboardShortcut("ctrl+k", onShortcut));

    await user.keyboard("k");
    expect(onShortcut).not.toHaveBeenCalled();

    await user.keyboard("{Control>}k{/Control}");
    expect(onShortcut).toHaveBeenCalledTimes(1);

    await user.keyboard("{Control>}{Shift>}k{/Shift}{/Control}");
    expect(onShortcut).toHaveBeenCalledTimes(1);
  });

  it("supports shift+letter shortcuts using the upper-case key", async () => {
    const user = userEvent.setup();
    const onShortcut = vi.fn();
    renderHook(() => useKeyboardShortcut("shift+a", onShortcut));
    await user.keyboard("{Shift>}a{/Shift}");
    expect(onShortcut).toHaveBeenCalledTimes(1);
  });
});

describe("useKeyboardShortcut — mod alias", () => {
  it("maps mod to meta on macOS", async () => {
    setPlatform("MacIntel");
    const user = userEvent.setup();
    const onShortcut = vi.fn();
    renderHook(() => useKeyboardShortcut("mod+k", onShortcut));

    await user.keyboard("{Control>}k{/Control}");
    expect(onShortcut).not.toHaveBeenCalled();

    await user.keyboard("{Meta>}k{/Meta}");
    expect(onShortcut).toHaveBeenCalledTimes(1);
  });

  it("maps mod to ctrl off macOS", async () => {
    setPlatform("Linux x86_64");
    const user = userEvent.setup();
    const onShortcut = vi.fn();
    renderHook(() => useKeyboardShortcut("mod+k", onShortcut));

    await user.keyboard("{Meta>}k{/Meta}");
    expect(onShortcut).not.toHaveBeenCalled();

    await user.keyboard("{Control>}k{/Control}");
    expect(onShortcut).toHaveBeenCalledTimes(1);
  });
});

describe("useKeyboardShortcut — array of shortcuts", () => {
  it("fires when any shortcut matches", async () => {
    const user = userEvent.setup();
    const onShortcut = vi.fn();
    renderHook(() => useKeyboardShortcut(["ctrl+s", "meta+s"], onShortcut));

    await user.keyboard("{Control>}s{/Control}");
    await user.keyboard("{Meta>}s{/Meta}");
    expect(onShortcut).toHaveBeenCalledTimes(2);
  });
});

describe("useKeyboardShortcut — enabled flag", () => {
  it("does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onShortcut = vi.fn();
    renderHook(() => useKeyboardShortcut("escape", onShortcut, { enabled: false }));
    await user.keyboard("{Escape}");
    expect(onShortcut).not.toHaveBeenCalled();
  });

  it("attaches/detaches when toggled", async () => {
    const user = userEvent.setup();
    const onShortcut = vi.fn();
    const { rerender } = renderHook(
      ({ on }: { on: boolean }) =>
        useKeyboardShortcut("escape", onShortcut, { enabled: on }),
      { initialProps: { on: true } },
    );
    await user.keyboard("{Escape}");
    expect(onShortcut).toHaveBeenCalledTimes(1);

    rerender({ on: false });
    await user.keyboard("{Escape}");
    expect(onShortcut).toHaveBeenCalledTimes(1);

    rerender({ on: true });
    await user.keyboard("{Escape}");
    expect(onShortcut).toHaveBeenCalledTimes(2);
  });
});

describe("useKeyboardShortcut — preventDefault / stopPropagation", () => {
  it("preventDefault is true by default", () => {
    const onShortcut = vi.fn();
    renderHook(() => useKeyboardShortcut("escape", onShortcut));
    const ev = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    window.dispatchEvent(ev);
    expect(onShortcut).toHaveBeenCalledTimes(1);
    expect(ev.defaultPrevented).toBe(true);
  });

  it("respects preventDefault: false", () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useKeyboardShortcut("escape", onShortcut, { preventDefault: false }),
    );
    const ev = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    window.dispatchEvent(ev);
    expect(onShortcut).toHaveBeenCalledTimes(1);
    expect(ev.defaultPrevented).toBe(false);
  });
});

describe("useKeyboardShortcut — allowInInputs", () => {
  function Fixture({ allowInInputs }: { allowInInputs?: boolean }) {
    useKeyboardShortcut("a", spy, { allowInInputs, preventDefault: false });
    return <input aria-label="text" />;
  }
  const spy = vi.fn();
  beforeEach(() => spy.mockReset());

  it("skips shortcut when focus is in an input by default", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const input = screen.getByLabelText("text");
    input.focus();
    await user.keyboard("a");
    expect(spy).not.toHaveBeenCalled();
  });

  it("fires inside inputs when allowInInputs is true", async () => {
    const user = userEvent.setup();
    render(<Fixture allowInInputs />);
    const input = screen.getByLabelText("text");
    input.focus();
    await user.keyboard("a");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("useKeyboardShortcut — element target", () => {
  it("only listens on the provided element", async () => {
    const user = userEvent.setup();
    const onShortcut = vi.fn();
    function Fixture() {
      const ref = React.useRef<HTMLDivElement | null>(null);
      useKeyboardShortcut("a", onShortcut, { target: ref, allowInInputs: true });
      return <div tabIndex={0} ref={ref} aria-label="box" />;
    }
    render(<Fixture />);

    await user.keyboard("a");
    expect(onShortcut).not.toHaveBeenCalled();

    screen.getByLabelText("box").focus();
    await user.keyboard("a");
    expect(onShortcut).toHaveBeenCalledTimes(1);
  });
});

describe("useKeyboardShortcut — handler identity", () => {
  it("uses the latest handler without re-attaching", async () => {
    const user = userEvent.setup();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ h }: { h: () => void }) => useKeyboardShortcut("escape", h),
      { initialProps: { h: first } },
    );
    rerender({ h: second });
    await user.keyboard("{Escape}");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe("useKeyboardShortcut — parse errors", () => {
  it("throws on empty shortcut", () => {
    expect(() =>
      renderHook(() => useKeyboardShortcut("", vi.fn())),
    ).toThrow(/empty shortcut/);
  });

  it("throws when no non-modifier key is provided", () => {
    expect(() =>
      renderHook(() => useKeyboardShortcut("ctrl+shift", vi.fn())),
    ).toThrow(/non-modifier key/);
  });
});
