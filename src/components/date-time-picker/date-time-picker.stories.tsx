import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button";
import { DateTimePicker, type DateTimePickerProps } from "./date-time-picker";

const meta: Meta<DateTimePickerProps> = {
  title: "Components/DateTimePicker",
  component: DateTimePicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<DateTimePickerProps>;

// Closed initially with a Button to open it, mirroring real usage.
export const Default: Story = {
  render: () => {
    function DefaultExample() {
      const [open, setOpen] = useState(false);
      const [value, setValue] = useState<string | null>(null);
      return (
        <div className="flex flex-col items-start gap-3">
          <Button onClick={() => setOpen(true)}>Open date &amp; time picker</Button>
          <DateTimePicker
            open={open}
            onOpenChange={setOpen}
            value={value}
            onApply={setValue}
          />
          <p className="text-sm text-muted-foreground">
            Current value: <code>{value ?? "null"}</code>
          </p>
        </div>
      );
    }
    return <DefaultExample />;
  },
};

// Mirrors the reference mockup: titled modal, Today shortcut, month label
// with prev/next arrows, day grid, Time select, full-width Apply.
export const AsDrawn: Story = {
  render: () => {
    function AsDrawnExample() {
      const [open, setOpen] = useState(true);
      const [value, setValue] = useState<string | null>("2028-01-10T09:30");
      return (
        <div className="flex flex-col items-start gap-3">
          <Button onClick={() => setOpen(true)}>Open date &amp; time picker</Button>
          <DateTimePicker
            open={open}
            onOpenChange={setOpen}
            value={value}
            onApply={setValue}
            title="Filter Activity Date"
          />
          <p className="text-sm text-muted-foreground">
            Current value: <code>{value ?? "null"}</code>
          </p>
        </div>
      );
    }
    return <AsDrawnExample />;
  },
};

// Indonesian labels and 24-hour time formatting via locale.
export const Indonesian: Story = {
  render: () => {
    function IndonesianExample() {
      const [open, setOpen] = useState(true);
      const [value, setValue] = useState<string | null>("2028-01-10T09:30");
      return (
        <div className="flex flex-col items-start gap-3">
          <Button onClick={() => setOpen(true)}>Buka pemilih tanggal &amp; waktu</Button>
          <DateTimePicker
            open={open}
            onOpenChange={setOpen}
            value={value}
            onApply={setValue}
            title="Pilih tanggal & waktu"
            applyLabel="Terapkan"
            todayLabel="Hari ini"
            timeLabel="Waktu"
            locale="id-ID"
          />
          <p className="text-sm text-muted-foreground">
            Nilai saat ini: <code>{value ?? "null"}</code>
          </p>
        </div>
      );
    }
    return <IndonesianExample />;
  },
};

// timeStep=15 produces four options per hour instead of two.
export const FifteenMinuteSteps: Story = {
  render: () => {
    function FifteenMinuteStepsExample() {
      const [open, setOpen] = useState(true);
      const [value, setValue] = useState<string | null>("2028-01-10T09:15");
      return (
        <div className="flex flex-col items-start gap-3">
          <Button onClick={() => setOpen(true)}>Open date &amp; time picker</Button>
          <DateTimePicker
            open={open}
            onOpenChange={setOpen}
            value={value}
            onApply={setValue}
            timeStep={15}
          />
          <p className="text-sm text-muted-foreground">
            Current value: <code>{value ?? "null"}</code>
          </p>
        </div>
      );
    }
    return <FifteenMinuteStepsExample />;
  },
};

// min/max a few days either side of the value: days outside the window are
// disabled in the Calendar grid.
export const Bounded: Story = {
  render: () => {
    function BoundedExample() {
      const [open, setOpen] = useState(true);
      const [value, setValue] = useState<string | null>("2028-01-10T09:30");
      return (
        <div className="flex flex-col items-start gap-3">
          <Button onClick={() => setOpen(true)}>Open date &amp; time picker</Button>
          <DateTimePicker
            open={open}
            onOpenChange={setOpen}
            value={value}
            onApply={setValue}
            min="2028-01-07"
            max="2028-01-13"
          />
          <p className="text-sm text-muted-foreground">
            Current value: <code>{value ?? "null"}</code>
          </p>
        </div>
      );
    }
    return <BoundedExample />;
  },
};
