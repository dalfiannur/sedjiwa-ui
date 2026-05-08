import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Search,
  X,
} from "lucide-react";
import { Input, type InputRootProps } from "./input";

const meta: Meta<InputRootProps> = {
  title: "Components/Input",
  component: Input.Root,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: {
    size: "default",
    state: "default",
    loading: false,
    disabled: false,
    readOnly: false,
  },
};

export default meta;
type Story = StoryObj<InputRootProps>;

export const Default: Story = {
  render: (args: InputRootProps) => (
    <div className="w-80">
      <Input.Root {...args}>
        <Input.Field placeholder="Type something…" />
      </Input.Root>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args: InputRootProps) => (
    <div className="flex w-80 flex-col gap-3">
      <Input.Root {...args} size="sm">
        <Input.Field placeholder="Small" />
      </Input.Root>
      <Input.Root {...args} size="default">
        <Input.Field placeholder="Default" />
      </Input.Root>
      <Input.Root {...args} size="lg">
        <Input.Field placeholder="Large" />
      </Input.Root>
    </div>
  ),
};

export const States: Story = {
  render: (args: InputRootProps) => (
    <div className="flex w-80 flex-col gap-3">
      <Input.Root {...args} state="default">
        <Input.Field defaultValue="Default" />
      </Input.Root>
      <Input.Root {...args} state="error">
        <Input.Field defaultValue="not-an-email" />
      </Input.Root>
      <Input.Root {...args} state="success">
        <Input.Field defaultValue="ada@example.com" />
      </Input.Root>
      <Input.Root {...args} state="warning">
        <Input.Field defaultValue="ada@exmple.com" />
      </Input.Root>
      <Input.Root {...args} disabled>
        <Input.Field defaultValue="Disabled" />
      </Input.Root>
      <Input.Root {...args} loading>
        <Input.Field defaultValue="Checking…" />
      </Input.Root>
    </div>
  ),
};

export const WithLeadingIcon: Story = {
  render: (args: InputRootProps) => (
    <div className="w-80">
      <Input.Root {...args}>
        <Input.LeadingIcon>
          <Search />
        </Input.LeadingIcon>
        <Input.Field placeholder="Search anything…" />
      </Input.Root>
    </div>
  ),
};

export const WithTrailingIcon: Story = {
  render: (args: InputRootProps) => (
    <div className="w-80">
      <Input.Root {...args}>
        <Input.Field defaultValue="ada@example.com" />
        <Input.TrailingIcon>
          <Mail />
        </Input.TrailingIcon>
      </Input.Root>
    </div>
  ),
};

export const WithBothAddons: Story = {
  render: (args: InputRootProps) => (
    <div className="w-96">
      <Input.Root {...args}>
        <Input.LeadingAddon>https://</Input.LeadingAddon>
        <Input.Field placeholder="example" />
        <Input.TrailingAddon>.com</Input.TrailingAddon>
      </Input.Root>
    </div>
  ),
};

export const WithAction: Story = {
  render: (args: InputRootProps) => {
    const [val, setVal] = useState("Some value");
    return (
      <div className="w-80">
        <Input.Root {...args}>
          <Input.Field value={val} onChange={(e) => setVal(e.target.value)} />
          {val && (
            <Input.Action onClick={() => setVal("")} aria-label="Clear">
              <X />
            </Input.Action>
          )}
        </Input.Root>
      </div>
    );
  },
};

export const PasswordReveal: Story = {
  render: (args: InputRootProps) => {
    const [show, setShow] = useState(false);
    return (
      <div className="w-80">
        <Input.Root {...args}>
          <Input.LeadingIcon>
            <KeyRound />
          </Input.LeadingIcon>
          <Input.Field
            type={show ? "text" : "password"}
            defaultValue="hunter2"
          />
          <Input.Action
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff /> : <Eye />}
          </Input.Action>
        </Input.Root>
      </div>
    );
  },
};

export const ApiKeyCopy: Story = {
  render: (args: InputRootProps) => (
    <div className="w-96">
      <Input.Root {...args} readOnly>
        <Input.LeadingIcon>
          <KeyRound />
        </Input.LeadingIcon>
        <Input.Field defaultValue="sk_live_abc123def456ghi789" readOnly />
        <Input.Action aria-label="Copy">
          <Copy />
        </Input.Action>
      </Input.Root>
    </div>
  ),
};

export const ErrorWithAutoIcon: Story = {
  args: { state: "error" },
  render: (args: InputRootProps) => (
    <div className="w-80">
      <Input.Root {...args}>
        <Input.LeadingIcon>
          <Mail />
        </Input.LeadingIcon>
        <Input.Field defaultValue="not-an-email" />
      </Input.Root>
    </div>
  ),
};

export const LoadingDuringValidation: Story = {
  args: { loading: true },
  render: (args: InputRootProps) => (
    <div className="w-80">
      <Input.Root {...args}>
        <Input.LeadingIcon>
          <Mail />
        </Input.LeadingIcon>
        <Input.Field defaultValue="checking-availability@example.com" />
      </Input.Root>
    </div>
  ),
};
