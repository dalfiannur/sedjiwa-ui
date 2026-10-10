import type { Meta, StoryObj } from "@storybook/react-vite";
import { EllipsisVerticalIcon } from "lucide-react";
import { ChatBubble, ChatBubbleList } from "./chat-bubble";
import { Avatar, AvatarFallback } from "../avatar";
import { Button } from "../button";

const meta: Meta<typeof ChatBubble> = {
  title: "Data Display/ChatBubble",
  component: ChatBubble,
  argTypes: {
    side: { control: "select", options: ["incoming", "outgoing"] },
  },
  args: { author: "Minerva Barnett", side: "incoming", time: "18.30" },
};
export default meta;

type Story = StoryObj<typeof ChatBubble>;

const avatar = (
  <Avatar className="size-9">
    <AvatarFallback>MB</AvatarFallback>
  </Avatar>
);

const menu = (
  <Button
    variant="ghost"
    size="icon-sm"
    aria-label="Opsi pesan"
    className="-mr-1.5 -my-1 size-6 hover:bg-black/10 dark:hover:bg-white/10"
  >
    <EllipsisVerticalIcon className="size-3.5" />
  </Button>
);

export const Default: Story = {
  render: (args) => (
    <div className="w-[34rem]">
      <ChatBubble {...args} avatar={avatar}>
        Sudah saya cek stoknya, rangka besi hollow tinggal enam batang.
      </ChatBubble>
    </div>
  ),
};

/** A thread. The author is spoken on every bubble even though only the colour
 *  and the side show it on screen. */
export const Thread: Story = {
  render: () => (
    <div className="w-[34rem]">
      <ChatBubbleList aria-label="Percakapan dengan Minerva Barnett">
        <ChatBubble author="Minerva Barnett" avatar={avatar} time="18.30" actions={menu}>
          Sudah saya cek stoknya, rangka besi hollow tinggal enam batang.
        </ChatBubble>
        <ChatBubble author="Moni Roy" side="outgoing" time="18.34" actions={menu}>
          Cukup untuk PO-014. Sisanya kita pesan minggu depan.
        </ChatBubble>
        <ChatBubble author="Minerva Barnett" avatar={avatar} time="18.38" actions={menu}>
          Baik. Saya siapkan purchase order-nya sore ini, nanti saya kirim
          untuk ditinjau sebelum diterbitkan.
        </ChatBubble>
      </ChatBubbleList>
    </div>
  ),
};

/** In a group conversation the name earns its place on screen too. */
export const WithVisibleAuthor: Story = {
  render: () => (
    <div className="w-[34rem]">
      <ChatBubbleList aria-label="Diskusi tim pengadaan">
        <ChatBubble author="Minerva Barnett" avatar={avatar} time="18.30" showAuthor>
          Stok rangka besi hollow tinggal enam batang.
        </ChatBubble>
        <ChatBubble
          author="Dimas Prasetyo"
          avatar={
            <Avatar className="size-9">
              <AvatarFallback>DP</AvatarFallback>
            </Avatar>
          }
          time="18.32"
          showAuthor
        >
          Supplier bilang restock hari Kamis.
        </ChatBubble>
        <ChatBubble author="Moni Roy" side="outgoing" time="18.34" showAuthor>
          Oke, saya tahan dulu PO-nya.
        </ChatBubble>
      </ChatBubbleList>
    </div>
  ),
};

/** Neither a time nor a menu is required. */
export const Bare: Story = {
  render: () => (
    <div className="w-[34rem]">
      <ChatBubbleList aria-label="Percakapan">
        <ChatBubble author="Minerva Barnett" avatar={avatar}>
          Terima kasih!
        </ChatBubble>
      </ChatBubbleList>
    </div>
  ),
};

const inisial = (nama: string, key: string) => (
  <Avatar className="size-7 text-[11px]">
    <AvatarFallback colorKey={key}>{nama}</AvatarFallback>
  </Avatar>
);

/** A WhatsApp-style group thread on a tinted surface: outlined incoming
 *  bubbles, the author once per run (`continued` for the rest), and delivery
 *  ticks on outgoing messages — including one that failed. */
export const GroupThreadWithStatus: Story = {
  render: () => (
    <div className="bg-surface w-[34rem] rounded-xl p-5">
      <ChatBubbleList aria-label="Percakapan dengan Tim Gudang" className="gap-1.5">
        <ChatBubble author="Andi" showAuthor authorClassName="text-label-amber-text" appearance="outlined" avatar={inisial("AN", "628222")} time="16.42">
          Stok kardus ukuran L tinggal 40 pcs.
        </ChatBubble>
        <ChatBubble author="Andi" showAuthor continued appearance="outlined" avatar={inisial("AN", "628222")} time="16.43">
          Perlu dipesan ulang sebelum Jumat.
        </ChatBubble>
        <ChatBubble author="Anda" side="outgoing" time="16.50" status="read" className="mt-2">
          Baik, saya buatkan PO hari ini.
        </ChatBubble>
        <ChatBubble author="Anda" side="outgoing" continued time="16.51" status="delivered">
          Ukuran M masih aman?
        </ChatBubble>
        <ChatBubble author="Sari" showAuthor authorClassName="text-label-lime-text" appearance="outlined" avatar={inisial("SA", "628333")} time="09.12" className="mt-2">
          M masih 120 pcs.
        </ChatBubble>
        <ChatBubble author="Anda" side="outgoing" time="09.20" status="failed" className="mt-2">
          Terima kasih, nanti saya teruskan ke purchasing.
        </ChatBubble>
      </ChatBubbleList>
    </div>
  ),
};
