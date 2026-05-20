import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DatePicker, type DatePickerProps } from "./date-picker";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../form";

const meta: Meta<DatePickerProps> = {
  title: "Components/DatePicker",
  component: DatePicker,
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
  },
};
export default meta;

type Story = StoryObj<DatePickerProps>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <DatePicker {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: { defaultValue: "2026-05-20" },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-3">
      <DatePicker {...args} size="sm" defaultValue="2026-05-20" />
      <DatePicker {...args} size="default" defaultValue="2026-05-20" />
      <DatePicker {...args} size="lg" defaultValue="2026-05-20" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-3">
      <DatePicker {...args} state="default" defaultValue="2026-05-20" />
      <DatePicker {...args} state="error" defaultValue="2026-05-20" />
      <DatePicker {...args} state="success" defaultValue="2026-05-20" />
      <DatePicker {...args} state="warning" defaultValue="2026-05-20" />
      <DatePicker {...args} disabled defaultValue="2026-05-20" />
      <DatePicker {...args} loading defaultValue="2026-05-20" />
    </div>
  ),
};

export const WithMinMax: Story = {
  args: { min: "2026-05-10", max: "2026-05-25", defaultValue: "2026-05-15" },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...args} />
    </div>
  ),
};

export const IndonesianLocale: Story = {
  args: { locale: "id-ID", weekStartsOn: 1, placeholder: "Pilih tanggal" },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...args} />
    </div>
  ),
};

export const SundayWeekStart: Story = {
  args: { weekStartsOn: 0, locale: "en-US", defaultValue: "2026-05-20" },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...args} />
    </div>
  ),
};

export const BirthdayPicker: Story = {
  args: {
    placeholder: "Date of birth",
    locale: "en-US",
    fromYear: 1925,
    toYear: 2026,
    max: "2026-12-31",
  },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...args} />
    </div>
  ),
};

export const ControlledExample: Story = {
  render: (args) => {
    function ControlledExample() {
      const [val, setVal] = useState<string | null>(null);
      return (
        <div className="flex w-80 flex-col gap-3">
          <DatePicker {...args} value={val} onValueChange={setVal} />
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() => setVal("2026-01-01")}
              className="rounded border px-2 py-1"
            >
              New Year
            </button>
            <button
              type="button"
              onClick={() => setVal("2026-08-17")}
              className="rounded border px-2 py-1"
            >
              Independence
            </button>
            <button
              type="button"
              onClick={() => setVal(null)}
              className="rounded border px-2 py-1"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Current value: <code>{val === null ? "null" : val}</code>
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
      const form = useForm<{ birthday: string | null }>({
        defaultValues: { birthday: null },
      });
      const onSubmit = (data: { birthday: string | null }) => {
        alert(`Submitted: ${JSON.stringify(data)}`);
      };
      return (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-80 flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="birthday"
              rules={{ required: "Birthday is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birthday</FormLabel>
                  <FormControl>
                    <DatePicker
                      {...args}
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>Pick any date.</FormDescription>
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
