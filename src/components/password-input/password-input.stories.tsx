import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PasswordInput, type PasswordInputProps } from "./password-input";
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

const meta: Meta<PasswordInputProps> = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    showToggle: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: {
    size: "default",
    state: "default",
    showToggle: true,
    loading: false,
    disabled: false,
    readOnly: false,
  },
};
export default meta;

type Story = StoryObj<PasswordInputProps>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <PasswordInput {...args} aria-label="Kata sandi" placeholder="••••••••" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="w-80 space-y-2">
      <Label htmlFor="pw-labelled">Kata sandi</Label>
      <PasswordInput {...args} id="pw-labelled" placeholder="••••••••" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="w-80 space-y-3">
      {(["sm", "default", "lg"] as const).map((size) => (
        <PasswordInput
          key={size}
          {...args}
          size={size}
          aria-label={`Kata sandi ${size}`}
          placeholder={size}
        />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="w-80 space-y-3">
      {(["default", "error", "success", "warning"] as const).map((state) => (
        <PasswordInput
          key={state}
          {...args}
          state={state}
          aria-label={`Kata sandi ${state}`}
          defaultValue="rahasia123"
        />
      ))}
    </div>
  ),
};

/** No reveal button — the point of a confirmation field is that you retype it. */
export const NoToggle: Story = {
  args: { showToggle: false },
  render: (args) => (
    <div className="w-80">
      <PasswordInput
        {...args}
        aria-label="Ulangi kata sandi"
        autoComplete="new-password"
        placeholder="Ulangi kata sandi"
      />
    </div>
  ),
};

/** The reveal state can be lifted — here both fields unmask together. */
export const ControlledVisibility: Story = {
  render: (args) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="w-80 space-y-3">
        <PasswordInput
          {...args}
          aria-label="Kata sandi baru"
          autoComplete="new-password"
          visible={visible}
          onVisibleChange={setVisible}
          placeholder="Kata sandi baru"
        />
        <PasswordInput
          {...args}
          aria-label="Ulangi kata sandi baru"
          autoComplete="new-password"
          visible={visible}
          onVisibleChange={setVisible}
          placeholder="Ulangi kata sandi baru"
        />
      </div>
    );
  },
};

export const EnglishLabels: Story = {
  args: { showLabel: "Show password", hideLabel: "Hide password" },
  render: (args) => (
    <div className="w-80">
      <PasswordInput {...args} aria-label="Password" placeholder="••••••••" />
    </div>
  ),
};

export const InRHFForm: Story = {
  render: () => {
    type Values = { password: string };
    const form = useForm<Values>({ defaultValues: { password: "" } });
    return (
      <Form {...form}>
        <form
          className="w-80 space-y-4"
          onSubmit={form.handleSubmit(() => undefined)}
        >
          <FormField
            control={form.control}
            name="password"
            rules={{ minLength: { value: 8, message: "Minimal 8 karakter" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata sandi</FormLabel>
                <FormControl>
                  <PasswordInput {...field} autoComplete="new-password" />
                </FormControl>
                <FormDescription>Minimal 8 karakter.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  },
};
