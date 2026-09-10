import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PinInput, type PinInputProps } from "./pin-input";
import { Label } from "../label";

const meta: Meta<PinInputProps> = {
  title: "Components/PinInput",
  component: PinInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    length: { control: "number" },
    type: { control: "inline-radio", options: ["numeric", "alphanumeric"] },
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    mask: { control: "boolean" },
    uppercase: { control: "boolean" },
    oneTimeCode: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    length: 6,
    type: "numeric",
    size: "default",
    state: "default",
    mask: false,
    uppercase: true,
    oneTimeCode: false,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<PinInputProps>;

export const Default: Story = {
  render: (args) => <PinInput {...args} aria-label="Kode verifikasi" />,
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label id="otp-label">Kode verifikasi</Label>
      <PinInput {...args} aria-labelledby="otp-label" />
    </div>
  ),
};

/** Four boxes for a PIN, masked the way a PIN should be. */
export const MaskedPin: Story = {
  args: { length: 4, mask: true },
  render: (args) => <PinInput {...args} aria-label="PIN" />,
};

/** Turn this on only for codes that actually arrive by SMS. */
export const SmsAutofill: Story = {
  args: { oneTimeCode: true },
  render: (args) => <PinInput {...args} aria-label="Kode dari SMS" />,
};

export const Alphanumeric: Story = {
  args: { type: "alphanumeric", length: 5 },
  render: (args) => <PinInput {...args} aria-label="Kode undangan" />,
};

export const Sizes: Story = {
  render: (args) => (
    <div className="space-y-3">
      {(["sm", "default", "lg"] as const).map((size) => (
        <PinInput
          key={size}
          {...args}
          size={size}
          length={4}
          aria-label={`Kode ${size}`}
        />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="space-y-3">
      {(["default", "error", "success", "warning"] as const).map((state) => (
        <PinInput
          key={state}
          {...args}
          state={state}
          length={4}
          defaultValue="1234"
          aria-label={`Kode ${state}`}
        />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { length: 4, defaultValue: "1234", disabled: true },
  render: (args) => <PinInput {...args} aria-label="Kode" />,
};

export const Controlled: Story = {
  render: (args) => {
    const [code, setCode] = useState("");
    const [submitted, setSubmitted] = useState<string | null>(null);
    return (
      <div className="space-y-3">
        <PinInput
          {...args}
          length={6}
          aria-label="Kode verifikasi"
          value={code}
          onValueChange={setCode}
          onComplete={setSubmitted}
        />
        <p className="text-sm text-muted-foreground">
          {submitted
            ? `Terkirim: ${submitted}`
            : `${code.length} dari 6 terisi`}
        </p>
      </div>
    );
  },
};
