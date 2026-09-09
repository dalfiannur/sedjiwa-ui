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
