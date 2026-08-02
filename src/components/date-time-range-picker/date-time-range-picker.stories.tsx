import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  DateTimeRangePicker,
  type DateTimeRangePickerProps,
  type DateTimeRangeValue,
} from "./date-time-range-picker";

const meta: Meta<DateTimeRangePickerProps> = {
  title: "Components/DateTimeRangePicker",
  component: DateTimeRangePicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    min: { control: "text" },
    max: { control: "text" },
    locale: { control: "text" },
    placeholder: { control: "text" },
    timeStep: { control: "number" },
    numberOfMonths: { control: "number" },
    weekStartsOn: { control: "select", options: [0, 1, 2, 3, 4, 5, 6] },
  },
  args: {
    size: "default",
    state: "default",
    loading: false,
    disabled: false,
    locale: "en-US",
    weekStartsOn: 1,
  },
};
export default meta;

type Story = StoryObj<DateTimeRangePickerProps>;

function Controlled({
  initial,
  ...props
}: DateTimeRangePickerProps & { initial?: DateTimeRangeValue }) {
  const [value, setValue] = useState<DateTimeRangeValue>(
    initial ?? { from: null, to: null },
  );
  return (
    <div className="flex w-80 flex-col items-start gap-3">
      <DateTimeRangePicker {...props} value={value} onValueChange={setValue} />
      <p className="text-sm text-muted-foreground">
        Current value: <code>{value.from ?? "null"}</code> →{" "}
        <code>{value.to ?? "null"}</code>
      </p>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

export const WithValue: Story = {
  render: (args) => (
    <Controlled
      {...args}
      initial={{ from: "2028-01-10T09:00", to: "2028-01-12T17:00" }}
    />
  ),
};

// 24-hour clock, Monday-first week, Indonesian labels — the shape the
// consuming app uses for its Dari/Sampai and Mulai/Selesai pairs.
export const Indonesian: Story = {
  args: {
    locale: "id-ID",
    weekStartsOn: 1,
    placeholder: "Pilih rentang tanggal & waktu",
    startTimeLabel: "Mulai",
    endTimeLabel: "Selesai",
    hourLabel: "Jam",
    minuteLabel: "Menit",
  },
  render: (args) => (
    <Controlled
      {...args}
      initial={{ from: "2028-01-10T09:00", to: "2028-01-12T17:00" }}
    />
  ),
};

// timeStep=15 produces four options per hour instead of two, on both ends.
export const FifteenMinuteSteps: Story = {
  args: { timeStep: 15 },
  render: (args) => (
    <Controlled
      {...args}
      initial={{ from: "2028-01-10T09:15", to: "2028-01-10T11:45" }}
    />
  ),
};

// min/max a few days either side: days outside the window are disabled.
export const Bounded: Story = {
  args: { min: "2028-01-07", max: "2028-01-13" },
  render: (args) => (
    <Controlled
      {...args}
      initial={{ from: "2028-01-10T09:00", to: "2028-01-12T17:00" }}
    />
  ),
};
