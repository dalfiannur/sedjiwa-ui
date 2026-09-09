import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { Card, CardContent } from "../card";

const meta: Meta<typeof Avatar> = {
  title: "Data Display/Avatar",
  component: Avatar,
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg", "xl", "2xl"] },
  },
  args: { size: "default" },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>MR</AvatarFallback>
    </Avatar>
  ),
};

/** The initials move with the circle.
 *
 *  The `play` block is the check that matters here. A jsdom test has no
 *  stylesheet, so it can only assert that `text-3xl` is in the class list —
 *  and a class that is present but outranked looks identical to one that
 *  works. `AvatarFallback` inherits its text size from the root, and
 *  inheritance loses to any class set on the fallback itself, so this is
 *  exactly the kind of rule that breaks silently. Measure it in a browser. */
export const Sizes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const read = (initials: string) =>
      parseFloat(getComputedStyle(canvas.getByText(initials)).fontSize);

    // Ordered, not exact: the assertion survives a retune of the scale, and
    // still fails the moment a step stops moving the initials at all.
    const scale = [read("SM"), read("DF"), read("LG"), read("XL"), read("2X")];
    for (let i = 1; i < scale.length; i++) {
      await expect(scale[i]!).toBeGreaterThan(scale[i - 1]!);
    }
  },
  render: () => (
    <div className="flex items-end gap-4">
      {(
        [
          ["sm", "SM"],
          ["default", "DF"],
          ["lg", "LG"],
          ["xl", "XL"],
          ["2xl", "2X"],
        ] as const
      ).map(([size, initials]) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

/** Stands in for a photograph. Inline rather than fetched: the Storybook
 *  project runs these stories in a real Chromium, and a remote portrait would
 *  put a network round-trip inside the test run. Its colours are literals on
 *  purpose — a photograph is the one thing in here that is not token-tinted. */
const FACE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" fill="#4880FF"/>' +
      '<circle cx="32" cy="25" r="11" fill="#ffffff"/>' +
      '<path d="M9 64c0-12.7 10.3-19 23-19s23 6.3 23 19z" fill="#ffffff"/>' +
      "</svg>"
  );

/** With an image, the fallback never appears — the size prop still governs
 *  the circle, and the image fills it. */
export const WithImage: Story = {
  args: { size: "lg" },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={FACE} alt="Foto profil Moni Roy" />
      <AvatarFallback>MR</AvatarFallback>
    </Avatar>
  ),
};

/** A size between two steps is still a `className` away. It moves the circle
 *  and leaves the initials where they were — which is fine for a monogram
 *  nine pixels off the default, and is why the scale stops at five steps. */
export const CustomSize: Story = {
  render: () => (
    <Avatar className="size-9">
      <AvatarFallback>MR</AvatarFallback>
    </Avatar>
  ),
};

/** What the Team page is made of: no component of its own, just the largest
 *  step on a card. */
export const OnAProfileCard: Story = {
  render: () => (
    <Card className="w-64">
      <CardContent className="flex flex-col items-center gap-1 py-4">
        <Avatar size="2xl" className="mb-3">
          <AvatarFallback>JP</AvatarFallback>
        </Avatar>
        <span className="font-bold">Jason Price</span>
        <span className="text-muted-foreground text-sm">Admin</span>
        <span className="text-muted-foreground text-sm">
          janick_parisian@yahoo.com
        </span>
      </CardContent>
    </Card>
  ),
};
