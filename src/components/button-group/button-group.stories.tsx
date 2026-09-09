import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  ArchiveIcon,
  InfoIcon,
  LayoutGridIcon,
  ListIcon,
  Trash2Icon,
} from "lucide-react";
import { ButtonGroup } from "./button-group";
import { Button } from "../button";

const meta: Meta<typeof ButtonGroup> = {
  title: "Navigation/ButtonGroup",
  component: ButtonGroup,
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
};
export default meta;

type Story = StoryObj<typeof ButtonGroup>;

/** The mail toolbar it was lifted from.
 *
 *  The `play` block below measures the seam in a real browser. A jsdom test
 *  cannot: it has no stylesheet, so it can only assert that a class name is
 *  present — which is exactly how the 0.41.0 divider bug shipped green. The
 *  seam depends on one selector outranking another, and specificity is only
 *  observable once CSS is actually applied. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    const [first, second, third] = buttons;

    // The first child opens the frame, so it must NOT carry a seam.
    await expect(getComputedStyle(first!).borderLeftWidth).toBe("0px");
    // Every later child draws exactly one hairline against its neighbour.
    await expect(getComputedStyle(second!).borderLeftWidth).toBe("1px");
    await expect(getComputedStyle(third!).borderLeftWidth).toBe("1px");
  },
  render: () => (
    <ButtonGroup aria-label="Tindakan surat">
      <Button variant="ghost" size="icon" aria-label="Arsipkan">
        <ArchiveIcon />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Detail">
        <InfoIcon />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Hapus">
        <Trash2Icon />
      </Button>
    </ButtonGroup>
  ),
};

/** A view switcher. `pressed` carries which one is on, so the state is
 *  announced rather than only drawn. */
export const ViewSwitcher: Story = {
  render: () => (
    <ButtonGroup aria-label="Tampilan">
      <Button variant="ghost" size="icon" pressed aria-label="Kisi">
        <LayoutGridIcon />
      </Button>
      <Button variant="ghost" size="icon" pressed={false} aria-label="Daftar">
        <ListIcon />
      </Button>
    </ButtonGroup>
  ),
};

/** Text works as well as icons, and disabled children stay disabled. */
export const WithLabels: Story = {
  render: () => (
    <ButtonGroup aria-label="Rentang">
      <Button variant="ghost">Hari</Button>
      <Button variant="ghost">Minggu</Button>
      <Button variant="ghost" disabled>
        Tahun
      </Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first, second] = canvas.getAllByRole("button");
    await expect(getComputedStyle(first!).borderTopWidth).toBe("0px");
    await expect(getComputedStyle(second!).borderTopWidth).toBe("1px");
  },
  render: () => (
    <ButtonGroup aria-label="Tindakan surat" orientation="vertical">
      <Button variant="ghost" size="icon" aria-label="Arsipkan">
        <ArchiveIcon />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Detail">
        <InfoIcon />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Hapus">
        <Trash2Icon />
      </Button>
    </ButtonGroup>
  ),
};
