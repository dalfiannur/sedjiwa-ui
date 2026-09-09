import type { Meta, StoryObj } from "@storybook/react-vite";
import { Rating } from "./rating";

const meta: Meta<typeof Rating> = {
  title: "Data Display/Rating",
  component: Rating,
  argTypes: {
    value: { control: { type: "number", step: 0.1, min: 0, max: 5 } },
    size: { control: "select", options: ["sm", "default", "lg"] },
  },
  args: { value: 4, count: 131, size: "default" },
};
export default meta;

type Story = StoryObj<typeof Rating>;

export const Default: Story = {};

/** Scores are rarely whole. The fill is clipped to the exact fraction rather
 *  than snapping to the nearest star or half-star. */
export const Fractions: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {[5, 4.6, 4.3, 3.5, 2.2, 0].map((v) => (
        <div key={v} className="flex items-center gap-4">
          <span className="text-muted-foreground w-10 text-sm tabular-nums">{v}</span>
          <Rating value={v} />
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Rating value={4.3} count={131} size="sm" />
      <Rating value={4.3} count={131} />
      <Rating value={4.3} count={131} size="lg" />
    </div>
  ),
};

/** `max` is not fixed at five. */
export const OutOfTen: Story = {
  args: { value: 7.5, max: 10, count: 42 },
};

/** Without a count it is just the score. */
export const NoCount: Story = {
  args: { value: 3, count: undefined },
};
