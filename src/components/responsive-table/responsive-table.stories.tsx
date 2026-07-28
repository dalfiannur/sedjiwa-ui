import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResponsiveTable } from "./responsive-table";
import type { Column } from "../data-table";
import { Button } from "../button";
import { Badge } from "../badge";

type Booking = {
  id: string;
  status: "Approved" | "Ongoing";
  requester: string;
  purpose: string;
  vehicle: string;
  schedule: string;
};

const ROWS: Booking[] = [
  { id: "1", status: "Approved", requester: "Admin", purpose: "Rapat Dinas", vehicle: "Avanza B 1234 CD", schedule: "24 Jul, 09.00 – 17.00" },
  { id: "2", status: "Ongoing", requester: "Budi", purpose: "Antar Tamu", vehicle: "HiAce B 5678 EF", schedule: "25 Jul, 08.00 – 12.00" },
];

const COLUMNS: Column<Booking>[] = [
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <Badge variant={r.status === "Approved" ? "secondary" : "default"}>{r.status}</Badge>
    ),
  },
  { key: "requester", header: "Pemohon", render: (r) => r.requester },
  { key: "purpose", header: "Keperluan", render: (r) => r.purpose },
  { key: "vehicle", header: "Kendaraan", render: (r) => r.vehicle },
  { key: "schedule", header: "Jadwal", render: (r) => r.schedule },
];

const meta: Meta<typeof ResponsiveTable<Booking>> = {
  title: "Components/ResponsiveTable",
  component: ResponsiveTable,
  parameters: {
    layout: "padded",
  },
};
export default meta;

type Story = StoryObj<typeof ResponsiveTable<Booking>>;

/** Resize the preview: table at `md`+ (≥768px), cards below. */
export const Default: Story = {
  render: () => (
    <ResponsiveTable
      columns={COLUMNS}
      rows={ROWS}
      getRowKey={(r) => r.id}
      cardTitleKey="status"
      dense
      renderAction={() => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button size="sm" variant="outline">Detail</Button>
          <Button size="sm" variant="outline">Batalkan</Button>
        </div>
      )}
    />
  ),
};
