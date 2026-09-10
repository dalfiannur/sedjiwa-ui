import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "../badge";

const ROWS = [
  { id: "1", produk: "Rangka besi hollow", lokasi: "6096 Marjolaine", nilai: "Rp34.295.000", status: "Terkirim" },
  { id: "2", produk: "Plat baja 3mm", lokasi: "1420 Cedar Loop", nilai: "Rp12.880.000", status: "Tertunda" },
  { id: "3", produk: "Baut M12 galvanis", lokasi: "88 Sudirman Kav.", nilai: "Rp4.150.000", status: "Ditolak" },
];

const TONE = {
  Terkirim: "success",
  Tertunda: "warning",
  Ditolak: "destructive",
} as const;

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Table>;

/**
 * The presentational primitive. It styles a real `<table>` and nothing more —
 * no sorting, no paging, no data prop. Reach for `DataTable` or `SmartTable`
 * when you want those; reach for this when you want control.
 */
export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produk</TableHead>
          <TableHead>Lokasi</TableHead>
          <TableHead className="text-right">Nilai</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.produk}</TableCell>
            <TableCell>{r.lokasi}</TableCell>
            <TableCell className="text-right tabular-nums">{r.nilai}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Numbers belong right-aligned and tabular, so digits line up column-wise. */
export const WithStatusAndAlignment: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produk</TableHead>
          <TableHead className="text-right">Nilai</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.produk}</TableCell>
            <TableCell className="text-right tabular-nums">{r.nilai}</TableCell>
            <TableCell>
              <Badge variant={TONE[r.status as keyof typeof TONE]}>
                {r.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** A caption names the table for a screen reader walking the page by landmark. */
export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>Transaksi tiga hari terakhir</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Produk</TableHead>
          <TableHead className="text-right">Nilai</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.produk}</TableCell>
            <TableCell className="text-right tabular-nums">{r.nilai}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produk</TableHead>
          <TableHead className="text-right">Nilai</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.produk}</TableCell>
            <TableCell className="text-right tabular-nums">{r.nilai}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right tabular-nums">Rp51.325.000</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

/** One row is still a table. The header is what makes the value readable. */
export const SingleRow: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produk</TableHead>
          <TableHead className="text-right">Nilai</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>{ROWS[0]!.produk}</TableCell>
          <TableCell className="text-right tabular-nums">{ROWS[0]!.nilai}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
