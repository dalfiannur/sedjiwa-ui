import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserMenuTrigger } from "./user-menu-trigger";
import { Avatar, AvatarFallback } from "../avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

const meta: Meta<typeof UserMenuTrigger> = {
  title: "Navigation/UserMenuTrigger",
  component: UserMenuTrigger,
  args: { name: "Moni Roy", role: "Admin", showChevron: true },
};
export default meta;

type Story = StoryObj<typeof UserMenuTrigger>;

const avatar = (
  <Avatar>
    <AvatarFallback>MR</AvatarFallback>
  </Avatar>
);

export const Default: Story = { args: { avatar } };

/** What it is actually for: the trigger half of a user menu. Radix supplies
 *  aria-expanded and aria-haspopup through `asChild`, so the button carries
 *  no menu ARIA of its own. */
export const InAMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserMenuTrigger name="Moni Roy" role="Admin" avatar={avatar} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Akun saya</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profil</DropdownMenuItem>
        <DropdownMenuItem>Pengaturan</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Keluar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Below `sm` the text collapses to just the avatar unless told otherwise. */
export const AlwaysShowText: Story = {
  args: { avatar, alwaysShowText: true },
};
