import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { LayoutGrid, List, Map, Moon, Sun, SunMoon } from "lucide-react";
import {
  SegmentedControl,
  type SegmentedControlProps,
} from "./segmented-control";
import { Label } from "../label";

const VIEWS = [
  { value: "list", label: "Daftar" },
  { value: "grid", label: "Kisi" },
  { value: "map", label: "Peta" },
];

const meta: Meta<SegmentedControlProps> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    items: VIEWS,
    defaultValue: "list",
    size: "default",
    orientation: "horizontal",
    fullWidth: false,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<SegmentedControlProps>;

export const Default: Story = {
  render: (args) => <SegmentedControl {...args} aria-label="Tampilan" />,
};

export const WithIcons: Story = {
  args: {
    items: [
      { value: "list", label: "Daftar", icon: <List /> },
      { value: "grid", label: "Kisi", icon: <LayoutGrid /> },
      { value: "map", label: "Peta", icon: <Map /> },
    ],
  },
  render: (args) => <SegmentedControl {...args} aria-label="Tampilan" />,
};

/** Icons alone still need names — the label carries them, the glyph decorates. */
export const IconsOnly: Story = {
  args: {
    defaultValue: "system",
    items: [
      { value: "light", label: "Terang", icon: <Sun /> },
      { value: "dark", label: "Gelap", icon: <Moon /> },
      { value: "system", label: "Sistem", icon: <SunMoon /> },
    ],
  },
  render: (args) => (
    <SegmentedControl {...args} aria-label="Tema" itemClassName="px-2.5" />
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      {(["sm", "default", "lg"] as const).map((size) => (
        <SegmentedControl
          key={size}
          {...args}
          size={size}
          aria-label={`Tampilan ${size}`}
        />
      ))}
    </div>
  ),
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <div className="w-96">
      <SegmentedControl {...args} aria-label="Tampilan" />
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => <SegmentedControl {...args} aria-label="Tampilan" />,
};

export const WithDisabledSegment: Story = {
  args: {
    items: [
      { value: "list", label: "Daftar" },
      { value: "grid", label: "Kisi" },
      { value: "map", label: "Peta", disabled: true },
    ],
  },
  render: (args) => <SegmentedControl {...args} aria-label="Tampilan" />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <SegmentedControl {...args} aria-label="Tampilan" />,
};

export const Controlled: Story = {
  render: (args) => {
    const [view, setView] = useState("list");
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="view-control">Tampilan</Label>
          <SegmentedControl
            {...args}
            id="view-control"
            value={view}
            onValueChange={setView}
          />
        </div>
        <p className="text-sm text-muted-foreground">Terpilih: {view}</p>
      </div>
    );
  },
};

/** `count` puts a number after the label; `countTone` flags a bucket that
 *  needs attention. Zero hides the number. */
export const WithCounts: Story = {
  args: {
    "aria-label": "Pemegang",
    defaultValue: "all",
    fullWidth: true,
    items: [
      { value: "all", label: "Semua", count: 24 },
      { value: "mine", label: "Milik saya", count: 4, countTone: "primary" },
      { value: "queue", label: "Antrean", count: 12, countTone: "warning" },
    ],
  },
};
