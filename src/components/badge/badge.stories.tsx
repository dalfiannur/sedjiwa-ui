import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Badge>;

const VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "success",
  "warning",
  "info",
  "outline",
] as const;

export const Solid: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </div>
  ),
};

export const Subtle: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["destructive", "success", "warning", "info"] as const).map((v) => (
        <Badge key={v} variant={v} appearance="subtle">
          {v}
        </Badge>
      ))}
    </div>
  ),
};

export const StatusRow: Story = {
  name: "In a dense table row",
  render: () => (
    <div className="bg-card flex items-center gap-3 rounded-lg border p-3 text-sm">
      <span className="font-medium">Innova Reborn</span>
      <span className="text-muted-foreground">B 1234 XYZ</span>
      <Badge variant="success" appearance="subtle">
        Aktif
      </Badge>
    </div>
  ),
};
