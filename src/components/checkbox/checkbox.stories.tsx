import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox, type CheckboxProps } from "./checkbox";
import { Label } from "../label";

const meta: Meta<CheckboxProps> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    disabled: { control: "boolean" },
  },
  args: { size: "default", state: "default", disabled: false },
};

export default meta;
type Story = StoryObj<CheckboxProps>;

export const Default: Story = {
  render: (args: CheckboxProps) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="terms" />
      <Label htmlFor="terms">Accept the terms</Label>
    </div>
  ),
};

export const States: Story = {
  render: (args: CheckboxProps) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox {...args} state="default" id="d" />
        <Label htmlFor="d">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox {...args} state="error" id="e" />
        <Label htmlFor="e">Error</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox {...args} state="success" id="s" defaultChecked />
        <Label htmlFor="s">Success</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox {...args} state="warning" id="w" defaultChecked />
        <Label htmlFor="w">Warning</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox {...args} disabled id="dis" />
        <Label htmlFor="dis">Disabled</Label>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args: CheckboxProps) => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Checkbox {...args} size="sm" id="cb-sm" defaultChecked />
        <Label htmlFor="cb-sm">Small</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox {...args} size="default" id="cb-d" defaultChecked />
        <Label htmlFor="cb-d">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox {...args} size="lg" id="cb-lg" defaultChecked />
        <Label htmlFor="cb-lg">Large</Label>
      </div>
    </div>
  ),
};

export const Indeterminate: Story = {
  render: (args: CheckboxProps) => {
    const [state, setState] = useState<boolean | "indeterminate">(
      "indeterminate",
    );
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          {...args}
          checked={state}
          onCheckedChange={(c) => setState(c)}
          id="indet"
        />
        <Label htmlFor="indet">
          {state === "indeterminate"
            ? "Some selected"
            : state
              ? "All selected"
              : "None selected"}
        </Label>
      </div>
    );
  },
};
