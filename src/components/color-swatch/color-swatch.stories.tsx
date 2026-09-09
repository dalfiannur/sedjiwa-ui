import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ColorSwatch, ColorSwatchList } from "./color-swatch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

const meta: Meta<typeof ColorSwatchList> = {
  title: "Data Display/ColorSwatch",
  component: ColorSwatchList,
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
  },
  args: { size: "default", label: "Warna tersedia" },
};
export default meta;

type Story = StoryObj<typeof ColorSwatchList>;

const COLORS = [
  { color: "#1B1B1B", name: "Hitam" },
  { color: "#8E8E8E", name: "Abu" },
  { color: "#EE8888", name: "Merah muda" },
  { color: "#4880FF", name: "Biru" },
  { color: "#F2C94C", name: "Kuning" },
];

function swatches(n: number) {
  return COLORS.slice(0, n).map((c) => <ColorSwatch key={c.name} {...c} />);
}

export const Default: Story = {
  render: (args) => <ColorSwatchList {...args}>{swatches(4)}</ColorSwatchList>,
};

/** Every dot answers to a name.
 *
 *  Nothing on screen labels these colours, so the names are the only thing a
 *  screen reader has to work with — that is the difference between this and a
 *  chart legend, where the dot merely repeats a label sitting next to it. */
export const Named: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("list", { name: "Warna tersedia" })
    ).toBeInTheDocument();
    for (const { name } of COLORS.slice(0, 4)) {
      await expect(canvas.getByRole("listitem", { name })).toBeInTheDocument();
    }
  },
  render: (args) => <ColorSwatchList {...args}>{swatches(4)}</ColorSwatchList>,
};

/** The list's size governs the dots it holds.
 *
 *  Both the list and each swatch carry a size class, so which one applies is a
 *  specificity question — `[&>*]` on the list at (0,1,1) against the swatch's
 *  own (0,1,0). jsdom has no stylesheet and cannot answer it; only a real
 *  browser can, which is what this block is for. */
export const Sizes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const width = (label: string) => {
      const list = canvas.getByRole("list", { name: label });
      const dot = within(list).getAllByRole("listitem")[0]!;
      return dot.getBoundingClientRect().width;
    };

    const small = width("sm");
    const medium = width("default");
    const large = width("lg");
    await expect(medium).toBeGreaterThan(small);
    await expect(large).toBeGreaterThan(medium);
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        // The label doubles as the handle the `play` block reads by.
        <ColorSwatchList key={size} size={size} label={size}>
          {swatches(4)}
        </ColorSwatchList>
      ))}
    </div>
  ),
};

/** A white swatch on a white card is the case the inset ring exists for.
 *  Without it this row would look like three colours and a gap. */
export const PaleColors: Story = {
  render: (args) => (
    <ColorSwatchList {...args}>
      <ColorSwatch color="#FFFFFF" name="Putih" />
      <ColorSwatch color="#F7F3E8" name="Gading" />
      <ColorSwatch color="#E8E8E8" name="Abu muda" />
      <ColorSwatch color="#1B1B1B" name="Hitam" />
    </ColorSwatchList>
  ),
};

/** What it was lifted from: the product table's "Available Color" column. */
export const InATable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Produk</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead>Warna Tersedia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Apple Watch Series 4</TableCell>
          <TableCell className="tabular-nums">Rp10.900.000</TableCell>
          <TableCell>
            <ColorSwatchList label="Warna tersedia untuk Apple Watch Series 4">
              {swatches(3)}
            </ColorSwatchList>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Microsoft Headsquare</TableCell>
          <TableCell className="tabular-nums">Rp2.990.000</TableCell>
          <TableCell>
            <ColorSwatchList label="Warna tersedia untuk Microsoft Headsquare">
              {swatches(4)}
            </ColorSwatchList>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
