import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NumberInput, type NumberInputProps } from "./number-input";
import { Input } from "../input";
import { Label } from "../label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../form";

const meta: Meta<NumberInputProps> = {
  title: "Components/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    clampBehavior: { control: "inline-radio", options: ["blur", "none"] },
    decimals: { control: "number" },
    step: { control: "number" },
    min: { control: "number" },
    max: { control: "number" },
    thousandSeparator: { control: "boolean" },
    allowNegative: { control: "boolean" },
    hideControls: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: {
    size: "default",
    state: "default",
    clampBehavior: "blur",
    step: 1,
    thousandSeparator: false,
    allowNegative: false,
    hideControls: false,
    loading: false,
    disabled: false,
    readOnly: false,
  },
};
export default meta;

type Story = StoryObj<NumberInputProps>;

export const Default: Story = {
  render: (args) => (
    <div className="w-64">
      <NumberInput {...args} aria-label="Jumlah" placeholder="0" />
    </div>
  ),
};

export const WithBounds: Story = {
  args: { min: 1, max: 10, defaultValue: 1 },
  render: (args) => (
    <div className="w-64 space-y-2">
      <Label htmlFor="qty">Jumlah tamu</Label>
      <NumberInput {...args} id="qty" />
    </div>
  ),
};

/** Grouping is off by default. Turn it on when the figure is large enough to count. */
export const Grouped: Story = {
  args: { thousandSeparator: true, defaultValue: 1250000 },
  render: (args) => (
    <div className="w-64">
      <NumberInput {...args} aria-label="Populasi" />
    </div>
  ),
};

export const Decimals: Story = {
  args: { decimals: 2, step: 0.25, defaultValue: 1.5 },
  render: (args) => (
    <div className="w-64">
      <NumberInput {...args} aria-label="Berat" />
    </div>
  ),
};

/** A unit reads better as an addon than as part of the value. */
export const WithUnit: Story = {
  args: { min: 0, max: 100, defaultValue: 30 },
  render: (args) => (
    <div className="w-64">
      <NumberInput {...args} aria-label="Diskon">
        <Input.TrailingAddon>%</Input.TrailingAddon>
      </NumberInput>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="w-64 space-y-3">
      {(["sm", "default", "lg"] as const).map((size) => (
        <NumberInput
          key={size}
          {...args}
          size={size}
          aria-label={`Jumlah ${size}`}
          placeholder={size}
        />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="w-64 space-y-3">
      {(["default", "error", "success", "warning"] as const).map((state) => (
        <NumberInput
          key={state}
          {...args}
          state={state}
          aria-label={`Jumlah ${state}`}
          defaultValue={42}
        />
      ))}
    </div>
  ),
};

/** Arrow keys still step; only the buttons go. */
export const NoControls: Story = {
  args: { hideControls: true, defaultValue: 7 },
  render: (args) => (
    <div className="w-64">
      <NumberInput {...args} aria-label="Jumlah" />
    </div>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<number | null>(3);
    return (
      <div className="w-64 space-y-2">
        <NumberInput
          {...args}
          aria-label="Jumlah"
          min={0}
          max={9}
          value={value}
          onValueChange={setValue}
        />
        <p className="text-sm text-muted-foreground">
          Nilai: {value === null ? "kosong" : value}
        </p>
      </div>
    );
  },
};

export const InRHFForm: Story = {
  render: () => {
    type Values = { quantity: number | null };
    const form = useForm<Values>({ defaultValues: { quantity: 1 } });
    return (
      <Form {...form}>
        <form
          className="w-64 space-y-4"
          onSubmit={form.handleSubmit(() => undefined)}
        >
          <FormField
            control={form.control}
            name="quantity"
            rules={{
              validate: (v) =>
                v !== null && v > 0 ? true : "Isi jumlah lebih dari 0",
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah</FormLabel>
                <FormControl>
                  <NumberInput
                    min={0}
                    max={99}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>Maksimal 99 per pesanan.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  },
};
