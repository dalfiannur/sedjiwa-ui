/* Preview surface for the 0.40.0 restyle. Everything the DashStack pass
   touched, on one page, so the change can be judged as a whole rather than
   component by component. Rendered twice — light, then inside `.dark`. */
import {
  ArchiveIcon,
  BellIcon,
  HeartIcon,
  InfoIcon,
  LayoutGridIcon,
  ListIcon,
  BoxIcon,
  ChartLineIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import {
  AreaChart,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselStatus,
  ChartLegend,
  ChartLegendItem,
  DonutChart,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  LineChart,
  NotificationButton,
  Rating,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SmartTable,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Topbar,
  TrendIndicator,
  UserMenuTrigger,
  type SmartColumn,
} from "@qyubit/sedjiwa-ui";

type Deal = {
  id: string;
  product: string;
  location: string;
  when: string;
  piece: number;
  amount: string;
  status: "Terkirim" | "Tertunda" | "Ditolak";
};

const DEALS: Deal[] = [
  { id: "1", product: "Rangka besi hollow", location: "6096 Marjolaine", when: "12.09.2026 · 12.53", piece: 423, amount: "Rp34.295.000", status: "Terkirim" },
  { id: "2", product: "Plat baja 3mm", location: "1420 Cedar Loop", when: "12.09.2026 · 11.20", piece: 128, amount: "Rp12.880.000", status: "Tertunda" },
  { id: "3", product: "Baut M12 galvanis", location: "88 Sudirman Kav.", when: "11.09.2026 · 16.04", piece: 1024, amount: "Rp4.150.000", status: "Ditolak" },
];

const STATUS_VARIANT = {
  Terkirim: "success",
  Tertunda: "warning",
  Ditolak: "destructive",
} as const;

const SMART_COLUMNS: SmartColumn<Deal>[] = [
  { key: "product", header: "Nama Produk", render: (d) => d.product },
  { key: "location", header: "Lokasi", render: (d) => d.location },
  { key: "piece", header: "Jumlah", align: "right", render: (d) => d.piece },
  { key: "amount", header: "Nilai", align: "right", render: (d) => d.amount },
];


const REVENUE = [
  { bulan: "5k", penjualan: 32, laba: 58 },
  { bulan: "10k", penjualan: 38, laba: 44 },
  { bulan: "15k", penjualan: 34, laba: 30 },
  { bulan: "20k", penjualan: 41, laba: 36 },
  { bulan: "25k", penjualan: 52, laba: 48 },
  { bulan: "30k", penjualan: 46, laba: 40 },
  { bulan: "35k", penjualan: 84, laba: 34 },
  { bulan: "40k", penjualan: 48, laba: 52 },
  { bulan: "45k", penjualan: 68, laba: 38 },
  { bulan: "50k", penjualan: 44, laba: 42 },
  { bulan: "55k", penjualan: 40, laba: 78 },
  { bulan: "60k", penjualan: 36, laba: 62 },
];

const ANALYTICS = [
  { tahun: "2015", penjualan: 24, laba: 6 },
  { tahun: "2016", penjualan: 66, laba: 58 },
  { tahun: "2017", penjualan: 58, laba: 40 },
  { tahun: "2018", penjualan: 48, laba: 26 },
  { tahun: "2026", penjualan: 96, laba: 88 },
];

const SERIES = [
  { key: "penjualan", label: "Penjualan" },
  { key: "laba", label: "Laba", color: "var(--chart-5)" },
];

const LABELS = [
  { variant: "label-teal", text: "Primary" },
  { variant: "label-blue", text: "Social" },
  { variant: "label-amber", text: "Work" },
  { variant: "label-rose", text: "Friends" },
  { variant: "label-violet", text: "Riset" },
  { variant: "label-lime", text: "Arsip" },
] as const;

const RATINGS = [4.3, 4.8, 3.6];

const PRODUCTS = [
  { name: "Beats Headphone 2026", price: "Rp1.335.000" },
  { name: "Apple Watch Series 9", price: "Rp6.499.000" },
  { name: "Galaxy Buds Pro", price: "Rp2.150.000" },
];

/** The 28px filter chip that sits in a card header in both dashboards. */
function MonthSelect() {
  return (
    <Select defaultValue="okt">
      <SelectTrigger size="xs" className="w-26">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="okt">Oktober</SelectItem>
        <SelectItem value="nov">November</SelectItem>
        <SelectItem value="des">Desember</SelectItem>
      </SelectContent>
    </Select>
  );
}

function Surface({ label }: { label: string }) {
  return (
    <div className="bg-surface text-foreground flex flex-col gap-8 p-8">
      <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        {label}
      </p>

      {/* ── Topbar ── */}
      <Topbar
        className="rounded-xl shadow-[6px_6px_54px_0_rgb(0_0_0/0.05)] dark:shadow-[6px_6px_54px_0_rgb(0_0_0/0.45)]"
        search={
          <Input.Root appearance="search">
            <Input.LeadingIcon>
              <SearchIcon />
            </Input.LeadingIcon>
            <Input.Field placeholder="Cari" aria-label="Cari" />
          </Input.Root>
        }
      >
        <NotificationButton count={6} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <UserMenuTrigger
              name="Moni Roy"
              role="Admin"
              alwaysShowText
              avatar={
                <Avatar>
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
              }
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Keluar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Topbar>

      {/* ── StatCards ── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Pengguna" value="40.689" tone="primary" icon={<UsersIcon />}
          trend={<TrendIndicator value={8.5} label="dari kemarin" />}
        />
        <StatCard
          label="Total Order" value="10.293" tone="warning" icon={<BoxIcon />}
          trend={<TrendIndicator value={1.3} label="dari minggu lalu" />}
        />
        <StatCard
          label="Total Penjualan" value="Rp89.000.000" tone="success" icon={<ChartLineIcon />}
          trend={<TrendIndicator value={-4.3} label="dari kemarin" />}
        />
        <StatCard
          label="Order Tertunda" value="2.040" tone="destructive" icon={<HistoryIcon />}
          trend={<TrendIndicator value={1.8} polarity="down" label="dari kemarin" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* ── Sidebar ── */}
        <SidebarProvider className="min-h-0 block">
          <div className="bg-sidebar text-sidebar-foreground h-fit rounded-xl p-2 shadow-[6px_6px_54px_0_rgb(0_0_0/0.05)] dark:shadow-[6px_6px_54px_0_rgb(0_0_0/0.45)]">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <LayoutDashboardIcon />
                  <span>Dasbor</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <PackageIcon />
                  <span>Produk</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BellIcon />
                  <span>Kotak Masuk</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <SettingsIcon />
                  <span>Pengaturan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarProvider>

        {/* ── Table ── */}
        <Card>
          <CardHeader>
            <CardTitle>Rincian Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEALS.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <span className="flex items-center gap-3">
                        <span className="bg-muted size-9 shrink-0 rounded-xl" />
                        {d.product}
                      </span>
                    </TableCell>
                    <TableCell>{d.location}</TableCell>
                    <TableCell>{d.when}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.amount}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[d.status]}>{d.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ── SmartTable ── */}
      <SmartTable columns={SMART_COLUMNS} rows={DEALS} getRowKey={(d) => d.id} />


      {/* ── Dashboard #2: Revenue ── */}
      <Card>
        <CardHeader>
          <CardTitle>Pendapatan</CardTitle>
          <MonthSelect />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AreaChart
            data={REVENUE}
            xKey="bulan"
            series={SERIES}
            height={260}
            aria-label="Penjualan dan laba sepanjang 2026, penjualan memuncak di 35k unit"
          />
          <ChartLegend>
            <ChartLegendItem label="Penjualan" color="var(--chart-1)" />
            <ChartLegendItem label="Laba" color="var(--chart-5)" />
          </ChartLegend>
        </CardContent>
      </Card>

      {/* ── Dashboard #2: Customers / Featured Product / Analytics ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Pelanggan</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-5">
            <DonutChart
              data={[
                { label: "Pelanggan baru", value: 34249 },
                { label: "Berulang", value: 1420, color: "var(--chart-2)" },
              ]}
              height={180}
              aria-label="34.249 pelanggan baru berbanding 1.420 pelanggan berulang"
            />
            <ChartLegend className="justify-start gap-x-8">
              <ChartLegendItem label="Pelanggan baru" value="34.249" color="var(--chart-1)" />
              <ChartLegendItem label="Berulang" value="1.420" color="var(--chart-2)" />
            </ChartLegend>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Produk Unggulan</CardTitle></CardHeader>
          <CardContent>
            <Carousel aria-label="Produk unggulan">
              <div className="flex items-center gap-3">
                <CarouselPrevious />
                <CarouselContent className="ml-0">
                  {PRODUCTS.map((p, i) => (
                    <CarouselItem
                      key={p.name}
                      className="pl-0"
                      aria-label={`${i + 1} dari ${PRODUCTS.length}`}
                    >
                      <div className="flex flex-col items-center gap-2 py-4 text-center">
                        <div className="bg-muted size-24 rounded-2xl" />
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-primary text-sm font-medium">{p.price}</span>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext />
              </div>
              <CarouselStatus />
            </Carousel>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Analitik Penjualan</CardTitle></CardHeader>
          <CardContent>
            <LineChart
              data={ANALYTICS}
              xKey="tahun"
              series={SERIES}
              height={200}
              aria-label="Penjualan naik dari 24 pada 2015 ke 96 pada 2026"
            />
          </CardContent>
        </Card>
      </div>


      {/* ── Products page: Rating + the ProductCard recipe ── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <Card key={p.name} className="gap-0 overflow-hidden py-0">
            <Carousel aria-label={`Foto ${p.name}`} className="bg-muted">
              <CarouselContent className="ml-0">
                {["a", "b"].map((shot, j) => (
                  <CarouselItem key={shot} className="pl-0" aria-label={`${j + 1} dari 2`}>
                    <div className="flex aspect-4/3 items-center justify-center">
                      <div className="bg-background/60 size-28 rounded-2xl" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="bg-card/80 absolute top-1/2 left-3 -translate-y-1/2 backdrop-blur-sm" />
              <CarouselNext className="bg-card/80 absolute top-1/2 right-3 -translate-y-1/2 backdrop-blur-sm" />
              <CarouselStatus />
            </Carousel>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-bold">{p.name}</span>
                  <span className="text-primary font-bold">{p.price}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  pressed={i === 0}
                  aria-label={`Simpan ${p.name} ke favorit`}
                  className="shrink-0 rounded-full"
                >
                  <HeartIcon
                    aria-hidden="true"
                    className={i === 0 ? "fill-destructive text-destructive" : undefined}
                  />
                </Button>
              </div>
              <Rating value={RATINGS[i] ?? 4} count={131} size="sm" />
              <Button variant="secondary" className="w-fit">Ubah Produk</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Badges & Buttons ── */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Badge</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Terkirim</Badge>
              <Badge variant="warning">Tertunda</Badge>
              <Badge variant="destructive">Ditolak</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" appearance="subtle">Terkirim</Badge>
              <Badge variant="warning" appearance="subtle">Tertunda</Badge>
              <Badge variant="destructive" appearance="subtle">Ditolak</Badge>
              <Badge variant="info" appearance="subtle">Info</Badge>
            </div>
            {/* Warna label: dipilih pengguna, bukan nada semantik. */}
            <div className="flex flex-wrap gap-2">
              {LABELS.map(({ variant, text }) => (
                <Badge key={variant} variant={variant}>{text}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Button</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>Simpan</Button>
            <Button variant="destructive">Hapus</Button>
            <Button variant="outline">Batal</Button>
            <Button variant="secondary">Draf</Button>
            <Button variant="ghost">Lewati</Button>
            <Button variant="link">Pelajari</Button>
          </CardContent>
        </Card>
      </div>

      {/* ── ButtonGroup ── */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>ButtonGroup</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap items-center gap-5">
            <ButtonGroup aria-label="Tindakan surat">
              <Button variant="ghost" size="icon" aria-label="Arsipkan"><ArchiveIcon /></Button>
              <Button variant="ghost" size="icon" aria-label="Detail"><InfoIcon /></Button>
              <Button variant="ghost" size="icon" aria-label="Hapus"><Trash2Icon /></Button>
            </ButtonGroup>
            <ButtonGroup aria-label="Tampilan">
              <Button variant="ghost" size="icon" pressed aria-label="Kisi"><LayoutGridIcon /></Button>
              <Button variant="ghost" size="icon" pressed={false} aria-label="Daftar"><ListIcon /></Button>
            </ButtonGroup>
            <ButtonGroup aria-label="Rentang">
              <Button variant="ghost">Hari</Button>
              <Button variant="ghost">Minggu</Button>
              <Button variant="ghost" disabled>Tahun</Button>
            </ButtonGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Menu tanpa SidebarProvider</CardTitle></CardHeader>
          <CardContent>
            {/* Sengaja TIDAK dibungkus SidebarProvider: sejak 0.41.0 primitif
                menu berdiri sendiri, dan inilah buktinya. */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <BellIcon />
                  <span>Kotak Masuk</span>
                  <SidebarMenuBadge>1253</SidebarMenuBadge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <ArchiveIcon />
                  <span>Arsip</span>
                  <SidebarMenuBadge>245</SidebarMenuBadge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Trash2Icon />
                  <span>Sampah</span>
                  <SidebarMenuBadge>9</SidebarMenuBadge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </CardContent>
        </Card>
      </div>

      {/* ── Input appearances ── */}
      <Card>
        <CardHeader><CardTitle>Input</CardTitle></CardHeader>
        <CardContent className="grid max-w-xl gap-3 sm:grid-cols-2">
          <Input.Root>
            <Input.Field placeholder="Bawaan" aria-label="Bawaan" />
          </Input.Root>
          <Input.Root appearance="search">
            <Input.LeadingIcon><SearchIcon /></Input.LeadingIcon>
            <Input.Field placeholder="Cari" aria-label="Cari lagi" />
          </Input.Root>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardShowcase() {
  return (
    <div className="-m-8">
      <Surface label="Terang" />
      <div className="dark">
        <Surface label="Gelap" />
      </div>
    </div>
  );
}
