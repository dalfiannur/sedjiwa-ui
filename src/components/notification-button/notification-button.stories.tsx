import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  MailIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { NotificationButton } from "./notification-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { statCardTileVariants } from "../stat-card";
import { cn } from "../../lib/cn";

const meta: Meta<typeof NotificationButton> = {
  title: "Navigation/NotificationButton",
  component: NotificationButton,
  argTypes: {
    count: { control: { type: "number", min: 0 } },
    variant: { control: "select", options: ["ghost", "outline", "secondary"] },
  },
  args: { count: 6, variant: "ghost" },
};
export default meta;

type Story = StoryObj<typeof NotificationButton>;

/** `text-current` on every glyph is load-bearing — see the note on `InAPanel`. */
const NOTIFICATIONS = [
  {
    title: "Pengaturan",
    description: "Dasbor diperbarui",
    tone: "info" as const,
    icon: <SettingsIcon className="text-current" />,
  },
  {
    title: "Acara diperbarui",
    description: "Tanggal acara berubah lagi",
    tone: "destructive" as const,
    icon: <CalendarDaysIcon className="text-current" />,
  },
  {
    title: "Profil",
    description: "Perbarui profil Anda",
    tone: "primary" as const,
    icon: <UserIcon className="text-current" />,
  },
  {
    title: "Galat aplikasi",
    description: "Periksa aplikasi yang sedang berjalan",
    tone: "warning" as const,
    icon: <AlertCircleIcon className="text-current" />,
  },
];

export const Default: Story = {};

export const Counts: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <NotificationButton count={0} />
      <NotificationButton count={1} />
      <NotificationButton count={6} />
      <NotificationButton count={150} />
    </div>
  ),
};

/** The bell and the wording are both replaceable — the badge, the cap and the
 *  accessible name are what this component actually owns. */
export const AsInbox: Story = {
  args: {
    count: 2,
    label: "Kotak masuk",
    countLabel: (n: number) => `${n} pesan belum dibaca`,
    icon: <MailIcon aria-hidden="true" />,
  },
};

/** The panel behind the bell.
 *
 *  A recipe, not a component: which notifications exist, what counts as
 *  unread and where "see all" goes are the application's, and every piece of
 *  the panel itself already ships. Kept here because two of those pieces are
 *  easy to get wrong, and both are marked below.
 *
 *  It opens on load so the panel is what you see at rest, rather than a lone
 *  bell you have to click. */
export const InAPanel: Story = {
  play: async ({ canvasElement }) => {
    // Radix portals the menu, so it lands outside the story canvas.
    const menu = within(canvasElement.ownerDocument.body);
    const items = await menu.findAllByRole("menuitem");
    await expect(items).toHaveLength(NOTIFICATIONS.length + 1);

    // The tinted glyph, measured rather than assumed. `DropdownMenuItem`
    // paints every `svg:not([class*='text-'])` with `--muted-foreground`, and
    // that rule reaches straight through the tile to a glyph that inherits its
    // colour — so an uncoloured icon here comes out grey no matter what the
    // tile says. `text-current` on the glyph is what keeps it out of range.
    const glyph = canvasElement.ownerDocument.body.querySelector<SVGElement>(
      '[data-slot="notification-tile"] svg'
    )!;
    const tile = glyph.closest<HTMLElement>('[data-slot="notification-tile"]')!;
    await expect(getComputedStyle(glyph).color).toBe(
      getComputedStyle(tile).color
    );
  },
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <NotificationButton count={NOTIFICATIONS.length} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NOTIFICATIONS.map(({ title, description, tone, icon }) => (
          <DropdownMenuItem key={title} className="items-center gap-3 py-2.5">
            <span
              data-slot="notification-tile"
              className={cn(
                statCardTileVariants({ tone }),
                "size-9 rounded-full [&>svg]:size-4"
              )}
            >
              {icon}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-semibold">{title}</span>
              <span className="text-muted-foreground truncate text-xs">
                {description}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground justify-center text-xs">
          Lihat semua notifikasi
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
