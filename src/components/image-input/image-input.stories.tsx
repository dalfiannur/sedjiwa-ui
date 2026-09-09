import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ImageInput } from "./image-input";
import { Button } from "../button";
import { Card, CardContent } from "../card";
import { Input } from "../input";
import { Label } from "../label";

const meta: Meta<typeof ImageInput> = {
  title: "Forms/ImageInput",
  component: ImageInput,
  argTypes: {
    shape: { control: "select", options: ["circle", "square"] },
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
  },
  args: { shape: "circle", size: "default", state: "default" },
};
export default meta;

type Story = StoryObj<typeof ImageInput>;

/** Stands in for a stored photo. Inline rather than fetched: these stories run
 *  in a real Chromium, and a remote portrait would put a network round-trip
 *  inside the test run. */
const STORED_PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" fill="#4880FF"/>' +
      '<circle cx="32" cy="25" r="11" fill="#ffffff"/>' +
      '<path d="M9 64c0-12.7 10.3-19 23-19s23 6.3 23 19z" fill="#ffffff"/>' +
      "</svg>"
  );

/** Controlled, because the component is: the preview has to be released when
 *  the file changes, and only the owner of the value knows when that is. */
function Controlled(props: React.ComponentProps<typeof ImageInput>) {
  const [file, setFile] = React.useState<File | null>(null);
  return <ImageInput {...props} value={file} onValueChange={setFile} />;
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

/** An edit form: the photo already on the server, ready to be replaced. The
 *  caption reads "Ganti foto" rather than "Unggah foto" — the empty-state
 *  instruction is the wrong one for a control already showing a face. */
export const WithStoredPhoto: Story = {
  args: { src: STORED_PHOTO, onRemove: () => {} },
  render: (args) => <Controlled {...args} />,
};

export const Shapes: Story = {
  render: () => (
    <div className="flex items-start gap-8">
      <Controlled shape="circle" label="Foto profil" />
      <Controlled shape="square" label="Logo perusahaan" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-start gap-8">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Controlled key={size} size={size} label={size} />
      ))}
    </div>
  ),
};

/** The focus ring reaches the picker from the label's group.
 *
 *  Worth measuring rather than asserting by class name: the element that takes
 *  focus is the hidden `<input>`, which is a *sibling* of the picker, so a
 *  `focus-within:` written on the picker itself would compile fine, look right
 *  in review, and never once fire. The ring is a box-shadow, so a browser can
 *  simply be asked whether it changed. */
export const Focus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const picker = canvasElement.querySelector<HTMLElement>(
      '[data-slot="image-input-picker"]'
    )!;
    const control = canvas.getByLabelText("Unggah foto");

    const resting = getComputedStyle(picker).boxShadow;
    control.focus();
    const focused = getComputedStyle(picker).boxShadow;

    await expect(document.activeElement).toBe(control);
    await expect(focused).not.toBe(resting);
  },
  render: (args) => <Controlled {...args} label="Unggah foto" />,
};

export const States: Story = {
  render: () => (
    <div className="flex items-start gap-8">
      {(["default", "error", "success", "warning"] as const).map((state) => (
        <Controlled key={state} state={state} label={state} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Controlled {...args} />,
};

/** What it was lifted from: the "Add New Contact" form. */
export const InAForm: Story = {
  render: () => (
    <Card className="w-[32rem]">
      <CardContent className="flex flex-col gap-8 py-6">
        <Controlled label="Unggah foto" />
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nama-depan">Nama Depan</Label>
            <Input.Root>
              <Input.Field id="nama-depan" placeholder="Masukkan nama depan" />
            </Input.Root>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nama-belakang">Nama Belakang</Label>
            <Input.Root>
              <Input.Field
                id="nama-belakang"
                placeholder="Masukkan nama belakang"
              />
            </Input.Root>
          </div>
        </div>
        <Button className="self-center px-12">Tambah Sekarang</Button>
      </CardContent>
    </Card>
  ),
};
