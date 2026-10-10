import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox, Smartphone, Users } from "lucide-react";
import { expect, within } from "storybook/test";
import { Avatar, AvatarFallback } from "../avatar";
import { NavRail, NavRailFooter, NavRailHeader, NavRailItem } from "./nav-rail";

const meta: Meta<typeof NavRail> = {
  title: "Navigation/NavRail",
  component: NavRail,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof NavRail>;

export const Default: Story = {
  render: () => (
    <div className="flex h-[560px]">
      <NavRail aria-label="Navigasi utama">
        <NavRailHeader>
          <span className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-xl font-bold">S</span>
        </NavRailHeader>
        <NavRailItem label="Inbox" icon={<Inbox />} badge={7} active />
        <NavRailItem label="Nomor" icon={<Smartphone />} />
        <NavRailItem label="Anggota" icon={<Users />} />
        <NavRailFooter>
          <Avatar size="lg">
            <AvatarFallback colorKey="Rina Pratiwi">RP</AvatarFallback>
          </Avatar>
        </NavRailFooter>
      </NavRail>
      <div className="bg-surface flex-1" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Inbox (7)" })).toHaveAttribute("aria-current", "page");
  },
};
