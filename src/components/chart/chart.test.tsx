import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LineChart } from "recharts";
import { ChartContainer, ChartTooltipContent } from "./chart";
import { seriesColor } from "./chart.types";

describe("seriesColor()", () => {
  it("hands out the chart ramp by position", () => {
    expect(seriesColor({}, 0)).toBe("var(--chart-1)");
    expect(seriesColor({}, 4)).toBe("var(--chart-5)");
  });

  it("cycles rather than running off the end of the ramp", () => {
    expect(seriesColor({}, 5)).toBe("var(--chart-1)");
    expect(seriesColor({}, 7)).toBe("var(--chart-3)");
  });

  it("lets an explicit colour win", () => {
    expect(seriesColor({ color: "#ff0000" }, 2)).toBe("#ff0000");
  });
});

describe("<ChartContainer />", () => {
  // A plot is an image to assistive tech; unlabelled it announces nothing
  // useful, and unhidden it announces every stray axis tick.
  it("carries the description as an image role", () => {
    render(
      <ChartContainer aria-label="Penjualan naik dari 5k ke 60k unit">
        <LineChart data={[]} />
      </ChartContainer>,
    );
    expect(
      screen.getByRole("img", { name: "Penjualan naik dari 5k ke 60k unit" }),
    ).toBeInTheDocument();
  });

  it("hides the plot itself from assistive tech", () => {
    const { container } = render(
      <ChartContainer aria-label="Tren penjualan">
        <LineChart data={[]} />
      </ChartContainer>,
    );
    const chart = container.querySelector('[data-slot="chart"]');
    expect(chart?.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  // Recharts measures its parent, so a height has to be stated somewhere or
  // the chart collapses to zero.
  it("states a height", () => {
    const { container } = render(
      <ChartContainer aria-label="Tren" height={320}>
        <LineChart data={[]} />
      </ChartContainer>,
    );
    expect(container.querySelector('[data-slot="chart"]')).toHaveStyle({
      height: "320px",
    });
  });
});

describe("<ChartTooltipContent />", () => {
  it("renders nothing while inactive", () => {
    const { container } = render(
      <ChartTooltipContent payload={[{ name: "Penjualan", value: 12 }]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing with an empty payload", () => {
    const { container } = render(<ChartTooltipContent active payload={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists each series with its label and value", () => {
    render(
      <ChartTooltipContent
        active
        label="Oktober"
        payload={[
          { name: "Penjualan", value: 12, color: "var(--chart-1)" },
          { name: "Laba", value: 4, color: "var(--chart-2)" },
        ]}
      />,
    );
    expect(screen.getByText("Oktober")).toBeInTheDocument();
    expect(screen.getByText("Penjualan")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Laba")).toBeInTheDocument();
  });

  it("routes values through the formatter", () => {
    render(
      <ChartTooltipContent
        active
        payload={[{ name: "Penjualan", value: 34295 }]}
        formatValue={(v) => `Rp${v}`}
      />,
    );
    expect(screen.getByText("Rp34295")).toBeInTheDocument();
  });
});
