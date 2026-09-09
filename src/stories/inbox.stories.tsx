import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArchiveIcon,
  FileEditIcon,
  InboxIcon,
  InfoIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  ShieldAlertIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { ButtonGroup } from "../components/button-group";
import { Card, CardContent } from "../components/card";
import { Checkbox } from "../components/checkbox";
import { Input } from "../components/input";
import { Pagination } from "../components/smart-table";
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/sidebar";

/**
 * A mail client assembled entirely from shipped components — nothing here is
 * exported, and nothing new had to be written for it.
 *
 * The folder list is the point. `SidebarMenu` / `SidebarMenuButton` /
 * `SidebarMenuBadge` render here with **no `SidebarProvider` anywhere on the
 * page**. Until 0.41.0 that threw: the button read the sidebar context
 * unconditionally, for the sake of a tooltip it only needs once a rail has
 * collapsed. This story fails to render if anyone puts that coupling back.
 */
const meta: Meta = {
  title: "Recipes/Inbox",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Sidebar menu primitives + ButtonGroup + label Badges + Checkbox + Pagination. Copy it and give it your own data shape.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const FOLDERS = [
  { key: "inbox", label: "Kotak Masuk", icon: InboxIcon, count: 1253 },
  { key: "starred", label: "Berbintang", icon: StarIcon, count: 245 },
  { key: "sent", label: "Terkirim", icon: SendIcon, count: 24532 },
  { key: "draft", label: "Draf", icon: FileEditIcon, count: 9 },
  { key: "spam", label: "Spam", icon: ShieldAlertIcon, count: 14 },
  { key: "bin", label: "Sampah", icon: Trash2Icon, count: 9 },
] as const;

// The checkbox classes are spelled out rather than built from the key.
// Tailwind scans source for literal strings, so `border-${tone}` would compile
// to a class that is never generated — the box would simply lose its colour.
const LABELS = [
  {
    key: "primary", text: "Primary", badge: "label-teal",
    box: "border-label-teal-text data-[state=checked]:border-label-teal-text data-[state=checked]:bg-label-teal-text",
  },
  {
    key: "social", text: "Social", badge: "label-blue",
    box: "border-label-blue-text data-[state=checked]:border-label-blue-text data-[state=checked]:bg-label-blue-text",
  },
  {
    key: "work", text: "Work", badge: "label-amber",
    box: "border-label-amber-text data-[state=checked]:border-label-amber-text data-[state=checked]:bg-label-amber-text",
  },
  {
    key: "friends", text: "Friends", badge: "label-rose",
    box: "border-label-rose-text data-[state=checked]:border-label-rose-text data-[state=checked]:bg-label-rose-text",
  },
] as const;

type Mail = {
  id: string;
  from: string;
  subject: string;
  time: string;
  label?: (typeof LABELS)[number]["key"];
};

const MAIL: Mail[] = [
  { id: "1", from: "Jullu Jalal", subject: "Program Sarjana Perdagangan kami sudah terakreditasi.", time: "08.38", label: "primary" },
  { id: "2", from: "Minerva Barnett", subject: "Dapatkan pengiklan terbaik di saku Anda", time: "08.13", label: "work" },
  { id: "3", from: "Peter Lewis", subject: "Sewa rumah liburan yang membuahkan hasil", time: "07.52", label: "friends" },
  { id: "4", from: "Anthony Briggs", subject: "Iklan baris gratis untuk mempromosikan barang Anda", time: "07.52" },
  { id: "5", from: "Clifford Morgan", subject: "Tingkatkan potensi merek dengan balon iklan raksasa", time: "04.13", label: "social" },
  { id: "6", from: "Cecilia Webster", subject: "Selalu lihat sisi terang kehidupan", time: "03.52", label: "friends" },
  { id: "7", from: "Harvey Manning", subject: "Catokan sama individualnya dengan yang memakainya", time: "02.30" },
  { id: "8", from: "Willie Blake", subject: "Program Sarjana Perdagangan kami sudah terakreditasi.", time: "08.38", label: "primary" },
];

const LABEL_BY_KEY = Object.fromEntries(LABELS.map((l) => [l.key, l]));

function Inbox() {
  const [folder, setFolder] = useState<string>("inbox");
  const [starred, setStarred] = useState<Set<string>>(new Set(["4", "7"]));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  return (
    <div className="bg-surface flex min-h-screen flex-col gap-5 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Kotak Masuk</h1>

      <div className="grid gap-5 lg:grid-cols-[17rem_1fr]">
        {/* ── Folders and labels ── */}
        <Card className="h-fit">
          <CardContent className="flex flex-col gap-6">
            <Button className="w-full">
              <PlusIcon aria-hidden="true" />
              Tulis Pesan
            </Button>

            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-bold">Surat Saya</h2>
              {/* No SidebarProvider anywhere above this. That is the point. */}
              <SidebarMenu>
                {FOLDERS.map(({ key, label, icon: Icon, count }) => (
                  <SidebarMenuItem key={key}>
                    <SidebarMenuButton
                      isActive={folder === key}
                      onClick={() => setFolder(key)}
                    >
                      <Icon />
                      <span>{label}</span>
                      <SidebarMenuBadge>
                        {count.toLocaleString("id-ID")}
                      </SidebarMenuBadge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold">Label</h2>
              {LABELS.map((l) => (
                <label key={l.key} className="flex items-center gap-3 text-sm">
                  <Checkbox
                    size="sm"
                    defaultChecked
                    // The label's own colour, borrowed from its gated pair —
                    // the -text half is the dark end, which is what a small
                    // solid control wants.
                    className={l.box}
                  />
                  {l.text}
                </label>
              ))}
              <Button variant="ghost" size="sm" className="w-fit px-0">
                <PlusIcon aria-hidden="true" />
                Buat Label Baru
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Message list ── */}
        <Card className="gap-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <Input.Root appearance="search" className="max-w-sm">
              <Input.LeadingIcon>
                <SearchIcon />
              </Input.LeadingIcon>
              <Input.Field placeholder="Cari surat" aria-label="Cari surat" />
            </Input.Root>

            <ButtonGroup aria-label="Tindakan surat">
              <Button variant="ghost" size="icon" aria-label="Arsipkan">
                <ArchiveIcon />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Detail">
                <InfoIcon />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Hapus">
                <Trash2Icon />
              </Button>
            </ButtonGroup>
          </CardContent>

          <ul className="flex flex-col">
            {MAIL.map((m) => {
              const isStarred = starred.has(m.id);
              const label = m.label ? LABEL_BY_KEY[m.label] : undefined;
              return (
                <li
                  key={m.id}
                  className="hover:bg-muted/50 flex items-center gap-3 border-b px-6 py-3 last:border-b-0"
                >
                  <Checkbox
                    size="sm"
                    checked={selected.has(m.id)}
                    onCheckedChange={() => setSelected((s) => toggle(s, m.id))}
                    aria-label={`Pilih surat dari ${m.from}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    pressed={isStarred}
                    onClick={() => setStarred((s) => toggle(s, m.id))}
                    aria-label={
                      isStarred
                        ? `Hapus bintang pada surat dari ${m.from}`
                        : `Beri bintang pada surat dari ${m.from}`
                    }
                    className="shrink-0"
                  >
                    <StarIcon
                      aria-hidden="true"
                      className={
                        isStarred ? "fill-chart-3 text-chart-3" : undefined
                      }
                    />
                  </Button>

                  <span className="w-40 shrink-0 truncate text-sm font-bold">
                    {m.from}
                  </span>
                  {label ? (
                    <Badge variant={label.badge} className="shrink-0">
                      {label.text}
                    </Badge>
                  ) : (
                    <span className="w-0 shrink-0" />
                  )}
                  <span className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
                    {m.subject}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
                    {m.time}
                  </span>
                </li>
              );
            })}
          </ul>

          <CardContent className="pt-4">
            <Pagination
              page={page}
              pageSize={MAIL.length}
              total={1253}
              onPageChange={setPage}
              renderSummary={({ from, to, total }) =>
                `Menampilkan ${from}–${to} dari ${total.toLocaleString("id-ID")}`
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Default: Story = { render: () => <Inbox /> };
