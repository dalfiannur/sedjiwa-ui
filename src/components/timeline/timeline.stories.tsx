import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, FileText, Send, X } from "lucide-react";
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineRoot,
  type TimelineProps,
} from "./timeline";
import { Card } from "../card";

const EVENTS = [
  {
    title: "Pengajuan dibuat",
    description: "Oleh Budi Santoso",
    timestamp: "10 Sep 2026, 09:12",
  },
  {
    title: "Disetujui atasan",
    description: "Oleh Siti Rahayu",
    timestamp: "10 Sep 2026, 10:40",
    status: "success" as const,
  },
  {
    title: "Menunggu pencairan",
    timestamp: "10 Sep 2026, 10:41",
  },
];

const meta: Meta<TimelineProps> = {
  title: "Components/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
  },
  args: { items: EVENTS, size: "default" },
};
export default meta;

type Story = StoryObj<TimelineProps>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <Timeline {...args} />
    </div>
  ),
};

/**
 * Status colours the dot and nothing else — the title still has to say what
 * happened, so the meaning survives without the colour.
 */
export const Statuses: Story = {
  render: (args) => (
    <div className="w-80">
      <Timeline
        {...args}
        items={[
          { title: "Diajukan", timestamp: "09:12" },
          { title: "Disetujui", timestamp: "10:40", status: "success" },
          { title: "Perlu revisi", timestamp: "11:02", status: "warning" },
          { title: "Ditolak", timestamp: "11:30", status: "error" },
        ]}
      />
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="w-80">
      <Timeline
        {...args}
        items={[
          { title: "Dokumen diunggah", timestamp: "09:12", icon: <FileText /> },
          {
            title: "Diverifikasi",
            timestamp: "10:40",
            status: "success",
            icon: <Check />,
          },
          { title: "Dikirim ke keuangan", timestamp: "10:41", icon: <Send /> },
        ]}
      />
    </div>
  ),
};

export const SingleEvent: Story = {
  render: (args) => (
    <div className="w-80">
      <Timeline {...args} items={[{ title: "Dibuat", timestamp: "09:12" }]} />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex gap-10">
      {(["sm", "default", "lg"] as const).map((size) => (
        <div key={size} className="w-56">
          <Timeline {...args} size={size} items={EVENTS.slice(0, 2)} />
        </div>
      ))}
    </div>
  ),
};

/** Where it usually lives: the activity panel beside a record's details. */
export const InACard: Story = {
  render: (args) => (
    <Card className="w-96 p-5">
      <h3 className="mb-4 font-medium">Riwayat</h3>
      <Timeline {...args} />
    </Card>
  ),
};

/** Drop to the parts when an event needs a shape the preset does not offer. */
export const Composed: Story = {
  render: () => (
    <div className="w-80">
      <TimelineRoot>
        <TimelineItem>
          <TimelineDot status="success" />
          <TimelineContent>
            <div className="font-medium">Disetujui</div>
            <div className="text-muted-foreground mt-1 text-xs">10:40</div>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem last hasIcon>
          <TimelineDot status="error">
            <X />
          </TimelineDot>
          <TimelineContent hasIcon>
            <div className="font-medium">Dibatalkan pemohon</div>
            <p className="text-muted-foreground mt-1">
              Alasan: jadwal perjalanan berubah.
            </p>
          </TimelineContent>
        </TimelineItem>
      </TimelineRoot>
    </div>
  ),
};
