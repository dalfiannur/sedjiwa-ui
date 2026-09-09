import type { Meta, StoryObj } from "@storybook/react-vite";
import { AreaChart } from "./area-chart";
import { LineChart } from "./line-chart";
import { DonutChart } from "./donut-chart";
import { ChartLegend, ChartLegendItem } from "../chart-legend";
import { Card, CardContent, CardHeader, CardTitle } from "../card";

const meta: Meta = { title: "Data Display/Chart" };
export default meta;

type Story = StoryObj;

const REVENUE = [
  { bulan: "5k", penjualan: 32, laba: 58 },
  { bulan: "10k", penjualan: 38, laba: 44 },
  { bulan: "15k", penjualan: 34, laba: 30 },
  { bulan: "20k", penjualan: 41, laba: 36 },
  { bulan: "25k", penjualan: 52, laba: 48 },
  { bulan: "30k", penjualan: 46, laba: 40 },
  { bulan: "35k", penjualan: 84, laba: 34 },
  { bulan: "40k", penjualan: 48, laba: 52 },
  { bulan: "45k", penjualan: 68, laba: 38 },
  { bulan: "50k", penjualan: 44, laba: 42 },
  { bulan: "55k", penjualan: 40, laba: 78 },
  { bulan: "60k", penjualan: 36, laba: 62 },
];

const ANALYTICS = [
  { tahun: "2015", penjualan: 24, laba: 6 },
  { tahun: "2016", penjualan: 66, laba: 58 },
  { tahun: "2017", penjualan: 58, laba: 40 },
  { tahun: "2018", penjualan: 48, laba: 26 },
  { tahun: "2026", penjualan: 96, laba: 88 },
];

const SERIES = [
  { key: "penjualan", label: "Penjualan" },
  { key: "laba", label: "Laba", color: "var(--chart-5)" },
];

/** The Revenue panel: two overlaid areas with a legend beneath. */
export const Area: Story = {
  render: () => (
    <Card className="w-[46rem]">
      <CardHeader>
        <CardTitle>Pendapatan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AreaChart
          data={REVENUE}
          xKey="bulan"
          series={SERIES}
          height={280}
          aria-label="Penjualan dan laba sepanjang 2026, penjualan memuncak di 35k unit"
        />
        <ChartLegend>
          <ChartLegendItem label="Penjualan" color="var(--chart-1)" />
          <ChartLegendItem label="Laba" color="var(--chart-5)" />
        </ChartLegend>
      </CardContent>
    </Card>
  ),
};

/** Stacked reads the series as parts of a whole rather than as rivals. */
export const AreaStacked: Story = {
  render: () => (
    <div className="w-[46rem]">
      <AreaChart
        data={REVENUE}
        xKey="bulan"
        series={SERIES}
        stacked
        height={260}
        aria-label="Penjualan dan laba ditumpuk, total tertinggi di 35k unit"
      />
    </div>
  ),
};

/** The Sales Analytics panel: a sparse series, so every reading gets a dot. */
export const Line: Story = {
  render: () => (
    <Card className="w-[28rem]">
      <CardHeader>
        <CardTitle>Analitik Penjualan</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart
          data={ANALYTICS}
          xKey="tahun"
          series={SERIES}
          height={220}
          aria-label="Penjualan naik dari 24 pada 2015 ke 96 pada 2026"
        />
      </CardContent>
    </Card>
  ),
};

/** The Customers panel: a donut whose slices are named by the legend beside
 *  it, since slice labels collide at this size. */
export const Donut: Story = {
  render: () => (
    <Card className="w-[22rem]">
      <CardHeader>
        <CardTitle>Pelanggan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <DonutChart
          data={[
            { label: "Pelanggan baru", value: 34249 },
            { label: "Berulang", value: 1420, color: "var(--chart-2)" },
          ]}
          height={200}
          aria-label="34.249 pelanggan baru berbanding 1.420 pelanggan berulang"
        />
        <ChartLegend className="justify-start gap-x-10">
          <ChartLegendItem
            label="Pelanggan baru"
            value="34.249"
            color="var(--chart-1)"
          />
          <ChartLegendItem
            label="Berulang"
            value="1.420"
            color="var(--chart-2)"
          />
        </ChartLegend>
      </CardContent>
    </Card>
  ),
};
