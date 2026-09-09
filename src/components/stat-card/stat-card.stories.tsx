import type { Meta, StoryObj } from "@storybook/react-vite";
import { BoxIcon, ChartLineIcon, HistoryIcon, UsersIcon } from "lucide-react";
import { StatCard, type StatCardProps } from "./stat-card";
import { TrendIndicator } from "../trend-indicator";

const meta: Meta<typeof StatCard> = {
  title: "Data Display/StatCard",
  component: StatCard,
  argTypes: {
    tone: {
      control: "select",
      options: ["primary", "success", "warning", "destructive", "info", "neutral"],
    },
  },
  args: {
    label: "Total Pengguna",
    value: "40.689",
    tone: "primary",
  },
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  render: (args: StatCardProps) => (
    <div className="w-72">
      <StatCard
        {...args}
        icon={<UsersIcon />}
        trend={<TrendIndicator value={8.5} label="dari kemarin" />}
      />
    </div>
  ),
};

/** The row from the dashboard it was lifted from. Note the third card: sales
 *  fell, so its trend is negative under the default `up` polarity. */
export const DashboardRow: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Pengguna"
        value="40.689"
        tone="primary"
        icon={<UsersIcon />}
        trend={<TrendIndicator value={8.5} label="dari kemarin" />}
      />
      <StatCard
        label="Total Order"
        value="10.293"
        tone="warning"
        icon={<BoxIcon />}
        trend={<TrendIndicator value={1.3} label="dari minggu lalu" />}
      />
      <StatCard
        label="Total Penjualan"
        value="Rp89.000.000"
        tone="success"
        icon={<ChartLineIcon />}
        trend={<TrendIndicator value={-4.3} label="dari kemarin" />}
      />
      <StatCard
        label="Order Tertunda"
        value="2.040"
        tone="destructive"
        icon={<HistoryIcon />}
        trend={<TrendIndicator value={1.8} polarity="down" label="dari kemarin" />}
      />
    </div>
  ),
};

/** Everything is optional except the label and the value. */
export const Bare: Story = {
  render: () => (
    <div className="w-72">
      <StatCard label="Batang terpakai" value="1.284" />
    </div>
  ),
};
