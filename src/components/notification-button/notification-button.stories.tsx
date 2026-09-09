import type { Meta, StoryObj } from "@storybook/react-vite";
import { MailIcon } from "lucide-react";
import { NotificationButton } from "./notification-button";

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
