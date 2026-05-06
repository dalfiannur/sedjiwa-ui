import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("<Input />", () => {
  it("renders an input element", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input").tagName).toBe("INPUT");
  });

  it("applies the data-slot marker", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("data-slot", "input");
  });

  it("forwards the type prop", () => {
    render(<Input data-testid="input" type="email" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email");
  });

  it("calls onChange when typed into", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={onChange} aria-label="name" />);
    await user.type(screen.getByLabelText("name"), "Ada");
    expect(onChange).toHaveBeenCalled();
  });

  it("respects disabled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input disabled onChange={onChange} aria-label="name" />);
    await user.type(screen.getByLabelText("name"), "x");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("merges consumer className", () => {
    render(<Input data-testid="input" className="custom" />);
    expect(screen.getByTestId("input")).toHaveClass("custom");
  });
});
