import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyButton, type CopyButtonProps } from "./copy-button";

const meta: Meta<CopyButtonProps> = {
  title: "Components/CopyButton",
  component: CopyButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive"],
    },
    size: { control: "select", options: ["sm", "default", "lg", "icon", "icon-sm"] },
    withLabel: { control: "boolean" },
    timeout: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    value: "INV-2026-0042",
    variant: "ghost",
    withLabel: false,
    timeout: 2000,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<CopyButtonProps>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { withLabel: true, variant: "outline" },
};

/** The usual home for it — beside the identifier it copies. */
export const BesideAValue: Story = {
  render: (args) => (
    <div className="flex items-center gap-1.5">
      <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
        INV-2026-0042
      </code>
      <CopyButton {...args} size="icon-sm" />
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      {(["ghost", "outline", "secondary", "default"] as const).map((variant) => (
        <CopyButton key={variant} {...args} variant={variant} />
      ))}
    </div>
  ),
};

export const EnglishLabels: Story = {
  args: { copyLabel: "Copy", copiedLabel: "Copied!", withLabel: true, variant: "outline" },
};

/** A long feedback window, to see the copied state without racing it. */
export const SlowReset: Story = {
  args: { timeout: 8000, withLabel: true, variant: "outline" },
};

export const Disabled: Story = {
  args: { disabled: true, withLabel: true, variant: "outline" },
};
