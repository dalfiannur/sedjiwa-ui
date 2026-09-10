import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    decorative: { control: "boolean" },
  },
  args: { orientation: "horizontal", decorative: true },
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80 space-y-4">
      <p className="text-sm">Pengaturan akun</p>
      <Separator {...args} />
      <p className="text-muted-foreground text-sm">
        Ubah kata sandi dan preferensi notifikasi.
      </p>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-8 items-center gap-4 text-sm">
      <span>Profil</span>
      <Separator {...args} />
      <span>Tagihan</span>
      <Separator {...args} />
      <span>Tim</span>
    </div>
  ),
};

/**
 * `decorative={false}` publishes it as a real `separator` role. Use it when the
 * rule marks a genuine boundary between groups rather than just adding a line.
 */
export const Semantic: Story = {
  args: { decorative: false },
  render: (args) => (
    <div className="w-80 space-y-4">
      <p className="text-sm">Anggota aktif</p>
      <Separator {...args} />
      <p className="text-sm">Undangan tertunda</p>
    </div>
  ),
};
