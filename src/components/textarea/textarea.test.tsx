import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";

describe("<Textarea />", () => {
  it("renders a textarea element", () => {
    render(<Textarea data-testid="ta" />);
    expect(screen.getByTestId("ta").tagName).toBe("TEXTAREA");
  });

  it("applies data-slot=textarea", () => {
    render(<Textarea data-testid="ta" />);
    expect(screen.getByTestId("ta")).toHaveAttribute("data-slot", "textarea");
  });

  it("applies data-state=default by default", () => {
    render(<Textarea data-testid="ta" />);
    expect(screen.getByTestId("ta")).toHaveAttribute("data-state", "default");
  });

  it("infers state=error from aria-invalid=true", () => {
    render(<Textarea data-testid="ta" aria-invalid={true} />);
    expect(screen.getByTestId("ta")).toHaveAttribute("data-state", "error");
    expect(screen.getByTestId("ta")).toHaveAttribute("aria-invalid", "true");
  });

  it("explicit state='success' overrides aria-invalid", () => {
    render(<Textarea data-testid="ta" state="success" aria-invalid={true} />);
    expect(screen.getByTestId("ta")).toHaveAttribute("data-state", "success");
  });

  it("applies size class", () => {
    render(<Textarea data-testid="ta" size="lg" />);
    expect(screen.getByTestId("ta")).toHaveClass("min-h-20");
  });

  it("calls onChange when typed into", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Textarea aria-label="bio" onChange={onChange} />);
    await user.type(screen.getByLabelText("bio"), "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("respects disabled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Textarea aria-label="bio" disabled onChange={onChange} />);
    await user.type(screen.getByLabelText("bio"), "x");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("forwards rows", () => {
    render(<Textarea data-testid="ta" rows={6} />);
    expect(screen.getByTestId("ta")).toHaveAttribute("rows", "6");
  });

  it("merges consumer className", () => {
    render(<Textarea data-testid="ta" className="custom" />);
    expect(screen.getByTestId("ta")).toHaveClass("custom");
  });

  it("forwards ref to the underlying textarea", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
