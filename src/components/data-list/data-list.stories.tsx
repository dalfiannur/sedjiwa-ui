import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DataList,
  DataListItem,
  DataListLabel,
  DataListRoot,
  DataListValue,
  type DataListProps,
} from "./data-list";
import { Badge } from "../badge";
import { Card } from "../card";
import { CopyButton } from "../copy-button";
import { Separator } from "../separator";

const FIELDS = [
  { label: "Nama", value: "Budi Santoso" },
  { label: "Email", value: "budi@qyubit.io" },
  { label: "Telepon", value: "0812-3456-7890" },
  { label: "Dibuat", value: "10 Sep 2026, 09:12" },
];

const meta: Meta<DataListProps> = {
  title: "Components/DataList",
  component: DataList,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    size: { control: "select", options: ["sm", "default", "lg"] },
    dense: { control: "boolean" },
    labelWidth: { control: "text" },
  },
  args: {
    items: FIELDS,
    orientation: "horizontal",
    size: "default",
    dense: false,
    labelWidth: "10rem",
  },
};
export default meta;

type Story = StoryObj<DataListProps>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[28rem]">
      <DataList {...args} />
    </div>
  ),
};

/** Labels above values — for a narrow column, or a very long label. */
export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="w-64">
      <DataList {...args} />
    </div>
  ),
};

export const Dense: Story = {
  args: { dense: true, size: "sm" },
  render: (args) => (
    <div className="w-[28rem]">
      <DataList {...args} />
    </div>
  ),
};

/** Values are `ReactNode`, so a badge, a link, or a copy button drops straight in. */
export const RichValues: Story = {
  render: (args) => (
    <div className="w-[28rem]">
      <DataList
        {...args}
        items={[
          {
            label: "Nomor",
            value: (
              <span className="flex items-center gap-1.5">
                <code className="font-mono">INV-2026-0042</code>
                <CopyButton value="INV-2026-0042" size="icon-sm" />
              </span>
            ),
          },
          { label: "Status", value: <Badge>Aktif</Badge> },
          {
            label: "Situs",
            value: (
              <a className="underline underline-offset-4" href="https://qyubit.io">
                qyubit.io
              </a>
            ),
          },
          { label: "Catatan", value: "—" },
        ]}
      />
    </div>
  ),
};

/** The shape it was built for: a record's detail panel. */
export const InACard: Story = {
  render: (args) => (
    <Card className="w-[30rem] p-5">
      <h3 className="mb-1 font-medium">Detail pelanggan</h3>
      <p className="text-muted-foreground mb-4 text-sm">
        Data yang tercatat saat pendaftaran.
      </p>
      <Separator className="mb-3" />
      <DataList {...args} />
    </Card>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-[28rem] flex-col gap-6">
      {(["sm", "default", "lg"] as const).map((size) => (
        <DataList key={size} {...args} size={size} items={FIELDS.slice(0, 2)} />
      ))}
    </div>
  ),
};

/** Drop to the parts when a row has to do something the shape does not allow. */
export const Composed: Story = {
  render: () => (
    <div className="w-[28rem]">
      <DataListRoot labelWidth="8rem">
        <DataListItem>
          <DataListLabel>Nama</DataListLabel>
          <DataListValue>Budi Santoso</DataListValue>
        </DataListItem>
        <DataListItem>
          <DataListLabel>Alamat</DataListLabel>
          <DataListValue>
            Jl. Melati No. 12
            <br />
            Bandung, Jawa Barat 40123
          </DataListValue>
        </DataListItem>
        <DataListItem className="border-border mt-2 border-t pt-3">
          <DataListLabel>Total</DataListLabel>
          <DataListValue className="font-medium tabular-nums">
            Rp 1.250.000
          </DataListValue>
        </DataListItem>
      </DataListRoot>
    </div>
  ),
};
