import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "./progress";

describe("<Progress />", () => {
  it("exposes the progressbar role with its bounds", () => {
    render(<Progress value={40} aria-label="Mengunggah" />);
    const bar = screen.getByRole("progressbar", { name: "Mengunggah" });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
  });

  // The kit is explicit: omit valuenow rather than send 0. Sending 0 claims
  // "no progress made" when the truth is "amount unknown", and a screen reader
  // announces those differently.
  it("omits aria-valuenow while indeterminate", () => {
    render(<Progress aria-label="Memuat" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-indeterminate", "true");
  });

  it("treats an explicit null as indeterminate too", () => {
    render(<Progress value={null} aria-label="Memuat" />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });

  it.each([
    [-20, "0"],
    [0, "0"],
    [55, "55"],
    [100, "100"],
    [140, "100"],
  ])("clamps %s to %s", (input, expected) => {
    render(<Progress value={input} aria-label="p" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      expected,
    );
  });

  it("survives NaN without emitting a broken value", () => {
    render(<Progress value={Number.NaN} aria-label="p" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("sets the fill width from the value", () => {
    const { container } = render(<Progress value={30} aria-label="p" />);
    const fill = container.querySelector('[data-slot="progress-fill"]');
    expect(fill).toHaveStyle({ width: "30%" });
  });

  it("gives the indeterminate fill no fixed width", () => {
    const { container } = render(<Progress aria-label="p" />);
    const fill = container.querySelector('[data-slot="progress-fill"]');
    expect(fill).not.toHaveAttribute("style");
    expect(fill).toHaveClass("animate-progress-indeterminate");
  });

  // A still 40% sliver would read as "stuck at 40%". Filling the track says
  // "working" without claiming an amount.
  it("stops the travel and fills the track under reduced motion", () => {
    const { container } = render(<Progress aria-label="p" />);
    const fill = container.querySelector('[data-slot="progress-fill"]');
    expect(fill).toHaveClass("motion-reduce:animate-none");
    expect(fill).toHaveClass("motion-reduce:w-full");
  });

  it.each([
    ["sm", "h-1"],
    ["default", "h-2"],
    ["lg", "h-3"],
  ] as const)("applies the %s thickness", (size, expected) => {
    render(<Progress value={10} size={size} aria-label="p" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("data-size", size);
    expect(bar).toHaveClass(expected);
  });

  it.each([
    ["default", "bg-primary"],
    ["success", "bg-success"],
    ["warning", "bg-warning"],
    ["error", "bg-destructive"],
  ] as const)("tones the fill for %s", (state, expected) => {
    const { container } = render(
      <Progress value={50} state={state} aria-label="p" />,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "data-state-tone",
      state,
    );
    expect(container.querySelector('[data-slot="progress-fill"]')).toHaveClass(
      expected,
    );
  });
});
