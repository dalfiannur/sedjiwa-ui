import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { InfoIcon, Trash2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Button } from "../button";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

/**
 * A tooltip supplements a control that is already labelled. It must never be
 * the only place the name lives — it does not exist for touch users at all.
 */
export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Arahkan ke sini</Button>
      </TooltipTrigger>
      <TooltipContent>Muncul setelah jeda singkat</TooltipContent>
    </Tooltip>
  ),
};

/** On an icon-only button the tooltip repeats the `aria-label`, never replaces it. */
export const OnIconButton: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Hapus">
          <Trash2Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Hapus</TooltipContent>
    </Tooltip>
  ),
};

export const Sides: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Sisi {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

/**
 * The default 300ms delay stops tooltips flashing as the pointer crosses a
 * toolbar. A collapsed sidebar is the exception — there the tooltip *is* the
 * label, so it gets `delayDuration={0}`.
 */
export const NoDelay: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Info">
            <InfoIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Tampil seketika</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

/** Opened here so the content is actually rendered, not just its trigger. */
export const Opened: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Arahkan ke sini</Button>
        </TooltipTrigger>
        <TooltipContent>Nilai bersih setelah pajak</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Arahkan ke sini" }));

    // Radix portals the tooltip out of the story canvas, and even at
    // delayDuration 0 it lands a frame later — hence the wait rather than a
    // straight query.
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(async () => {
      await expect(
        body.getAllByText("Nilai bersih setelah pajak")[0],
      ).toBeVisible();
    });
  },
};
