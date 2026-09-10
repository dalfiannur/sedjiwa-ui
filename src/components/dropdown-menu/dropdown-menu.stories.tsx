import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon, UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "../button";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof DropdownMenu>;

/**
 * A menu of actions. Not a `Select`: these do things rather than set a value,
 * and nothing here stays chosen after the menu closes.
 */
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Tindakan</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Ubah</DropdownMenuItem>
        <DropdownMenuItem>Duplikat</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Hapus</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithIconsAndShortcuts: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu baris">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Rangka besi hollow</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <PencilIcon />
            Ubah
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserIcon />
            Tetapkan penanggung jawab
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2Icon />
          Hapus
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Checkbox and radio items keep state, so these do outlive the menu closing. */
export const WithSelection: Story = {
  render: () => {
    const [dense, setDense] = useState(true);
    const [grid, setGrid] = useState(false);
    const [sort, setSort] = useState("terbaru");
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Tampilan</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Tata letak</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={dense} onCheckedChange={setDense}>
            Baris rapat
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
            Mode kisi
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Urutkan</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="terbaru">Terbaru</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="terlama">Terlama</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="nilai">Nilai</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Bagikan</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Salin tautan</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Kirim ke</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>WhatsApp</DropdownMenuItem>
            <DropdownMenuItem>Unduh PDF</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Cetak (belum tersedia)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Opened here so the items are rendered and the roving focus is exercised. */
export const Opened: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Tindakan</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Ubah</DropdownMenuItem>
        <DropdownMenuItem>Duplikat</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Hapus</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Tindakan" }));

    // Radix portals the menu outside the story canvas.
    const body = within(canvasElement.ownerDocument.body);
    const items = await body.findAllByRole("menuitem");
    await expect(items).toHaveLength(3);

    // Arrow keys move within the menu — one tab stop, not three.
    await userEvent.keyboard("{ArrowDown}");
    await expect(items[0]).toHaveFocus();
  },
};
