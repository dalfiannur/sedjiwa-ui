import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Calendar, type CalendarProps } from "./calendar";

const meta: Meta<CalendarProps> = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<CalendarProps>;

/** Inline calendar with per-day toggle selection (mode="multiple"). */
export const Multiple: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[]>([]);
    return (
      <div className="flex flex-col items-center gap-3">
        <Calendar mode="multiple" value={dates} onSelect={setDates} />
        <p className="text-muted-foreground text-sm">
          {dates.length} hari terpilih
        </p>
      </div>
    );
  },
};

/** Inline single-date calendar (previously only reachable through DatePicker). */
export const Single: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    return <Calendar mode="single" value={date} onSelect={setDate} />;
  },
};
