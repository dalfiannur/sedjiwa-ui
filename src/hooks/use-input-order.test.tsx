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
