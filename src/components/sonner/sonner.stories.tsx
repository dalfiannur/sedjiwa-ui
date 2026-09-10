import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { toast } from "sonner";
import { Toaster } from "./sonner";
import { Button } from "../button";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    duration: { control: "number" },
    visibleToasts: { control: "number" },
  },
};
export default meta;

type Story = StoryObj<typeof Toaster>;

/**
 * This package exports `<Toaster />` only. `toast()` is imported straight from
 * `sonner` at the call site — deliberately not re-exported, so there is one way
 * to raise a toast rather than two.
 */
export const Default: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button onClick={() => toast("Perubahan tersimpan")}>Munculkan toast</Button>
    </>
  ),
};

/** Each type carries its own glyph, set once on the Toaster. */
export const Types: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast("Netral")}>
          Netral
        </Button>
        <Button variant="outline" onClick={() => toast.success("Tersimpan")}>
          Sukses
        </Button>
        <Button variant="outline" onClick={() => toast.info("Sedang disinkronkan")}>
          Info
        </Button>
        <Button variant="outline" onClick={() => toast.warning("Stok menipis")}>
          Peringatan
        </Button>
        <Button variant="outline" onClick={() => toast.error("Gagal menyimpan")}>
          Galat
        </Button>
      </div>
    </>
  ),
};

/**
 * The kit asks for error toasts that wait to be dismissed rather than timing
 * out. Sonner has one global duration, so that belongs at the call site:
 * `toast.error(msg, { duration: Infinity })`.
 */
export const PersistentError: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button
        variant="destructive"
        onClick={() =>
          toast.error("Gagal menyimpan", {
            description: "Sambungan terputus. Coba lagi setelah daring.",
            duration: Infinity,
          })
        }
      >
        Munculkan galat menetap
      </Button>
    </>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button
        onClick={() =>
          toast("Berkas dipindahkan ke Sampah", {
            action: { label: "Urungkan", onClick: () => toast("Dikembalikan") },
          })
        }
      >
        Pindahkan ke Sampah
      </Button>
    </>
  ),
};

/** Three at once is the ceiling; a fourth pushes the oldest out. */
export const StackLimit: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button
        variant="outline"
        onClick={() => {
          for (let i = 1; i <= 5; i++) toast(`Pesan ${i}`);
        }}
      >
        Munculkan lima sekaligus
      </Button>
    </>
  ),
};

/** Fired here so a toast is actually rendered, not just the button that raises one. */
export const Raised: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button onClick={() => toast.success("Perubahan tersimpan")}>
        Munculkan toast
      </Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Munculkan toast" }));

    // Sonner renders its list in a portal at the end of <body>, and animates
    // the toast in — so it exists in the DOM a frame or two before it is
    // actually visible. Assert on the settled state, not the first paint.
    const body = within(canvasElement.ownerDocument.body);
    const toastEl = await body.findByText("Perubahan tersimpan");
    await waitFor(async () => {
      await expect(toastEl).toBeVisible();
    });
  },
};
