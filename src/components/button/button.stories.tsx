import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ArrowRight, Download, Mail, Plus, Trash2 } from "lucide-react";
import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
    },
    asChild: { control: "boolean" },
    loading: { control: "boolean" },
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
    onClick: { action: "clicked" },
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    loading: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="default">Default</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>
        <Mail /> Send email
      </Button>
      <Button {...args} variant="outline">
        Continue <ArrowRight />
      </Button>
      <Button {...args} variant="destructive">
        <Trash2 /> Delete
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="icon-sm" variant="outline" aria-label="Add">
        <Plus />
      </Button>
      <Button {...args} size="icon" variant="outline" aria-label="Add">
        <Plus />
      </Button>
      <Button {...args} size="icon-lg" variant="outline" aria-label="Add">
        <Plus />
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  args: { loading: true, children: "Saving…" },
};

export const LoadingVariants: Story = {
  args: { loading: true },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="secondary">Secondary</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};

export const Pressed: Story = {
  render: (args) => {
    const [on, setOn] = useState(false);
    return (
      <Button
        {...args}
        variant="outline"
        pressed={on}
        onClick={() => setOn((v) => !v)}
      >
        {on ? "Pressed" : "Press me"}
      </Button>
    );
  },
};

export const AsChildLink: Story = {
  args: {
    asChild: true,
    variant: "link",
    children: (
      <a href="https://storybook.js.org" target="_blank" rel="noreferrer">
        Open Storybook docs
      </a>
    ),
  },
};

export const FullWidth: Story = {
  parameters: { layout: "padded" },
  args: {
    className: "w-full",
    children: (
      <>
        <Download /> Download report
      </>
    ),
  },
};
