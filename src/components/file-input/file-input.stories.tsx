import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileInput } from "./file-input";
import { Label } from "../label";

const meta = {
  title: "Forms/FileInput",
  component: FileInput,
  parameters: { layout: "centered" },
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo(props: React.ComponentProps<typeof FileInput>) {
  const [file, setFile] = React.useState<File | null>(null);
  return (
    <div className="w-96">
      <FileInput {...props} value={file} onValueChange={setFile} />
    </div>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};

export const WithLabel: Story = {
  // The root is a <label>, so the field label must associate by htmlFor rather
  // than wrapping — nested labels are invalid HTML.
  render: () => {
    const id = "foto-odometer";
    return (
      <div className="w-96 space-y-1">
        <Label htmlFor={id} className="text-muted-foreground">
          Foto odometer awal *
        </Label>
        <Demo id={id} accept="image/*" capture="environment" />
      </div>
    );
  },
};

export const Selected: Story = {
  render: () => (
    <div className="w-96">
      <FileInput value={new File([""], "odometer-2026-08-03.jpg")} />
    </div>
  ),
};

export const Error: Story = {
  render: () => <Demo state="error" />,
};

export const Disabled: Story = {
  render: () => (
    <div className="w-96">
      <FileInput value={new File([""], "struk-bensin.jpg")} disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="w-96 space-y-3">
      <Demo size="sm" />
      <Demo size="default" />
      <Demo size="lg" />
    </div>
  ),
};

export const LongFilename: Story = {
  render: () => (
    <div className="w-96">
      <FileInput
        value={
          new File(
            [""],
            "foto-kondisi-kendaraan-dummy-vehicle-01-b-1001-dum-2026-08-03-pagi.jpg",
          )
        }
      />
    </div>
  ),
};
