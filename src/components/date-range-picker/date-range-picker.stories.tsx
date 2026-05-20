import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  DateRangePicker,
  type DateRangePickerProps,
  type DateRangeValue,
} from "./date-range-picker";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../form";

const meta: Meta<DateRangePickerProps> = {
  title: "Components/DateRangePicker",
  component: DateRangePicker,
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
    weekStartsOn: {
      control: "select",
      options: [0, 1, 2, 3, 4, 5, 6],
    },
    numberOfMonths: { control: "number" },
    fromYear: { control: "number" },
    toYear: { control: "number" },
  },
  args: {
    size: "default",
    state: "default",
    loading: false,
    disabled: false,
    locale: "en-US",
    weekStartsOn: 1,
    numberOfMonths: 2,
  },
};
export default meta;

type Story = StoryObj<DateRangePickerProps>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[24rem]">
      <DateRangePicker {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: { defaultValue: { from: "2026-05-10", to: "2026-05-20" } },
  render: (args) => (
    <div className="w-[24rem]">
      <DateRangePicker {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-[24rem] flex-col gap-3">
      <DateRangePicker
        {...args}
        size="sm"
        defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
      />
      <DateRangePicker
        {...args}
        size="default"
        defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
      />
      <DateRangePicker
        {...args}
        size="lg"
        defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
      />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex w-[24rem] flex-col gap-3">
      <DateRangePicker
        {...args}
        state="default"
        defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
      />
      <DateRangePicker
        {...args}
        state="error"
        defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
      />
      <DateRangePicker
        {...args}
        state="success"
        defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
      />
      <DateRangePicker
        {...args}
        state="warning"
        defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
      />
      <DateRangePicker
        {...args}
        disabled
        defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
      />
      <DateRangePicker
        {...args}
        loading
        defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
      />
    </div>
  ),
};

export const SingleMonth: Story = {
  args: {
    numberOfMonths: 1,
    defaultValue: { from: "2026-05-10", to: "2026-05-20" },
  },
  render: (args) => (
    <div className="w-80">
      <DateRangePicker {...args} />
    </div>
  ),
};

export const ConstrainedRange: Story = {
  args: {
    min: "2026-05-01",
    max: "2026-06-30",
    defaultValue: { from: "2026-05-10", to: null },
  },
  render: (args) => (
    <div className="w-[24rem]">
      <DateRangePicker {...args} />
    </div>
  ),
};

export const IndonesianLocale: Story = {
  args: {
    locale: "id-ID",
    placeholder: "Pilih rentang tanggal",
    defaultValue: { from: "2026-08-15", to: "2026-08-20" },
  },
  render: (args) => (
    <div className="w-[24rem]">
      <DateRangePicker {...args} />
    </div>
  ),
};

export const ControlledExample: Story = {
  render: (args) => {
    function ControlledExample() {
      const [val, setVal] = useState<DateRangeValue>({ from: null, to: null });
      return (
        <div className="flex w-[24rem] flex-col gap-3">
          <DateRangePicker {...args} value={val} onValueChange={setVal} />
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() =>
                setVal({ from: "2026-08-17", to: "2026-08-21" })
              }
              className="rounded border px-2 py-1"
            >
              Independence week
            </button>
            <button
              type="button"
              onClick={() =>
                setVal({ from: "2026-12-22", to: "2027-01-05" })
              }
              className="rounded border px-2 py-1"
            >
              Year-end break
            </button>
            <button
              type="button"
              onClick={() => setVal({ from: null, to: null })}
              className="rounded border px-2 py-1"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Current value: <code>{JSON.stringify(val)}</code>
          </p>
        </div>
      );
    }
    return <ControlledExample />;
  },
};

export const InRHFForm: Story = {
  render: (args) => {
    function RHFExample() {
      const form = useForm<{ vacation: DateRangeValue }>({
        defaultValues: { vacation: { from: null, to: null } },
      });
      const onSubmit = (data: { vacation: DateRangeValue }) => {
        alert(`Submitted: ${JSON.stringify(data)}`);
      };
      return (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-[24rem] flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="vacation"
              rules={{
                validate: (v) =>
                  v.from && v.to ? true : "Pick a date range",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vacation</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      {...args}
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>
                    Pick the start and end dates of your trip.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              className="rounded-md border bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              Submit
            </button>
          </form>
        </Form>
      );
    }
    return <RHFExample />;
  },
};
