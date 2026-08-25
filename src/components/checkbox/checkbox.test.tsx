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

  it("applies size variant", () => {
    render(<Checkbox aria-label="agree" size="sm" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-size", "sm");
    expect(screen.getByRole("checkbox")).toHaveClass("size-3.5");
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
});
