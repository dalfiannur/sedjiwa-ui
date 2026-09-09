import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarIcon, ListFilterIcon, RotateCcwIcon } from "lucide-react";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { ButtonGroup } from "../components/button-group";
import { Calendar } from "../components/date-picker";
import { Card, CardContent } from "../components/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/popover";
import { Pagination } from "../components/smart-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table";

/**
 * An order list with a filter bar.
 *
 * The filter bar is the interesting part: it is `ButtonGroup` holding
 * `Select`s rather than buttons. That works because the group only supplies a
 * frame and seams — it strips its children's own radius, border and shadow,
 * and `role="group"` is the right role for a set of related form controls too.
 * Nothing about it is button-specific except the name.
 */
const meta: Meta = {
  title: "Recipes/Order Lists",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ButtonGroup + Select + Table + label Badges + Pagination. No new components.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/** Order status is not a semantic tone. "In Transit" is not a warning and
 *  "Processing" is not an info — they are states a business named, so they
 *  take the label palette, whose twelve pairs are contrast-gated. */
const STATUS = {
  completed: { text: "Selesai", variant: "label-teal" },
  processing: { text: "Diproses", variant: "label-violet" },
  rejected: { text: "Ditolak", variant: "label-rose" },
  onHold: { text: "Ditahan", variant: "label-amber" },
  inTransit: { text: "Dikirim", variant: "label-blue" },
} as const;

type Order = {
  id: string;
  name: string;
  address: string;
  date: string;
  type: string;
  status: keyof typeof STATUS;
};

const ORDERS: Order[] = [
  { id: "00001", name: "Christine Brooks", address: "089 Kutch Green Apt. 448", date: "04 Sep 2026", type: "Elektronik", status: "completed" },
  { id: "00002", name: "Rosie Pearson", address: "979 Immanuel Ferry Suite 526", date: "28 Mei 2026", type: "Buku", status: "processing" },
  { id: "00003", name: "Darrell Caldwell", address: "8587 Frida Ports", date: "23 Nov 2026", type: "Obat", status: "rejected" },
  { id: "00004", name: "Gilbert Johnston", address: "768 Destiny Lake Suite 600", date: "05 Feb 2026", type: "Ponsel", status: "completed" },
  { id: "00005", name: "Alan Cain", address: "042 Mylene Throughway", date: "29 Jul 2026", type: "Jam", status: "processing" },
  { id: "00006", name: "Alfred Murray", address: "543 Weimann Mountain", date: "15 Agu 2026", type: "Obat", status: "completed" },
  { id: "00007", name: "Maggie Sullivan", address: "New Scottieberg", date: "21 Des 2026", type: "Jam", status: "onHold" },
  { id: "00008", name: "Rosie Todd", address: "New Jon", date: "30 Apr 2026", type: "Obat", status: "inTransit" },
  { id: "00009", name: "Dollie Hines", address: "124 Lyla Forge Suite 975", date: "09 Jan 2026", type: "Buku", status: "rejected" },
];

const FILTERS = [
  { key: "status", label: "Status", options: ["Selesai", "Diproses", "Ditolak", "Ditahan"] },
];

/**
 * The shell both filters share: open state, a draft, and the two moments that
 * matter — re-seed on the way in, commit only on Terapkan.
 *
 * `onOpenChange` is what makes it cheap. Radix routes Escape, click-outside
 * and reopening through that one callback, so discarding the draft on all
 * three is a single line rather than three separate handlers. That is why this
 * stayed a local helper instead of becoming a library component: strip the
 * markup and there are six lines of actual machinery here.
 *
 * `T extends unknown[]` because both filters hold a list, which also gives
 * "is it empty" for free without asking the caller for a comparator.
 */
function FilterPopover<T extends unknown[]>({
  label,
  value,
  empty,
  onApply,
  children,
}: {
  /** Rendered in the trigger; receives the committed value, not the draft. */
  label: (value: T) => React.ReactNode;
  value: T;
  empty: T;
  onApply: (value: T) => void;
  children: (draft: T, setDraft: (value: T) => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T>(value);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setDraft(value);
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={
            value.length > 0
              ? "text-foreground"
              : "text-muted-foreground data-[state=open]:text-foreground"
          }
        >
          {label(value)}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-4">
        {children(draft, setDraft)}
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDraft(empty)}
            disabled={draft.length === 0}
          >
            Kosongkan
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}
          >
            Terapkan
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const ORDER_TYPES = [
  "Kesehatan & Obat",
  "Buku & Alat Tulis",
  "Jasa & Industri",
  "Fesyen & Kecantikan",
  "Rumah & Hunian",
  "Elektronik",
  "Ponsel & Gawai",
  "Aksesori",
];

function OrderLists() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dates, setDates] = useState<Date[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const anyFilter =
    Object.keys(filters).length > 0 || dates.length > 0 || types.length > 0;

  return (
    <div className="bg-surface min-h-screen space-y-5 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Daftar Pesanan</h1>

      {/* ── Filter bar: a ButtonGroup holding Selects, not buttons ── */}
      <ButtonGroup aria-label="Filter pesanan" className="bg-card">
        <span
          aria-hidden="true"
          className="text-muted-foreground flex size-9 items-center justify-center"
        >
          <ListFilterIcon className="size-4" />
        </span>
        <span className="flex h-9 items-center px-4 text-sm font-medium">
          Filter
        </span>

        <FilterPopover
          value={dates}
          empty={[] as Date[]}
          onApply={setDates}
          label={(v) => (
            <>
              <CalendarIcon />
              {v.length === 0 ? "Tanggal" : `${v.length} tanggal dipilih`}
            </>
          )}
        >
          {(draft, setDraft) => (
            <>
              <Calendar
                mode="multiple"
                value={draft}
                onSelect={setDraft}
                autoFocus
                locale="id-ID"
              />
              <p className="text-muted-foreground mt-3 text-xs">
                Anda dapat memilih lebih dari satu tanggal.
              </p>
            </>
          )}
        </FilterPopover>

        <FilterPopover
          value={types}
          empty={[] as string[]}
          onApply={setTypes}
          label={(v) =>
            v.length === 0 ? "Jenis Pesanan" : `${v.length} jenis dipilih`
          }
        >
          {(draft, setDraft) => (
            <>
              <p className="mb-3 font-bold">Pilih Jenis Pesanan</p>
              {/* Toggle chips, not checkboxes: `pressed` emits aria-pressed and
                  data-state="on", so the outline variant's own on-state fill
                  does the work and the state is announced rather than drawn. */}
              <div
                role="group"
                aria-label="Jenis pesanan"
                // flex-wrap, not a fixed grid: equal-width columns squeeze
                // every chip to the narrowest track, and the longest label
                // ("Fesyen & Kecantikan") lost its padding and ran into the
                // pill's own border. A chip should be as wide as its word.
                className="flex max-w-md flex-wrap gap-2"
              >
                {ORDER_TYPES.map((t) => {
                  const on = draft.includes(t);
                  return (
                    <Button
                      key={t}
                      variant="outline"
                      size="sm"
                      pressed={on}
                      onClick={() =>
                        setDraft(
                          on ? draft.filter((x) => x !== t) : [...draft, t],
                        )
                      }
                      className="rounded-full"
                    >
                      {t}
                    </Button>
                  );
                })}
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                Anda dapat memilih lebih dari satu jenis.
              </p>
            </>
          )}
        </FilterPopover>

        {FILTERS.map((f) => (
          <Select
            key={f.key}
            value={filters[f.key] ?? ""}
            onValueChange={(v) => setFilters((s) => ({ ...s, [f.key]: v }))}
          >
            <SelectTrigger aria-label={f.label} className="w-44">
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              {f.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        <Button
          variant="ghost"
          onClick={() => {
            setFilters({});
            setDates([]);
            setTypes([]);
          }}
          disabled={!anyFilter}
          className="text-destructive-text hover:text-destructive-text"
        >
          <RotateCcwIcon />
          Atur Ulang
        </Button>
      </ButtonGroup>

      {/* ── The list ── */}
      <Card className="gap-0">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {["ID", "Nama", "Alamat", "Tanggal", "Jenis", "Status"].map((h) => (
                  <TableHead key={h} className="text-xs tracking-wider uppercase">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ORDERS.map((o) => {
                const s = STATUS[o.status];
                return (
                  <TableRow key={o.id}>
                    <TableCell className="tabular-nums">{o.id}</TableCell>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell className="text-muted-foreground">{o.address}</TableCell>
                    <TableCell className="text-muted-foreground">{o.date}</TableCell>
                    <TableCell className="text-muted-foreground">{o.type}</TableCell>
                    <TableCell>
                      <Badge variant={s.variant}>{s.text}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>

        <CardContent className="pt-4">
          <Pagination
            page={page}
            pageSize={ORDERS.length}
            total={78}
            onPageChange={setPage}
            renderSummary={({ from, to, total }) =>
              `Menampilkan ${from}–${to} dari ${total}`
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Default: Story = { render: () => <OrderLists /> };
