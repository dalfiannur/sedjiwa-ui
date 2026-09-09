import type { Meta, StoryObj } from "@storybook/react-vite";
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

/** The mail toolbar it was lifted from. */
export const Default: Story = {
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
