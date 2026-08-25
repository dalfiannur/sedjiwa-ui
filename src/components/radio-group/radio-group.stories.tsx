import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, RadioGroupItem, type RadioGroupProps } from "./radio-group";
import { Label } from "../label";

const meta: Meta<RadioGroupProps> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
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
type Story = StoryObj<RadioGroupProps>;

export const Default: Story = {
  render: (args: RadioGroupProps) => (
    <RadioGroup defaultValue="email" {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="r-email" value="email" />
        <Label htmlFor="r-email">Email</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="r-sms" value="sms" />
        <Label htmlFor="r-sms">SMS</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="r-push" value="push" />
        <Label htmlFor="r-push">Push notification</Label>
      </div>
    </RadioGroup>
  ),
};

export const States: Story = {
  render: (args: RadioGroupProps) => (
    <div className="grid grid-cols-2 gap-6">
      {(["default", "error", "success", "warning"] as const).map((tone) => (
        <RadioGroup key={tone} {...args} state={tone} defaultValue="a">
          <Label className="text-xs uppercase tracking-wider">{tone}</Label>
          <div className="flex items-center gap-2">
            <RadioGroupItem id={`r-${tone}-a`} value="a" />
            <Label htmlFor={`r-${tone}-a`}>Option A</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id={`r-${tone}-b`} value="b" />
            <Label htmlFor={`r-${tone}-b`}>Option B</Label>
          </div>
        </RadioGroup>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args: RadioGroupProps) => (
    <div className="flex gap-8">
      <RadioGroup {...args} size="sm" defaultValue="a">
        <Label className="text-xs uppercase tracking-wider">Small</Label>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="rs-sm-a" value="a" />
          <Label htmlFor="rs-sm-a">Option A</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="rs-sm-b" value="b" />
          <Label htmlFor="rs-sm-b">Option B</Label>
        </div>
      </RadioGroup>
      <RadioGroup {...args} size="default" defaultValue="a">
        <Label className="text-xs uppercase tracking-wider">Default</Label>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="rs-d-a" value="a" />
          <Label htmlFor="rs-d-a">Option A</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="rs-d-b" value="b" />
          <Label htmlFor="rs-d-b">Option B</Label>
        </div>
      </RadioGroup>
      <RadioGroup {...args} size="lg" defaultValue="a">
        <Label className="text-xs uppercase tracking-wider">Large</Label>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="rs-lg-a" value="a" />
          <Label htmlFor="rs-lg-a">Option A</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="rs-lg-b" value="b" />
          <Label htmlFor="rs-lg-b">Option B</Label>
        </div>
      </RadioGroup>
    </div>
  ),
};
