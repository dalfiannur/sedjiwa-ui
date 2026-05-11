import * as React from "react";
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

describe("InputOrderProvider — Enter skip rules", () => {
  it("does not intercept Enter on a textarea (newlines must work)", async () => {
    const user = userEvent.setup();
    function TextareaField({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          onKeyDown={onKeyDown}
          aria-label={label}
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <TextareaField order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Enter}");
    expect(a).toHaveFocus();
  });

  it("does not intercept Enter on a button", async () => {
    const user = userEvent.setup();
    function ButtonField({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <button
          type="button"
          ref={ref as React.Ref<HTMLButtonElement>}
          onKeyDown={onKeyDown}
          aria-label={label}
        >
          go
        </button>
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <ButtonField order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Enter}");
    expect(a).toHaveFocus();
  });

  it("does not intercept Enter when target has aria-expanded=true", async () => {
    const user = userEvent.setup();
    function Combo({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <input
          ref={ref}
          onKeyDown={onKeyDown}
          aria-label={label}
          aria-expanded="true"
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <Combo order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Enter}");
    expect(a).toHaveFocus();
  });

  it("does not intercept Enter when target has data-input-order-enter=ignore", async () => {
    const user = userEvent.setup();
    function Escape({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <input
          ref={ref}
          onKeyDown={onKeyDown}
          aria-label={label}
          data-input-order-enter="ignore"
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <Escape order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Enter}");
    expect(a).toHaveFocus();
  });
});

describe("useInputOrder — options.onEnter", () => {
  it("calls onEnter and prevents default instead of advancing", async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    function CustomEnter() {
      const { ref, onKeyDown } = useInputOrder(1, { onEnter });
      return <input ref={ref} onKeyDown={onKeyDown} aria-label="a" />;
    }
    render(
      <InputOrderProvider onLastField="none">
        <CustomEnter />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Enter}");
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(a).toHaveFocus(); // did not advance
  });

  it("still uses the latest onEnter closure after re-render", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    function Harness({ tag }: { tag: string }) {
      const onEnter = () => calls.push(tag);
      const { ref, onKeyDown } = useInputOrder(1, { onEnter });
      return <input ref={ref} onKeyDown={onKeyDown} aria-label="a" />;
    }
    const { rerender } = render(
      <InputOrderProvider onLastField="none">
        <Harness tag="first" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Enter}");
    rerender(
      <InputOrderProvider onLastField="none">
        <Harness tag="second" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Enter}");
    expect(calls).toEqual(["first", "second"]);
  });
});

describe("InputOrderProvider — onLastField=submit", () => {
  it("calls form.requestSubmit() when Tab past the last field inside a <form>", async () => {
    const user = userEvent.setup();
    const requestSubmit = vi.fn();
    function Harness() {
      return (
        <form
          aria-label="f"
          onSubmit={(e) => e.preventDefault()}
          ref={(el) => {
            if (el) el.requestSubmit = requestSubmit;
          }}
        >
          <InputOrderProvider onLastField="submit">
            <FieldFixture order={1} label="a" />
            <FieldFixture order={2} label="b" />
          </InputOrderProvider>
        </form>
      );
    }
    render(<Harness />);
    screen.getByLabelText("b").focus();
    await user.keyboard("{Tab}");
    expect(requestSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls provider.onSubmit when no <form> ancestor exists", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <InputOrderProvider onLastField="submit" onSubmit={onSubmit}>
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("b").focus();
    await user.keyboard("{Tab}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not submit when stepping backward past the first field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <InputOrderProvider onLastField="submit" onSubmit={onSubmit}>
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("InputOrderProvider — onLastField=wrap", () => {
  it("Tab on the last field focuses the first", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="wrap">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("b").focus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("a")).toHaveFocus();
  });

  it("Shift+Tab on the first field focuses the last", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="wrap">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText("b")).toHaveFocus();
  });
});

describe("InputOrderProvider — onLastField=none", () => {
  it("does not preventDefault on Tab past the last field", () => {
    function Inline() {
      const { ref, onKeyDown } = useInputOrder(2);
      const last = React.useRef<HTMLInputElement>(null);
      React.useEffect(() => last.current?.focus(), []);
      return (
        <input
          ref={(el) => {
            ref(el);
            last.current = el;
          }}
          onKeyDown={onKeyDown}
          aria-label="last"
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <Inline />
      </InputOrderProvider>,
    );

    const last = screen.getByLabelText("last");
    last.focus();
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    last.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
