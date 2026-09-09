import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartLegend, ChartLegendItem } from "./chart-legend";

const meta: Meta<typeof ChartLegend> = {
  title: "Data Display/ChartLegend",
  component: ChartLegend,
};
export default meta;

type Story = StoryObj<typeof ChartLegend>;

/** Under a chart: the pairs that say which colour is which series. */
export const Default: Story = {
  render: () => (
    <ChartLegend>
      <ChartLegendItem label="Penjualan" color="var(--chart-1)" />
      <ChartLegendItem label="Laba" color="var(--chart-5)" />
    </ChartLegend>
  ),
};

/** The same entry carrying its figure. Used where the legend *is* the
 *  readout — the Customers card pairs two of these beside a donut. */
export const WithValues: Story = {
  render: () => (
    <ChartLegend className="justify-start gap-x-12">
      <ChartLegendItem
        label="Pelanggan baru"
        value="34.249"
        color="var(--chart-1)"
      />
      <ChartLegendItem label="Berulang" value="1.420" color="var(--chart-2)" />
    </ChartLegend>
  ),
};

/** Colours come from `--chart-1` … `--chart-5`, which are contrast-checked in
 *  both themes. Past five, series want a different encoding than colour. */
export const FullRamp: Story = {
  render: () => (
    <ChartLegend>
      {[1, 2, 3, 4, 5].map((n) => (
        <ChartLegendItem
          key={n}
          label={`Seri ${n}`}
          color={`var(--chart-${n})`}
        />
      ))}
    </ChartLegend>
  ),
};
