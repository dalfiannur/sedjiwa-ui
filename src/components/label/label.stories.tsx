import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { Input } from "../input";
import { Checkbox } from "../checkbox";

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { children: "Nama lengkap" },
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {};

/**
 * `htmlFor` is what makes the label part of the control: clicking it focuses
 * the field, and a screen reader announces the two together.
 */
export const BoundToAField: Story = {
  render: (args) => (
    <div className="w-72 space-y-2">
      <Label {...args} htmlFor="label-name" />
      <Input.Root>
        <Input.Field id="label-name" placeholder="Budi Santoso" />
      </Input.Root>
    </div>
  ),
};

/** Beside a checkbox the label is the click target that matters most. */
export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="label-terms" />
      <Label htmlFor="label-terms">Saya menyetujui ketentuan</Label>
    </div>
  ),
};

/**
 * Radix marks the label when its control is disabled, so the text dims with
 * the field instead of staying black above a greyed-out box.
 */
export const WithDisabledControl: Story = {
  render: () => (
    <div className="w-72 space-y-2">
      <Label htmlFor="label-disabled">Kode referral</Label>
      <Input.Root disabled>
        <Input.Field id="label-disabled" disabled placeholder="Tidak tersedia" />
      </Input.Root>
    </div>
  ),
};
