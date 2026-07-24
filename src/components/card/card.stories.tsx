import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card";
import { Button } from "../button";
import { Badge } from "../badge";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[22rem]">
      <CardHeader>
        <CardTitle>Toyota HiAce</CardTitle>
        <CardDescription>B 1234 CD · Van · 14 kursi</CardDescription>
        <CardAction>
          <Badge variant="secondary">Tersedia</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Tidak ada booking pada rentang waktu ini.
      </CardContent>
      <CardFooter>
        <Button size="sm">Booking</Button>
      </CardFooter>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Card className="w-[22rem]">
      <CardContent className="text-sm">
        Kartu tanpa header/footer — hanya konten.
      </CardContent>
    </Card>
  ),
};
