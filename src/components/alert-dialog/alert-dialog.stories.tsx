import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "../button";
import { buttonVariants } from "../button";
import { cn } from "../../lib/cn";

const meta: Meta<typeof AlertDialog> = {
  title: "Components/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof AlertDialog>;

/**
 * For a decision that cannot be undone. It is deliberately harder to dismiss
 * than `Dialog`: no close button, no click-outside, no Escape — the user has to
 * answer. Anything that is merely a form belongs in `Dialog`.
 */
export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Hapus akun</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus akun ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Seluruh data dan riwayat transaksinya ikut hilang. Tindakan ini
            tidak bisa dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/** Not every confirmation is a deletion; the neutral action keeps the default tone. */
export const NonDestructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Terbitkan sekarang</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Terbitkan ke publik?</AlertDialogTitle>
          <AlertDialogDescription>
            Katalog akan terlihat semua orang sampai kamu menariknya kembali.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Nanti saja</AlertDialogCancel>
          <AlertDialogAction>Terbitkan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * The description is not decoration: Radix wires it as the dialog's accessible
 * description, so it is what a screen reader reads after the title. Say what
 * will actually happen there, not "are you sure?".
 */
export const LongDescription: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Kosongkan gudang</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kosongkan Gudang B?</AlertDialogTitle>
          <AlertDialogDescription>
            1.248 item akan ditandai keluar dan dilepas dari setiap rak. Laporan
            stok bulan berjalan ikut dihitung ulang, dan pesanan yang sedang
            menunggu barang dari gudang ini akan berubah status jadi tertunda.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            Kosongkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/** Opened here so the dialog body is rendered, not just its trigger. */
export const Opened: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Hapus akun</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus akun ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Hapus akun" }));

    // Radix portals the dialog outside the story canvas.
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("alertdialog");
    await expect(dialog).toBeVisible();

    // Both answers present: an alert dialog that offers only one is a wall.
    await expect(body.getByRole("button", { name: "Batal" })).toBeVisible();
    await expect(body.getByRole("button", { name: "Hapus" })).toBeVisible();
  },
};
