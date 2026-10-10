import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox, Smartphone, UserRound, Users } from "lucide-react";
import { expect, within } from "storybook/test";
import { BottomNav, BottomNavItem } from "./bottom-nav";

const meta: Meta<typeof BottomNav> = {
  title: "Navigation/BottomNav",
  component: BottomNav,
  parameters: { layout: "fullscreen", viewport: { defaultViewport: "mobile1" } },
};
export default meta;

type Story = StoryObj<typeof BottomNav>;

export const Default: Story = {
  render: () => (
    <div className="flex h-[600px] w-[390px] flex-col">
      <div className="bg-surface flex-1" />
      <BottomNav aria-label="Navigasi utama">
        <BottomNavItem label="Inbox" icon={<Inbox />} badge={2} active />
        <BottomNavItem label="Nomor" icon={<Smartphone />} />
        <BottomNavItem label="Anggota" icon={<Users />} />
        <BottomNavItem label="Akun" icon={<UserRound />} />
      </BottomNav>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Inbox (2)" })).toHaveAttribute("aria-current", "page");
  },
};
