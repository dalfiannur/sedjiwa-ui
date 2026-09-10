import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { DataTable, type Column } from "./data-table";
import { Badge } from "../badge";
import { Button } from "../button";

type Deal = {
  id: string;
  produk: string;
  lokasi: string;
  nilai: string;
  status: "Terkirim" | "Tertunda" | "Ditolak";
};

const DEALS: Deal[] = [
  { id: "1", produk: "Rangka besi hollow", lokasi: "6096 Marjolaine", nilai: "Rp34.295.000", status: "Terkirim" },
  { id: "2", produk: "Plat baja 3mm", lokasi: "1420 Cedar Loop", nilai: "Rp12.880.000", status: "Tertunda" },
  { id: "3", produk: "Baut M12 galvanis", lokasi: "88 Sudirman Kav.", nilai: "Rp4.150.000", status: "Ditolak" },
];

const TONE = {
  Terkirim: "success",
  Tertunda: "warning",
  Ditolak: "destructive",
} as const;

const COLUMNS: Column<Deal>[] = [
  { key: "produk", header: "Produk", render: (d) => d.produk },
  { key: "lokasi", header: "Lokasi", render: (d) => d.lokasi },
  { key: "nilai", header: "Nilai", align: "right", render: (d) => d.nilai },
];

const meta: Meta<typeof DataTable> = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof DataTable<Deal>>;

/**
 * Columns are data, not markup: one `Column<T>[]` drives the header and every
 * cell. It composes `Table` underneath, so dropping to the primitive is always
 * available when a layout outgrows the config.
 */
export const Default: Story = {
  render: () => (
    <DataTable columns={COLUMNS} rows={DEALS} getRowKey={(d) => d.id} />
  ),
};

/** `render` returns a node, so a cell can hold any component. */
export const RichCells: Story = {
  render: () => (
    <DataTable
      columns={[
        ...COLUMNS,
        {
          key: "status",
          header: "Status",
          render: (d) => <Badge variant={TONE[d.status]}>{d.status}</Badge>,
        },
      ]}
      rows={DEALS}
      getRowKey={(d) => d.id}
    />
  ),
};

/** `renderAction` gets its own trailing column, outside the column config. */
export const WithRowAction: Story = {
  render: () => (
    <DataTable
      columns={COLUMNS}
      rows={DEALS}
      getRowKey={(d) => d.id}
      renderAction={(d) => (
        <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${d.produk}`}>
          <PencilIcon />
        </Button>
      )}
    />
  ),
};

export const Clickable: Story = {
  render: () => {
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <div className="space-y-3">
        <DataTable
          columns={COLUMNS}
          rows={DEALS}
          getRowKey={(d) => d.id}
          onRowClick={(d) => setPicked(d.produk)}
        />
        <p className="text-muted-foreground text-sm">
          {picked ? `Dipilih: ${picked}` : "Klik baris mana pun."}
        </p>
      </div>
    );
  },
};

/**
 * No rows is a state worth designing, not an accident. The header stays so the
 * shape of what is missing is still legible.
 */
export const Empty: Story = {
  render: () => (
    <DataTable
      columns={COLUMNS}
      rows={[]}
      getRowKey={(d) => d.id}
      emptyMessage="Belum ada transaksi pada rentang ini."
    />
  ),
};
