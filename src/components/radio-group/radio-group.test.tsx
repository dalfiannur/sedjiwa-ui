import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("<RadioGroup />", () => {
  it("renders a radiogroup with items", () => {
    render(
      <RadioGroup defaultValue="a" aria-label="choice">
        <RadioGroupItem value="a" aria-label="a" />
        <RadioGroupItem value="b" aria-label="b" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "choice" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("applies data-slot=radio-group on group and data-slot=radio-group-item on items", () => {
    render(
      <RadioGroup aria-label="choice">
        <RadioGroupItem value="a" aria-label="a" />
      </RadioGroup>,
    );
    expect(
      screen.getByRole("radiogroup").getAttribute("data-slot"),
    ).toBe("radio-group");
    expect(screen.getByRole("radio").getAttribute("data-slot")).toBe(
      "radio-group-item",
    );
  });

  it("calls onValueChange when an item is clicked", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="choice" onValueChange={onValueChange}>
        <RadioGroupItem value="a" aria-label="a" />
        <RadioGroupItem value="b" aria-label="b" />
      </RadioGroup>,
    );
    await user.click(screen.getByLabelText("b"));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("size on group is propagated to items via context", () => {
    render(
      <RadioGroup aria-label="choice" size="sm">
        <RadioGroupItem value="a" aria-label="a" />
      </RadioGroup>,
    );
    const item = screen.getByRole("radio");
    expect(item).toHaveAttribute("data-size", "sm");
    // Kit scale: sm is a 16px box. See checkbox.test.tsx for the full table.
    expect(item).toHaveClass("size-4");
  });

  it("state='error' on group propagates destructive border to items", () => {
    render(
      <RadioGroup aria-label="choice" state="error">
        <RadioGroupItem value="a" aria-label="a" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio")).toHaveClass("border-destructive");
  });

  it("checked item reflects aria-checked=true", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="choice">
        <RadioGroupItem value="a" aria-label="a" />
        <RadioGroupItem value="b" aria-label="b" />
      </RadioGroup>,
    );
    await user.click(screen.getByLabelText("a"));
    expect(screen.getByLabelText("a")).toHaveAttribute("aria-checked", "true");
  });

  it("respects disabled on group", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="choice" disabled onValueChange={onValueChange}>
        <RadioGroupItem value="a" aria-label="a" />
      </RadioGroup>,
    );
    await user.click(screen.getByLabelText("a"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("merges consumer className", () => {
    render(
      <RadioGroup aria-label="choice" className="custom">
        <RadioGroupItem value="a" aria-label="a" className="item-custom" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup")).toHaveClass("custom");
    expect(screen.getByRole("radio")).toHaveClass("item-custom");
  });

  it("forwards ref on group and item", () => {
    const groupRef = { current: null as HTMLDivElement | null };
    const itemRef = { current: null as HTMLButtonElement | null };
    render(
      <RadioGroup aria-label="choice" ref={groupRef}>
        <RadioGroupItem value="a" aria-label="a" ref={itemRef} />
      </RadioGroup>,
    );
    expect(groupRef.current).toBeInstanceOf(HTMLDivElement);
    expect(itemRef.current).toBeInstanceOf(HTMLButtonElement);
  });

  // See checkbox.test.tsx. A radio never fills its own box, so both states
  // take the accent wash rather than an opacity softening.
  it("carries the hover class", () => {
    render(
      <RadioGroup aria-label="choice">
        <RadioGroupItem value="a" aria-label="a" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio")).toHaveClass("enabled:hover:bg-accent");
  });

});
