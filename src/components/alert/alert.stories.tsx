import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Alert, type AlertProps } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "Feedback/Alert",
  component: Alert,
  argTypes: {
    variant: { control: "select", options: ["info", "success", "warning", "error"] },
    placement: { control: "select", options: ["inline", "page"] },
    announce: { control: "select", options: ["auto", "off"] },
  },
  args: { variant: "info", placement: "inline", announce: "auto" },
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: (args: AlertProps) => (
    <div className="w-[32rem]">
      <Alert {...args}>Stok Rangka besi hollow tinggal 6 batang.</Alert>
    </div>
  ),
};

export const Variants: Story = {
  render: (args: AlertProps) => (
    <div className="flex w-[32rem] flex-col gap-3">
      <Alert {...args} variant="info" title="Informasi">
        Harga terakhir diambil dari purchase order sebelumnya.
      </Alert>
      <Alert {...args} variant="success" title="Tersimpan">
        Purchase order PO-014 sudah diterbitkan.
      </Alert>
      <Alert {...args} variant="warning" title="Perlu perhatian">
        Dua baris belum punya harga satuan.
      </Alert>
      <Alert {...args} variant="error" title="Gagal menyimpan">
        Supplier belum dipilih.
      </Alert>
    </div>
  ),
};

/** Title, message, an action, and a dismiss button together. */
export const Full: Story = {
  render: (args: AlertProps) => {
    const [open, setOpen] = useState(true);
    if (!open) {
      return (
        <button type="button" className="text-sm underline" onClick={() => setOpen(true)}>
          Tampilkan lagi
        </button>
      );
    }
    return (
      <div className="w-[32rem]">
        <Alert
          {...args}
          variant="warning"
          title="Stok tidak mencukupi"
          action={<a href="#stok">Lihat kartu stok</a>}
          onDismiss={() => setOpen(false)}
          dismissLabel="Tutup pemberitahuan"
        >
          Permintaan 12 batang, tersedia 6.
        </Alert>
      </div>
    );
  },
};

/** Page-level banners lose the radius so they sit flush against the edge. */
export const PageLevel: Story = {
  render: (args: AlertProps) => (
    <div className="w-[32rem] overflow-hidden rounded-lg border">
      <Alert {...args} variant="warning" placement="page">
        Sistem akan dimatikan sementara pukul 22.00.
      </Alert>
      <div className="p-4 text-sm text-muted-foreground">Isi halaman.</div>
    </div>
  ),
};
