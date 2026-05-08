import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Switch, type SwitchProps } from "./switch";
import { Label } from "../label";
import { Button } from "../button";

const meta: Meta<SwitchProps> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "default",
    state: "default",
    loading: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<SwitchProps>;

export const Default: Story = {
  render: (args: SwitchProps) => (
    <div className="flex items-center gap-3">
      <Switch {...args} id="autosave" />
      <Label htmlFor="autosave">Autosave</Label>
    </div>
  ),
};

export const States: Story = {
  render: (args: SwitchProps) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Switch {...args} state="default" defaultChecked id="s-d" />
        <Label htmlFor="s-d">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch {...args} state="error" defaultChecked id="s-e" />
        <Label htmlFor="s-e">Error</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch {...args} state="success" defaultChecked id="s-s" />
        <Label htmlFor="s-s">Success</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch {...args} state="warning" defaultChecked id="s-w" />
        <Label htmlFor="s-w">Warning</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch {...args} disabled id="s-dis" />
        <Label htmlFor="s-dis">Disabled</Label>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args: SwitchProps) => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Switch {...args} size="sm" defaultChecked id="sw-sm" />
        <Label htmlFor="sw-sm">Small</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch {...args} size="default" defaultChecked id="sw-d" />
        <Label htmlFor="sw-d">Default</Label>
      </div>
    </div>
  ),
};

export const LoadingDuringAutosave: Story = {
  render: (args: SwitchProps) => {
    const [on, setOn] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleChange = (val: boolean) => {
      setLoading(true);
      setTimeout(() => {
        setOn(val);
        setLoading(false);
      }, 1200);
    };
    return (
      <div className="flex items-center gap-3">
        <Switch
          {...args}
          checked={on}
          onCheckedChange={handleChange}
          loading={loading}
          id="auto"
        />
        <Label htmlFor="auto">
          {loading ? "Saving…" : on ? "Autosave on" : "Autosave off"}
        </Label>
      </div>
    );
  },
};

export const StaticLoading: Story = {
  args: { loading: true, defaultChecked: true },
  render: (args: SwitchProps) => (
    <div className="flex items-center gap-3">
      <Switch {...args} id="static-loading" />
      <Label htmlFor="static-loading">Static loading</Label>
      <Button size="sm" variant="ghost" disabled>
        toggle locked while loading
      </Button>
    </div>
  ),
};
