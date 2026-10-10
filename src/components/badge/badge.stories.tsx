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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {VARIANTS.map((v) => (
          <Badge key={v} variant={v} appearance="subtle">
            {v}
          </Badge>
        ))}
      </div>
      <p className="text-muted-foreground max-w-sm text-xs">
        <code>appearance=&quot;subtle&quot;</code> only changes the four toned
        variants (destructive, success, warning, info). The remaining variants
        are unaffected and must still render exactly as they do in{" "}
        <strong>Solid</strong> — in particular <code>outline</code> must keep
        its visible border.
      </p>
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

const LABELS = ["teal", "blue", "amber", "rose", "violet", "lime"] as const;

/** Colours the user picks for their own labels — a mail folder, a project
 *  tag, a board swimlane. They carry no meaning of their own: `rose` is not
 *  danger and `amber` is not caution. Reach for the semantic variants when you
 *  mean a state.
 *
 *  A fixed palette rather than an open colour prop, because an arbitrary hex
 *  cannot be contrast-checked. All twelve pairs are gated at 4.5:1 in both
 *  themes alongside the semantic tones. */
export const LabelColours: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {LABELS.map((l) => (
        <Badge key={l} variant={`label-${l}`}>
          {l}
        </Badge>
      ))}
    </div>
  ),
};

/** What it is for: a mail row's folder chip beside the sender. */
export const AsMailLabels: Story = {
  render: () => (
    <div className="flex flex-col gap-2 text-sm">
      {[
        ["Jullu Jalal", "Primary", "label-teal"],
        ["Minerva Barnett", "Work", "label-amber"],
        ["Peter Lewis", "Friends", "label-rose"],
        ["Clifford Morgan", "Social", "label-blue"],
      ].map(([name, label, variant]) => (
        <div key={name} className="flex items-center gap-3">
          <span className="w-36 font-semibold">{name}</span>
          <Badge variant={variant as "label-teal"}>{label}</Badge>
        </div>
      ))}
    </div>
  ),
};

export const WithDot: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success" appearance="subtle" dot>Tersambung</Badge>
      <Badge variant="warning" appearance="subtle" dot>Menunggu pemindaian QR</Badge>
      <Badge variant="secondary" dot>Menyiapkan…</Badge>
      <Badge variant="destructive" appearance="subtle" dot>Terputus</Badge>
    </div>
  ),
};
