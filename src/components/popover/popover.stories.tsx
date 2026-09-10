import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SettingsIcon } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Slider } from "../slider";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Popover>;

/**
 * A popover holds interactive content and takes focus, which is what separates
 * it from `Tooltip`. If nothing inside can be clicked or typed into, it is a
 * tooltip and should be one.
 */
export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Buka</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <p className="text-sm">Isi popover apa pun bisa ditaruh di sini.</p>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Pengaturan tampilan">
          <SettingsIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Dimensi</h4>
          <p className="text-muted-foreground text-xs">
            Atur ukuran panel pratinjau.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pop-lebar">Lebar</Label>
          <Input.Root size="sm">
            <Input.Field id="pop-lebar" defaultValue="480" />
            <Input.TrailingAddon>px</Input.TrailingAddon>
          </Input.Root>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pop-zoom">Perbesaran</Label>
          <Slider id="pop-zoom" aria-label="Perbesaran" defaultValue={100} max={200} />
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Sides: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              {side}
            </Button>
          </PopoverTrigger>
          <PopoverContent side={side} className="w-40">
            <p className="text-sm">Sisi {side}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

/**
 * `PopoverAnchor` splits "what opens it" from "what it points at" — the button
 * triggers, the field is what the panel hangs off.
 */
export const WithSeparateAnchor: Story = {
  render: () => (
    <Popover>
      <div className="flex w-80 items-center gap-2">
        <PopoverAnchor asChild>
          <Input.Root className="flex-1">
            <Input.Field placeholder="Cari kode pos" />
          </Input.Root>
        </PopoverAnchor>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Bantuan
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-72">
        <p className="text-sm">Panel ini menempel pada kolom isian, bukan tombolnya.</p>
      </PopoverContent>
    </Popover>
  ),
};

/** Opened here so the panel's contents are rendered, not just the trigger. */
export const Opened: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Buka</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <p className="text-sm">Panel terbuka dengan fokus di dalamnya.</p>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Buka" }));

    // Radix portals the panel outside the story canvas.
    const body = within(canvasElement.ownerDocument.body);
    const panel = await body.findByText("Panel terbuka dengan fokus di dalamnya.");
    await expect(panel).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Buka" }),
    ).toHaveAttribute("aria-expanded", "true");
  },
};
