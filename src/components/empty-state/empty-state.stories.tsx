import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarX2, CheckCircle2, Inbox, SearchX, Truck } from "lucide-react";
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

export const ToneCreate: Story = {
  name: "Archetype: nothing created yet",
  render: () => (
    <div className="w-[28rem]">
      <EmptyState
        icon={<Truck />}
        title="Belum ada kendaraan"
        description="Kendaraan yang Anda tambahkan akan muncul sebagai pilihan saat karyawan mengajukan booking."
        action={<Button size="sm">Tambah Kendaraan</Button>}
      />
    </div>
  ),
};

export const ToneClear: Story = {
  name: "Archetype: empty is good news",
  render: () => (
    <div className="w-[28rem]">
      <EmptyState
        tone="success"
        icon={<CheckCircle2 />}
        title="Semua request sudah diproses"
        description="Tidak ada pengajuan yang menunggu persetujuan."
      />
    </div>
  ),
};

export const ToneFiltered: Story = {
  name: "Archetype: filter matched nothing",
  render: () => (
    <div className="w-[28rem]">
      <EmptyState
        tone="muted"
        icon={<SearchX />}
        title="Tidak ada hasil"
        description="Tidak ada booking berstatus Ditolak pada rentang tanggal ini."
        action={
          <Button size="sm" variant="outline">
            Reset filter
          </Button>
        }
      />
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
