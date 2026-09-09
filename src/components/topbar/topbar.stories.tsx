import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon } from "lucide-react";
import { Topbar } from "./topbar";
import { Input } from "../input";
import { NotificationButton } from "../notification-button";
import { UserMenuTrigger } from "../user-menu-trigger";
import { Avatar, AvatarFallback } from "../avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

const meta: Meta<typeof Topbar> = {
  title: "Navigation/Topbar",
  component: Topbar,
};
export default meta;

type Story = StoryObj<typeof Topbar>;

const search = (
  <Input.Root appearance="search">
    <Input.LeadingIcon>
      <SearchIcon />
    </Input.LeadingIcon>
    <Input.Field placeholder="Cari" aria-label="Cari" />
  </Input.Root>
);

/** The whole bar: search on the left, notifications and the user menu on the
 *  right. Sits inside `AppShellHeader` or `SidebarLayout` without carrying any
 *  positioning of its own. */
export const Default: Story = {
  render: () => (
    <div className="bg-surface w-full p-4">
      <Topbar className="rounded-xl" search={search}>
        <NotificationButton count={6} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <UserMenuTrigger
              name="Moni Roy"
              role="Admin"
              avatar={
                <Avatar>
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
              }
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Keluar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Topbar>
    </div>
  ),
};

/** Every slot is optional. With no search, the actions still sit right. */
export const ActionsOnly: Story = {
  render: () => (
    <div className="bg-surface w-full p-4">
      <Topbar className="rounded-xl">
        <NotificationButton count={2} />
      </Topbar>
    </div>
  ),
};
