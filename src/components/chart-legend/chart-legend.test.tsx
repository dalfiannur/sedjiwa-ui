import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartLegend, ChartLegendItem } from "./chart-legend";

describe("<ChartLegend />", () => {
  it("renders as a list so its entries are announced as a set", () => {
    render(
      <ChartLegend>
        <ChartLegendItem label="Penjualan" />
        <ChartLegendItem label="Laba" />
      </ChartLegend>,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("defaults a series to its chart token rather than a literal", () => {
    const { container } = render(<ChartLegendItem label="Penjualan" />);
    const swatch = container.querySelector('[data-slot="chart-legend-swatch"]');
    expect(swatch).toHaveStyle({ backgroundColor: "var(--chart-1)" });
  });

  it("takes an explicit colour", () => {
    const { container } = render(
      <ChartLegendItem label="Laba" color="var(--chart-3)" />,
    );
    expect(
      container.querySelector('[data-slot="chart-legend-swatch"]'),
    ).toHaveStyle({ backgroundColor: "var(--chart-3)" });
  });

  // The swatch pairs a colour to a label that is already spoken; announcing it
  // would add a second, meaningless stop.
  it("hides the swatch from assistive tech", () => {
    const { container } = render(<ChartLegendItem label="Penjualan" />);
    expect(
      container.querySelector('[data-slot="chart-legend-swatch"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("stacks once a value is given", () => {
    const { container } = render(
      <ChartLegendItem label="Pelanggan baru" value="34.249" />,
    );
    expect(container.firstChild).toHaveAttribute("data-layout", "stacked");
    expect(screen.getByText("34.249")).toBeInTheDocument();
  });

  it("stays inline without a value", () => {
    const { container } = render(<ChartLegendItem label="Penjualan" />);
    expect(container.firstChild).toHaveAttribute("data-layout", "inline");
  });

  it("lets an explicit layout beat the value-derived one", () => {
    const { container } = render(
      <ChartLegendItem label="Pelanggan baru" value="34.249" layout="inline" />,
    );
    expect(container.firstChild).toHaveAttribute("data-layout", "inline");
  });

  it("omits the value element entirely when there is no value", () => {
    const { container } = render(<ChartLegendItem label="Penjualan" />);
    expect(
      container.querySelector('[data-slot="chart-legend-value"]'),
    ).toBeNull();
  });
});
