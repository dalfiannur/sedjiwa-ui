import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarX2, Inbox } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyState,
} from "./empty-state";
import { Button } from "../button";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <Inbox />,
    title: "Belum ada data",
    description: "Data akan muncul di sini setelah ada aktivitas.",
  },
  render: (args) => (
    <div className="w-[28rem]">
      <EmptyState {...args} />
    </div>
  ),
};

export const WithAction: Story = {
  args: {
    icon: <CalendarX2 />,
    title: "Tidak ada kendaraan tersedia",
    description: "Coba ubah rentang waktu pencarian.",
    action: <Button size="sm">Reset filter</Button>,
  },
  render: (args) => (
    <div className="w-[28rem]">
      <EmptyState {...args} />
    </div>
  ),
};

export const TitleOnly: Story = {
  args: { title: "Belum ada booking" },
  render: (args) => (
    <div className="w-[28rem]">
      <EmptyState {...args} />
    </div>
  ),
};

export const Composed: Story = {
  render: () => (
    <div className="w-[28rem]">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>Komposisi manual</EmptyTitle>
          <EmptyDescription>
            Gunakan primitif <code>Empty*</code> untuk tata letak khusus.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" variant="outline">
            Aksi
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  ),
};
