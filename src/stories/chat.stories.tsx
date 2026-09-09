import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  ImageIcon,
  MicIcon,
  PaperclipIcon,
  PrinterIcon,
  SendIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../components/avatar";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { ButtonGroup } from "../components/button-group";
import { Card } from "../components/card";
import { ChatBubble, ChatBubbleList } from "../components/chat-bubble";
import { Input } from "../components/input";

/**
 * A message thread, assembled from shipped components. Only `ChatBubble` is
 * new; the header is `Button` + `Badge` + `ButtonGroup`, and the composer is
 * the compound `Input` with its icon and action slots.
 *
 * The composer deliberately stays a single-line `Input`. An auto-growing
 * textarea with Enter-to-send is **application behaviour**, not a UI
 * primitive: whether Enter sends or breaks the line, whether Shift inverts it,
 * whether a draft survives navigation — those are product decisions, and a
 * library that answers them for you is a library you fight.
 */
const meta: Meta = {
  title: "Recipes/Chat",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ChatBubble + ButtonGroup + Badge + Input. Copy it and wire it to your own transport.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

type Message = {
  id: string;
  author: string;
  side: "incoming" | "outgoing";
  body: string;
  time: string;
};

const THREAD: Message[] = [
  {
    id: "1",
    author: "Minerva Barnett",
    side: "incoming",
    body: "Sudah saya cek stoknya. Rangka besi hollow tinggal enam batang, dan supplier baru bisa restock hari Kamis.",
    time: "18.30",
  },
  {
    id: "2",
    author: "Moni Roy",
    side: "outgoing",
    body: "Enam cukup untuk PO-014. Sisanya kita pesan minggu depan saja.",
    time: "18.34",
  },
  {
    id: "3",
    author: "Minerva Barnett",
    side: "incoming",
    body: "Baik. Saya siapkan purchase order-nya sore ini, nanti saya kirim untuk ditinjau sebelum diterbitkan.",
    time: "18.38",
  },
];

const AVATAR = (
  <Avatar className="size-9">
    <AvatarFallback>MB</AvatarFallback>
  </Avatar>
);

function messageMenu(author: string) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Opsi pesan dari ${author}`}
      className="-my-1 -mr-1.5 size-6 hover:bg-black/10 dark:hover:bg-white/10"
    >
      <EllipsisVerticalIcon className="size-3.5" />
    </Button>
  );
}

function Chat() {
  const [draft, setDraft] = useState("");
  const [starred, setStarred] = useState(false);

  return (
    <div className="bg-surface min-h-screen p-6">
      <Card className="mx-auto flex max-w-4xl flex-col gap-0 overflow-hidden py-0">
        {/* ── Thread header ── */}
        <header className="flex items-center gap-3 border-b px-5 py-4">
          <Button variant="ghost" size="icon" aria-label="Kembali ke daftar surat">
            <ArrowLeftIcon />
          </Button>
          <h2 className="truncate text-lg font-bold">Minerva Barnett</h2>
          <Badge variant="label-rose">Friends</Badge>

          <ButtonGroup aria-label="Tindakan percakapan" className="ml-auto">
            <Button variant="ghost" size="icon" aria-label="Cetak">
              <PrinterIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              pressed={starred}
              onClick={() => setStarred((s) => !s)}
              aria-label={starred ? "Hapus bintang" : "Beri bintang"}
            >
              <StarIcon className={starred ? "fill-chart-3 text-chart-3" : undefined} />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Hapus percakapan">
              <Trash2Icon />
            </Button>
          </ButtonGroup>
        </header>

        {/* ── Messages ── */}
        <ChatBubbleList
          aria-label="Percakapan dengan Minerva Barnett"
          className="flex-1 px-5 py-6"
        >
          {THREAD.map((m) => (
            <ChatBubble
              key={m.id}
              author={m.author}
              side={m.side}
              avatar={m.side === "incoming" ? AVATAR : undefined}
              time={m.time}
              actions={messageMenu(m.author)}
            >
              {m.body}
            </ChatBubble>
          ))}
        </ChatBubbleList>

        {/* ── Composer ── */}
        <form
          className="flex items-center gap-3 border-t px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            setDraft("");
          }}
        >
          <Input.Root className="flex-1">
            <Input.LeadingIcon>
              <MicIcon />
            </Input.LeadingIcon>
            <Input.Field
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Tulis pesan"
              aria-label="Tulis pesan"
            />
            <Input.Action aria-label="Lampirkan berkas">
              <PaperclipIcon />
            </Input.Action>
            <Input.Action aria-label="Lampirkan gambar">
              <ImageIcon />
            </Input.Action>
          </Input.Root>

          <Button type="submit" disabled={draft.trim() === ""}>
            Kirim
            <SendIcon />
          </Button>
        </form>
      </Card>
    </div>
  );
}

export const Default: Story = { render: () => <Chat /> };
