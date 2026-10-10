import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { AuthLayout } from "./auth-layout";

const meta: Meta<typeof AuthLayout> = {
  title: "Layout/AuthLayout",
  component: AuthLayout,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof AuthLayout>;

const brand = (
  <>
    <span className="bg-primary-foreground text-primary grid size-10 place-items-center rounded-xl font-bold lg:size-10">S</span>
    Sedjiwa Inbox
  </>
);

export const SignIn: Story = {
  render: () => (
    <div className="h-[720px]">
      <AuthLayout
        brand={brand}
        headline="Satu inbox untuk semua nomor WhatsApp tim Anda."
        highlights={[
          "Chat pribadi dan grup dari beberapa nomor, dibalas dari satu tempat.",
          "Tandai siapa yang memegang percakapan, tanpa balasan dobel.",
          "Lihat siapa yang sedang membaca dan mengetik, secara langsung.",
        ]}
        note="inbox.sedjiwa.id"
        title="Masuk"
        description={
          <>
            Belum punya workspace? <a href="#" className="text-accent-foreground font-semibold">Buat workspace</a>
          </>
        }
      >
        <form className="flex flex-col gap-4" aria-label="Masuk">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input.Root>
              <Input.Field id="email" type="email" />
            </Input.Root>
          </div>
          <Button size="lg">Masuk</Button>
        </form>
      </AuthLayout>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Masuk" })).toBeInTheDocument();
  },
};
