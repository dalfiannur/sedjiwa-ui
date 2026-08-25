import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";

describe("<Checkbox />", () => {
  it("renders a checkbox role element", () => {
    render(<Checkbox aria-label="agree" />);
    expect(screen.getByRole("checkbox", { name: "agree" })).toBeInTheDocument();
  });

  it("applies data-slot=checkbox", () => {
    render(<Checkbox aria-label="agree" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-slot", "checkbox");
  });

  it("calls onCheckedChange when toggled", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Checkbox aria-label="agree" onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("reflects checked state", () => {
    render(<Checkbox aria-label="agree" checked />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  });

  it("supports indeterminate state", () => {
    render(<Checkbox aria-label="agree" checked="indeterminate" />);
    const cb = screen.getByRole("checkbox");
    expect(cb).toHaveAttribute("data-state", "indeterminate");
    // What a screen reader actually announces. data-state is ours and styles
    // the box; aria-checked="mixed" is what reaches the user, and it is the
    // one thing the spec names for this state. The checked test above asserts
    // aria-checked="true" — this state was the gap.
    expect(cb).toHaveAttribute("aria-checked", "mixed");
    // Indicator renders the Minus icon
    expect(cb.querySelector("svg")).not.toBeNull();
  });

  // The design kit specifies 16 / 20 / 24px boxes; these are those in Tailwind
  // units. Pinning the class is what caught the scale change when it landed.
  it.each([
    ["sm", "size-4"],
    ["default", "size-5"],
    ["lg", "size-6"],
  ] as const)("applies the %s size variant", (size, expected) => {
    render(<Checkbox aria-label="agree" size={size} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-size", size);
    expect(screen.getByRole("checkbox")).toHaveClass(expected);
  });

  it("applies error state styling", () => {
    render(<Checkbox aria-label="agree" state="error" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-state-tone",
      "error",
    );
    expect(screen.getByRole("checkbox")).toHaveClass("border-destructive");
  });

  it("respects disabled", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Checkbox
        aria-label="agree"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("merges consumer className", () => {
    render(<Checkbox aria-label="agree" className="custom" />);
    expect(screen.getByRole("checkbox")).toHaveClass("custom");
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Checkbox aria-label="agree" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  // Hover is a state the design kit names for this control. jsdom cannot
  // compute :hover, so the class is the contract: an unchecked box washes
  // with accent, a filled box softens, and neither fires while disabled.
  it("carries the tone-agnostic hover classes", () => {
    render(<Checkbox aria-label="agree" />);
    const cb = screen.getByRole("checkbox");
    expect(cb).toHaveClass("data-[state=unchecked]:enabled:hover:bg-accent");
    expect(cb).toHaveClass("data-[state=checked]:enabled:hover:opacity-90");
    expect(cb).toHaveClass("data-[state=indeterminate]:enabled:hover:opacity-90");
  });

});
