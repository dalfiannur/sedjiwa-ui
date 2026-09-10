import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "../label";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Select>;

/**
 * A closed list of a handful of options. When the list is long, or the user
 * should be able to type to narrow it, use `Combobox` instead.
 */
export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Pilih bulan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="okt">Oktober</SelectItem>
        <SelectItem value="nov">November</SelectItem>
        <SelectItem value="des">Desember</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(["xs", "sm", "default"] as const).map((size) => (
        <Select key={size} defaultValue="okt">
          <SelectTrigger size={size} className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="okt">Oktober</SelectItem>
            <SelectItem value="nov">November</SelectItem>
          </SelectContent>
        </Select>
      ))}
    </div>
  ),
};

export const Grouped: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="select-kota">Kota</Label>
      <Select>
        <SelectTrigger id="select-kota" className="w-full">
          <SelectValue placeholder="Pilih kota" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Jawa Barat</SelectLabel>
            <SelectItem value="bdg">Bandung</SelectItem>
            <SelectItem value="bgr">Bogor</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Jawa Tengah</SelectLabel>
            <SelectItem value="smg">Semarang</SelectItem>
            <SelectItem value="slo">Surakarta</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Select defaultValue="okt">
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="okt">Terisi</SelectItem>
        </SelectContent>
      </Select>
      <Select disabled>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Tidak aktif" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="okt">Oktober</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-56" aria-invalid>
          <SelectValue placeholder="Wajib diisi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="okt">Oktober</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("nov");
    return (
      <div className="w-56 space-y-2">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="okt">Oktober</SelectItem>
            <SelectItem value="nov">November</SelectItem>
            <SelectItem value="des">Desember</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-sm">Nilai: {value}</p>
      </div>
    );
  },
};

/** Opened and chosen from, so the list itself is rendered and exercised. */
export const Opened: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Pilih bulan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="okt">Oktober</SelectItem>
        <SelectItem value="nov">November</SelectItem>
        <SelectItem value="des">Desember</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);

    // Radix portals the listbox outside the story canvas.
    const body = within(canvasElement.ownerDocument.body);
    const options = await body.findAllByRole("option");
    await expect(options).toHaveLength(3);

    await userEvent.click(body.getByRole("option", { name: "November" }));
    await expect(trigger).toHaveTextContent("November");
  },
};
