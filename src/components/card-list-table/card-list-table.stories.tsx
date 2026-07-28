import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardListTable } from "./card-list-table";
import type { Column } from "../data-table";
import { Button } from "../button";
import { Badge } from "../badge";

type Booking = {
  id: string;
  status: "Approved" | "Ongoing";
  purpose: string;
  vehicle: string;
  destination: string;
};

const ROWS: Booking[] = [
  { id: "1", status: "Approved", purpose: "Rapat Dinas", vehicle: "Avanza B 1234 CD", destination: "Bandung · 3 org" },
  { id: "2", status: "Ongoing", purpose: "Antar Tamu", vehicle: "HiAce B 5678 EF", destination: "Bogor · 6 org" },
];

const COLUMNS: Column<Booking>[] = [
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <Badge variant={r.status === "Approved" ? "secondary" : "default"}>{r.status}</Badge>
    ),
  },
  { key: "purpose", header: "Keperluan", render: (r) => r.purpose },
  { key: "vehicle", header: "Kendaraan", render: (r) => r.vehicle },
  { key: "destination", header: "Tujuan", render: (r) => r.destination },
];

const meta: Meta<typeof CardListTable<Booking>> = {
  title: "Components/CardListTable",
  component: CardListTable,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof CardListTable<Booking>>;

export const Default: Story = {
  render: () => (
    <div className="w-[24rem]">
      <CardListTable columns={COLUMNS} rows={ROWS} getRowKey={(r) => r.id} />
    </div>
  ),
};

export const WithTitleAndAction: Story = {
  render: () => (
    <div className="w-[24rem]">
      <CardListTable
        columns={COLUMNS}
        rows={ROWS}
        getRowKey={(r) => r.id}
        titleKey="status"
        renderAction={() => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline">Detail</Button>
            <Button size="sm" variant="outline">Batalkan</Button>
          </div>
        )}
      />
    </div>
  ),
};

export const Dense: Story = {
  render: () => (
    <div className="w-[24rem]">
      <CardListTable
        columns={COLUMNS}
        rows={ROWS}
        getRowKey={(r) => r.id}
        titleKey="status"
        dense
        renderAction={() => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline">Detail</Button>
            <Button size="sm" variant="outline">Batalkan</Button>
          </div>
        )}
      />
    </div>
  ),
};

export const ColumnOriented: Story = {
  render: () => (
    <div className="w-[40rem]">
      <CardListTable
        columns={COLUMNS}
        rows={ROWS}
        getRowKey={(r) => r.id}
        titleKey="status"
        orientation="column"
        renderAction={() => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline">Detail</Button>
            <Button size="sm" variant="outline">Batalkan</Button>
          </div>
        )}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-[24rem]">
      <CardListTable columns={COLUMNS} rows={[]} getRowKey={(r) => r.id} emptyMessage="Belum ada booking." />
    </div>
  ),
};
