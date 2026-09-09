import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrendIndicator, type TrendIndicatorProps } from "./trend-indicator";

const meta: Meta<typeof TrendIndicator> = {
  title: "Data Display/TrendIndicator",
  component: TrendIndicator,
  argTypes: {
    value: { control: { type: "number", step: 0.1 } },
    polarity: { control: "select", options: ["up", "down", "neutral"] },
  },
  args: { value: 8.5, polarity: "up", label: "dari kemarin" },
};
export default meta;

type Story = StoryObj<typeof TrendIndicator>;

export const Default: Story = {};

/** The arrow follows the sign; the colour follows whether that sign is good
 *  news, which is what `polarity` decides. */
export const Polarity: Story = {
  render: (args: TrendIndicatorProps) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground w-40 text-sm">Pendapatan</span>
        <TrendIndicator {...args} value={8.5} polarity="up" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground w-40 text-sm">Pendapatan</span>
        <TrendIndicator {...args} value={-4.3} polarity="up" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground w-40 text-sm">Order ditolak</span>
        <TrendIndicator {...args} value={-4.3} polarity="down" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground w-40 text-sm">Order ditolak</span>
        <TrendIndicator {...args} value={8.5} polarity="down" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground w-40 text-sm">Tidak bergerak</span>
        <TrendIndicator {...args} value={0} />
      </div>
    </div>
  ),
};

/** Anything can go through `formatValue` — the default only strips the sign
 *  and appends a percent. */
export const CustomFormat: Story = {
  args: {
    value: 128,
    label: "dari minggu lalu",
    formatValue: (v: number) => `${Math.abs(v)} batang`,
  },
};
