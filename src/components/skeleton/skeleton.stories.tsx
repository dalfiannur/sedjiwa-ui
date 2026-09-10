import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader } from "../card";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

/** Size and shape come from utility classes; the component supplies the shimmer. */
export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ),
};

/**
 * The shape should trace what is coming. A block that matches the real layout
 * stops the page jumping when the data lands.
 */
export const CardPlaceholder: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  ),
};

export const TableRows: Story = {
  render: () => (
    <div className="w-96 space-y-3">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  ),
};
