import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd, type KbdProps } from "./kbd";
import { Input } from "../input";
import { Search } from "lucide-react";

const meta: Meta<KbdProps> = {
  title: "Components/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    keys: { control: "text" },
  },
  args: { size: "default" },
};
export default meta;

type Story = StoryObj<KbdProps>;

/** `mod` renders ⌘ on a Mac and Ctrl everywhere else — one string, both right. */
export const Default: Story = {
  args: { keys: "mod+k" },
};

export const Modifiers: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      {["mod+k", "mod+shift+p", "alt+enter", "shift+tab"].map((keys) => (
        <div key={keys} className="flex items-center gap-3">
          <Kbd {...args} keys={keys} />
          <code className="text-muted-foreground text-xs">{keys}</code>
        </div>
      ))}
    </div>
  ),
};

export const NamedKeys: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {["esc", "enter", "space", "backspace", "up", "down", "pageup"].map(
        (keys) => (
          <Kbd key={keys} {...args} keys={keys} />
        ),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Kbd key={size} size={size} keys="mod+k" />
      ))}
    </div>
  ),
};

/** Free-form children when the shortcut notation does not fit. */
export const FreeForm: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Kbd {...args}>Fn</Kbd>
      <Kbd {...args}>F5</Kbd>
    </div>
  ),
};

/** The hint that pairs with `useKeyboardShortcut` in a search field. */
export const InSearchField: Story = {
  render: (args) => (
    <div className="w-80">
      <Input.Root appearance="search">
        <Input.LeadingIcon>
          <Search />
        </Input.LeadingIcon>
        <Input.Field placeholder="Cari…" />
        <Input.TrailingAddon>
          <Kbd {...args} keys="mod+k" size="sm" />
        </Input.TrailingAddon>
      </Input.Root>
    </div>
  ),
};
