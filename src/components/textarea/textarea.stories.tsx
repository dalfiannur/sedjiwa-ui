import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea, type TextareaProps } from "./textarea";

const meta: Meta<TextareaProps> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: {
    size: "default",
    state: "default",
    placeholder: "Tell us more…",
  },
};

export default meta;
type Story = StoryObj<TextareaProps>;

export const Default: Story = {
  render: (args: TextareaProps) => (
    <div className="w-96">
      <Textarea {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args: TextareaProps) => (
    <div className="flex w-96 flex-col gap-3">
      <Textarea {...args} size="sm" placeholder="Small" />
      <Textarea {...args} size="default" placeholder="Default" />
      <Textarea {...args} size="lg" placeholder="Large" />
    </div>
  ),
};

export const States: Story = {
  render: (args: TextareaProps) => (
    <div className="flex w-96 flex-col gap-3">
      <Textarea {...args} state="default" defaultValue="Default content" />
      <Textarea {...args} state="error" defaultValue="Too short!" />
      <Textarea {...args} state="success" defaultValue="Looks good." />
      <Textarea {...args} state="warning" defaultValue="A bit unusual…" />
      <Textarea {...args} disabled defaultValue="Disabled" />
    </div>
  ),
};

export const Rows: Story = {
  args: { rows: 8 },
  render: (args: TextareaProps) => (
    <div className="w-96">
      <Textarea {...args} />
    </div>
  ),
};
