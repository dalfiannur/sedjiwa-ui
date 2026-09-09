import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrendIndicator } from "./trend-indicator";

describe("<TrendIndicator />", () => {
  it("renders the value without its sign, since the arrow carries direction", () => {
    render(<TrendIndicator value={-4.3} />);
    expect(screen.getByText("4.3%")).toBeInTheDocument();
  });

  it("marks direction from the sign of the value", () => {
    const { container, rerender } = render(<TrendIndicator value={8.5} />);
    expect(container.firstChild).toHaveAttribute("data-direction", "up");

    rerender(<TrendIndicator value={-8.5} />);
    expect(container.firstChild).toHaveAttribute("data-direction", "down");

    rerender(<TrendIndicator value={0} />);
    expect(container.firstChild).toHaveAttribute("data-direction", "flat");
  });

  // Direction is not judgement. Rejections falling is good news and revenue
  // falling is not, and both draw the same downward arrow.
  it.each([
    [8.5, "up", "positive"],
    [-4.3, "up", "negative"],
    [8.5, "down", "negative"],
    [-4.3, "down", "positive"],
  ] as const)("scores %s under polarity %s as %s", (value, polarity, tone) => {
    const { container } = render(<TrendIndicator value={value} polarity={polarity} />);
    expect(container.firstChild).toHaveAttribute("data-tone", tone);
  });

  it("keeps a flat trend neutral whatever the polarity", () => {
    const { container } = render(<TrendIndicator value={0} polarity="down" />);
    expect(container.firstChild).toHaveAttribute("data-tone", "neutral");
  });

  it("stays neutral when the caller declines to judge", () => {
    const { container } = render(<TrendIndicator value={8.5} polarity="neutral" />);
    expect(container.firstChild).toHaveAttribute("data-tone", "neutral");
  });

  // Colour and an arrow are both visual; a screen reader gets neither.
  it("names the direction for assistive tech", () => {
    render(<TrendIndicator value={8.5} />);
    expect(screen.getByText("naik", { exact: false })).toBeInTheDocument();
  });

  it("drops the spoken direction when the label already says it", () => {
    const { container } = render(
      <TrendIndicator value={8.5} directionLabel={null} label="naik dari kemarin" />,
    );
    expect(container.querySelector(".sr-only")).toBeNull();
  });

  it("hides the arrow from assistive tech", () => {
    const { container } = render(<TrendIndicator value={8.5} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders a trailing label", () => {
    render(<TrendIndicator value={8.5} label="dari kemarin" />);
    expect(screen.getByText("dari kemarin")).toBeInTheDocument();
  });

  it("accepts a custom formatter", () => {
    render(<TrendIndicator value={1234} formatValue={(v) => `${v} unit`} />);
    expect(screen.getByText("1234 unit")).toBeInTheDocument();
  });
});
