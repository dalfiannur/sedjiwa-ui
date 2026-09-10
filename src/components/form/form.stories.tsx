import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { expect, userEvent, within } from "storybook/test";
import { MailIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { Textarea } from "../textarea";

const meta: Meta<typeof Form> = {
  title: "Components/Form",
  component: Form,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Form>;

/**
 * `Form` is react-hook-form's provider under a house name; the work is done by
 * the pieces around it. `FormItem` mints one id and hands it to `FormLabel`,
 * `FormControl` and `FormMessage`, so the label points at the field and the
 * error is announced as the field's description — without anyone wiring
 * `htmlFor`, `aria-describedby` or `aria-invalid` by hand.
 */
export const Default: Story = {
  render: () => {
    type Values = { email: string };
    const form = useForm<Values>({ defaultValues: { email: "" } });
    return (
      <Form {...form}>
        <form
          className="w-80 space-y-4"
          onSubmit={form.handleSubmit(() => undefined)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input.Root>
                    <Input.LeadingIcon>
                      <MailIcon />
                    </Input.LeadingIcon>
                    <Input.Field placeholder="you@example.com" {...field} />
                  </Input.Root>
                </FormControl>
                <FormDescription>Kami kirim kode verifikasi ke sini.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Kirim</Button>
        </form>
      </Form>
    );
  },
};

export const SeveralFields: Story = {
  render: () => {
    type Values = { nama: string; bio: string; setuju: boolean };
    const form = useForm<Values>({
      defaultValues: { nama: "", bio: "", setuju: false },
    });
    return (
      <Form {...form}>
        <form
          className="w-80 space-y-4"
          onSubmit={form.handleSubmit(() => undefined)}
        >
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input.Root>
                    <Input.Field {...field} />
                  </Input.Root>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="setuju"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Saya menyetujui ketentuan
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Simpan</Button>
        </form>
      </Form>
    );
  },
};

/** A field already carrying an error, without having to submit for it. */
export const WithError: Story = {
  render: () => {
    type Values = { email: string };
    const form = useForm<Values>({
      defaultValues: { email: "bukan-email" },
      errors: {
        email: { type: "pattern", message: "Masukkan alamat email yang sah" },
      },
    });
    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input.Root>
                    <Input.Field {...field} />
                  </Input.Root>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  },
};

/**
 * The wiring, demonstrated rather than described: submitting empty puts the
 * message on screen *and* flips the field's `aria-invalid`, which is what makes
 * a screen reader announce the failure rather than leaving it as red text.
 */
export const ValidationOnSubmit: Story = {
  render: () => {
    type Values = { email: string };
    const form = useForm<Values>({ defaultValues: { email: "" } });
    return (
      <Form {...form}>
        <form
          className="w-80 space-y-4"
          onSubmit={form.handleSubmit(() => undefined)}
        >
          <FormField
            control={form.control}
            name="email"
            rules={{ required: "Email wajib diisi" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input.Root>
                    <Input.Field {...field} />
                  </Input.Root>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Kirim</Button>
        </form>
      </Form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Kirim" }));

    const message = await canvas.findByText("Email wajib diisi");
    await expect(message).toBeVisible();
    await expect(canvas.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  },
};
