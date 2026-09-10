import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Slider, type SliderProps, type SliderValue } from "./slider";
import { Label } from "../label";

const meta: Meta<SliderProps> = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "default",
    orientation: "horizontal",
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<SliderProps>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <Slider {...args} aria-label="Volume" defaultValue={50} />
    </div>
  ),
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="w-80 space-y-3">
      <Label htmlFor="volume">Volume</Label>
      <Slider {...args} id="volume" aria-label="Volume" defaultValue={35} />
    </div>
  ),
};

/** A range is a tuple in and a tuple out — no array juggling at the call site. */
export const Range: Story = {
  render: (args) => (
    <div className="w-80">
      <Slider
        {...args}
        defaultValue={[20, 80]}
        thumbLabels={["Harga minimum", "Harga maksimum"]}
      />
    </div>
  ),
};

export const WithValueBubble: Story = {
  render: (args) => (
    <div className="w-80 pt-8">
      <Slider
        {...args}
        aria-label="Diskon"
        defaultValue={25}
        label={(v) => `${v}%`}
      />
    </div>
  ),
};

export const WithMarks: Story = {
  render: (args) => (
    <div className="w-80">
      <Slider
        {...args}
        aria-label="Ukuran"
        min={1}
        max={4}
        defaultValue={2}
        marks={[
          { value: 1, label: "S" },
          { value: 2, label: "M" },
          { value: 3, label: "L" },
          { value: 4, label: "XL" },
        ]}
      />
    </div>
  ),
};

export const SteppedRange: Story = {
  render: (args) => (
    <div className="w-80 pt-8">
      <Slider
        {...args}
        step={25}
        defaultValue={[25, 75]}
        thumbLabels={["Batas bawah", "Batas atas"]}
        label
        marks={[
          { value: 0 },
          { value: 25 },
          { value: 50 },
          { value: 75 },
          { value: 100 },
        ]}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="w-80 space-y-6">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Slider
          key={size}
          {...args}
          size={size}
          aria-label={`Volume ${size}`}
          defaultValue={50}
        />
      ))}
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-52 items-center gap-8">
      <Slider {...args} aria-label="Volume" defaultValue={40} />
      <Slider {...args} thumbLabels={["Bawah", "Atas"]} defaultValue={[20, 70]} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="w-80">
      <Slider {...args} aria-label="Volume" defaultValue={50} />
    </div>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<SliderValue>(30);
    return (
      <div className="w-80 space-y-3">
        <Slider
          {...args}
          aria-label="Volume"
          value={value}
          onValueChange={setValue}
        />
        <p className="text-sm text-muted-foreground">Nilai: {String(value)}</p>
      </div>
    );
  },
};
