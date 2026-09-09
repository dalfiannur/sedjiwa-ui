import type { Meta, StoryObj } from "@storybook/react-vite";
import { AvatarGroup } from "./avatar-group";
import { Avatar, AvatarFallback } from "../avatar";
import { Card, CardContent } from "../card";

const meta: Meta<typeof AvatarGroup> = {
  title: "Data Display/AvatarGroup",
  component: AvatarGroup,
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    max: { control: { type: "number", min: 1 } },
    total: { control: { type: "number", min: 0 } },
  },
  args: { size: "default", max: 3 },
};
export default meta;

type Story = StoryObj<typeof AvatarGroup>;

const NAMES = ["Moni Roy", "Minerva Barnett", "Peter Lewis", "Cecilia Webster", "Harvey Manning"];

function faces(n: number) {
  return NAMES.slice(0, n).map((name) => (
    <Avatar key={name}>
      <AvatarFallback>
        {name.split(" ").map((w) => w[0]).join("")}
      </AvatarFallback>
    </Avatar>
  ));
}

export const Default: Story = {
  render: (args) => <AvatarGroup {...args}>{faces(5)}</AvatarGroup>,
};

/** `total` is for a list the server already truncated: three faces came back,
 *  eighteen people are going. The counter and the spoken name both follow it. */
export const PartialList: Story = {
  args: { total: 18, max: 3 },
  render: (args) => <AvatarGroup {...args}>{faces(3)}</AvatarGroup>,
};

/** Nothing is hidden, so no counter appears. */
export const NoOverflow: Story = {
  args: { max: 5 },
  render: (args) => <AvatarGroup {...args}>{faces(3)}</AvatarGroup>,
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <AvatarGroup key={size} size={size} total={18}>
          {faces(3)}
        </AvatarGroup>
      ))}
    </div>
  ),
};

/** What it was lifted from: the attendee row on an event card. */
export const OnAnEventCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="flex flex-col gap-2">
        <span className="font-bold">Design Conference</span>
        <span className="text-muted-foreground text-sm">
          Hari ini 07.19 · 56 Davion Mission Suite 157
        </span>
        <AvatarGroup total={18} formatLabel={(n) => `${n} peserta`} className="mt-2">
          {faces(3)}
        </AvatarGroup>
      </CardContent>
    </Card>
  ),
};
