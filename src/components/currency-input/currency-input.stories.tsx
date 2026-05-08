import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { CurrencyInput, type CurrencyInputProps } from "./currency-input";
import { Input } from "../input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../form";

const meta: Meta<CurrencyInputProps> = {
  title: "Components/CurrencyInput",
  component: CurrencyInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    currency: { control: "select", options: ["IDR", "USD"] },
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    allowNegative: { control: "boolean" },
    decimals: { control: "number" },
    min: { control: "number" },
    max: { control: "number" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: {
    currency: "IDR",
    size: "default",
    state: "default",
    allowNegative: false,
    loading: false,
    disabled: false,
    readOnly: false,
  },
};
export default meta;

type Story = StoryObj<CurrencyInputProps>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <CurrencyInput {...args} placeholder="0" />
    </div>
  ),
};

export const USDPreset: Story = {
  args: { currency: "USD" },
  render: (args) => (
    <div className="w-80">
      <CurrencyInput {...args} placeholder="0.00" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-3">
      <CurrencyInput {...args} size="sm" placeholder="Small" />
      <CurrencyInput {...args} size="default" placeholder="Default" />
      <CurrencyInput {...args} size="lg" placeholder="Large" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-3">
      <CurrencyInput {...args} state="default" defaultValue={1234567} />
      <CurrencyInput {...args} state="error" defaultValue={50} />
      <CurrencyInput {...args} state="success" defaultValue={500000} />
      <CurrencyInput {...args} state="warning" defaultValue={99} />
      <CurrencyInput {...args} disabled defaultValue={1000} />
      <CurrencyInput {...args} loading defaultValue={1000} />
    </div>
  ),
};

export const WithCustomConfig: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-3">
      <CurrencyInput
        {...args}
        currency={{
          currency: "EUR",
          locale: "en-US",
          symbol: "€",
          decimals: 2,
        }}
        defaultValue={1234.5}
      />
      <CurrencyInput
        {...args}
        currency={{ currency: "JPY", locale: "ja-JP", symbol: "¥", decimals: 0 }}
        defaultValue={123456}
      />
    </div>
  ),
};

export const AllowNegative: Story = {
  args: { allowNegative: true },
  render: (args) => (
    <div className="w-80">
      <CurrencyInput {...args} defaultValue={-250000} placeholder="0" />
    </div>
  ),
};

export const WithMinMaxClamp: Story = {
  args: { min: 1000, max: 10000000 },
  render: (args) => (
    <div className="w-80">
      <CurrencyInput {...args} placeholder="Between 1.000 and 10.000.000" />
    </div>
  ),
};

export const WithClearAction: Story = {
  render: (args) => {
    const [val, setVal] = useState<number | null>(1500000);
    return (
      <div className="w-80">
        <CurrencyInput {...args} value={val} onValueChange={setVal}>
          {val !== null ? (
            <Input.Action aria-label="Clear" onClick={() => setVal(null)}>
              <X />
            </Input.Action>
          ) : null}
        </CurrencyInput>
      </div>
    );
  },
};

export const InRHFForm: Story = {
  render: (args) => {
    function RHFExample() {
      const form = useForm<{ amount: number | null }>({
        defaultValues: { amount: null },
      });
      const onSubmit = (data: { amount: number | null }) => {
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
              name="amount"
              rules={{
                required: "Amount is required",
                validate: (v) =>
                  v !== null && v >= 1000 ? true : "Minimum is 1.000",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Top-up amount</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      {...args}
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>Minimum top-up is Rp 1.000.</FormDescription>
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

export const LoadingState: Story = {
  args: { loading: true },
  render: (args) => (
    <div className="w-80">
      <CurrencyInput {...args} defaultValue={1234567} />
    </div>
  ),
};

export const ControlledExample: Story = {
  render: (args) => {
    function ControlledExample() {
      const [val, setVal] = useState<number | null>(0);
      return (
        <div className="flex w-80 flex-col gap-3">
          <CurrencyInput {...args} value={val} onValueChange={setVal} />
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setVal(1000)}
              className="rounded border px-2 py-1"
            >
              Set 1.000
            </button>
            <button
              type="button"
              onClick={() => setVal(50000000)}
              className="rounded border px-2 py-1"
            >
              Set 50.000.000
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
            Current value: <code>{val === null ? "null" : String(val)}</code>
          </p>
        </div>
      );
    }
    return <ControlledExample />;
  },
};
