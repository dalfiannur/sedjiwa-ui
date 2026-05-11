import { describe, expect, it } from "vitest";
import { renderHook, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputOrderProvider, useInputOrder } from "./use-input-order";

describe("useInputOrder", () => {
  it("throws when used outside <InputOrderProvider>", () => {
    expect(() => renderHook(() => useInputOrder(1))).toThrow(
      /useInputOrder must be used inside <InputOrderProvider>/,
    );
  });
});

function FieldFixture({ order, label }: { order: number; label: string }) {
  const { ref, onKeyDown } = useInputOrder(order);
  return <input ref={ref} onKeyDown={onKeyDown} aria-label={label} />;
}

describe("InputOrderProvider — Tab forward", () => {
  it("Tab on first field focuses the second", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );

    const a = screen.getByLabelText("a");
    const b = screen.getByLabelText("b");
    a.focus();
    expect(a).toHaveFocus();

    await user.keyboard("{Tab}");
    expect(b).toHaveFocus();
  });
});

describe("InputOrderProvider — Shift+Tab and sort order", () => {
  it("Shift+Tab on second field focuses the first", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("b").focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText("a")).toHaveFocus();
  });

  it("steps in sorted order even with gaps and DOM mis-order", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="none">
        {/* DOM order intentionally != logical order */}
        <FieldFixture order={10} label="last" />
        <FieldFixture order={1} label="first" />
        <FieldFixture order={5} label="middle" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("first").focus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("middle")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("last")).toHaveFocus();
  });
});

describe("InputOrderProvider — duplicate orders", () => {
  it("warns once in dev when two fields share the same order", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={1} label="b" />
      </InputOrderProvider>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toMatch(/duplicate order/);
    warn.mockRestore();
  });
});

describe("InputOrderProvider — skipping", () => {
  it("skips disabled inputs", async () => {
    const user = userEvent.setup();
    function Disabled({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return <input ref={ref} onKeyDown={onKeyDown} aria-label={label} disabled />;
    }
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <Disabled order={2} label="b" />
        <FieldFixture order={3} label="c" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("c")).toHaveFocus();
  });

  it("skips elements with aria-disabled=true", async () => {
    const user = userEvent.setup();
    function AriaDisabled({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <input
          ref={ref}
          onKeyDown={onKeyDown}
          aria-label={label}
          aria-disabled="true"
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <AriaDisabled order={2} label="b" />
        <FieldFixture order={3} label="c" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("c")).toHaveFocus();
  });

  it("skips elements with tabIndex=-1", async () => {
    const user = userEvent.setup();
    function Untabbable({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <input ref={ref} onKeyDown={onKeyDown} aria-label={label} tabIndex={-1} />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <Untabbable order={2} label="b" />
        <FieldFixture order={3} label="c" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("c")).toHaveFocus();
  });
});

describe("InputOrderProvider — Enter to advance", () => {
  it("Enter on a plain input focuses the next field", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Enter}");
    expect(screen.getByLabelText("b")).toHaveFocus();
  });
});
