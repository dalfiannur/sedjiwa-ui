import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./stat-card";
import { TrendIndicator } from "../trend-indicator";

describe("<StatCard />", () => {
  it("renders the label and the figure", () => {
    render(<StatCard label="Total Pengguna" value="40.689" />);
    expect(screen.getByText("Total Pengguna")).toBeInTheDocument();
    expect(screen.getByText("40.689")).toBeInTheDocument();
  });

  it("records the tone for styling hooks", () => {
    const { container } = render(
      <StatCard label="Total Order" value="10293" tone="success" />,
    );
    expect(container.firstChild).toHaveAttribute("data-tone", "success");
  });

  // The label already names the figure, so the glyph adds nothing spoken.
  it("hides the icon from assistive tech", () => {
    const { container } = render(
      <StatCard label="Total Order" value="10293" icon={<svg />} />,
    );
    expect(container.querySelector('[data-slot="stat-card-icon"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("omits the icon tile entirely when no icon is given", () => {
    const { container } = render(<StatCard label="Total Order" value="10293" />);
    expect(container.querySelector('[data-slot="stat-card-icon"]')).toBeNull();
  });

  it("omits the trend slot when no trend is given", () => {
    const { container } = render(<StatCard label="Total Order" value="10293" />);
    expect(container.querySelector('[data-slot="stat-card-trend"]')).toBeNull();
  });

  it("hosts a TrendIndicator in its footer", () => {
    render(
      <StatCard
        label="Total Penjualan"
        value="Rp89.000.000"
        trend={<TrendIndicator value={-4.3} label="dari kemarin" />}
      />,
    );
    expect(screen.getByText("4.3%")).toBeInTheDocument();
    expect(screen.getByText("dari kemarin")).toBeInTheDocument();
  });
});
