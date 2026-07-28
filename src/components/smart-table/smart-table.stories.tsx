import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheck, EllipsisVertical } from "lucide-react";
import { SmartTable, type SmartColumn } from "./smart-table";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Badge } from "../badge";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../dropdown-menu";

type Order = {
  id: string;
  name: string;
  address: string;
  avatar: string;
  detail: string;
  duration: string;
  phone: string;
  date: string;
  time: string;
  status: "Not Called" | "Pending" | "Called";
};

const ORDERS: Order[] = [
  { id: "504513718", name: "Linda's Asian Kitchen", address: "1547 Ralph Ave, Brooklyn, NY 11296", avatar: "https://i.pravatar.cc/64?img=1", detail: "Service/Product", duration: "Duration: 20 mins", phone: "(555) 555-5555", date: "08/28/2025", time: "06:00 AM–10:00 AM", status: "Not Called" },
  { id: "504513701", name: "Krazy Pizza and Wings", address: "8301 Flatlands Ave, New York, NY 11235", avatar: "https://i.pravatar.cc/64?img=2", detail: "Delivery", duration: "20 mins", phone: "(303) 555-0105", date: "08/23/2025", time: "06:00 AM–10:30 AM", status: "Pending" },
  { id: "504513703", name: "Modhubon Sweets & R…", address: "8225 Avenue D, New York, NY 11236", avatar: "https://i.pravatar.cc/64?img=3", detail: "Service/Product", duration: "Preferred 20 min", phone: "(302) 555-0107", date: "08/26/2025", time: "06:00 AM–11:00 AM", status: "Called" },
  { id: "504513702", name: "Blue Collar Hamburgers", address: "1266 Pennsylvania Ave, New York, NY 11239", avatar: "https://i.pravatar.cc/64?img=4", detail: "Service/Product", duration: "Preferred 20 min", phone: "(480) 555-0103", date: "08/27/2025", time: "06:00 AM–11:30 AM", status: "Not Called" },
  { id: "504513707", name: "Cameron Williamson", address: "W. 12:30 PM–02:30 PM", avatar: "https://i.pravatar.cc/64?img=5", detail: "Service/Product", duration: "Preferred 20 min", phone: "(702) 555-0122", date: "08/26/2025", time: "06:00 AM–13:00 AM", status: "Pending" },
  { id: "504513719", name: "Cody Fisher", address: "7245 Avenue D, New York, NY 11235", avatar: "https://i.pravatar.cc/64?img=6", detail: "Service/Product", duration: "Preferred 20 min", phone: "(406) 555-0120", date: "05/24/2025", time: "06:00 AM–01:30 PM", status: "Not Called" },
  { id: "504513720", name: "Darlene Robertson", address: "Avenue D, New York, NY 11249", avatar: "https://i.pravatar.cc/64?img=7", detail: "Service/Product", duration: "Preferred 20 min", phone: "(684) 555-0102", date: "04/23/2025", time: "06:00 AM–02:00 AM", status: "Called" },
];

const statusStyles: Record<Order["status"], string> = {
  "Not Called": "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
  Pending: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  Called: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
};

const colMenu = (
  <>
    <DropdownMenuItem>Sort ascending</DropdownMenuItem>
    <DropdownMenuItem>Sort descending</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Hide column</DropdownMenuItem>
  </>
);

const COLUMNS: SmartColumn<Order>[] = [
  { key: "id", header: "Order ID", width: "10rem", headerMenu: colMenu, render: (o) => <span className="text-muted-foreground font-medium">{o.id}</span> },
  {
    key: "name",
    header: "Name",
    width: "minmax(0, 1.6fr)",
    headerMenu: colMenu,
    render: (o) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarImage src={o.avatar} alt="" />
          <AvatarFallback>{o.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">{o.name}</p>
          <p className="text-muted-foreground truncate text-xs">{o.address}</p>
        </div>
      </div>
    ),
  },
  {
    key: "detail",
    header: "Order Details",
    headerMenu: colMenu,
    render: (o) => (
      <div className="min-w-0">
        <p className="text-foreground truncate">{o.detail}</p>
        <p className="text-muted-foreground truncate text-xs">{o.duration}</p>
      </div>
    ),
  },
  { key: "phone", header: "Phone", headerMenu: colMenu, render: (o) => <span className="text-muted-foreground">{o.phone}</span> },
  {
    key: "schedule",
    header: "Schedule",
    headerMenu: colMenu,
    render: (o) => (
      <div className="min-w-0">
        <p className="text-foreground truncate">{o.date}</p>
        <p className="text-muted-foreground truncate text-xs">{o.time}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "9rem",
    headerMenu: colMenu,
    render: (o) => (
      <Badge variant="outline" className={statusStyles[o.status] + " rounded-full px-3 py-1 font-medium"}>
        {o.status}
      </Badge>
    ),
  },
];

const meta: Meta<typeof SmartTable<Order>> = {
  title: "Components/SmartTable",
  component: SmartTable,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof SmartTable<Order>>;

export const SmartOrders: Story = {
  render: () => (
    <div className="bg-muted/30 min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          <span className="text-primary">Smart</span> Orders
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">Smart order tracking made effortless</p>
        <SmartTable
          columns={COLUMNS}
          rows={ORDERS}
          getRowKey={(o) => o.id}
          minWidth="60rem"
          responsive
          cardTitleKey="status"
          dense
          pagination={{
            page: 2,
            pageSize: 7,
            total: 43,
            onPageChange: () => {},
            renderSummary: ({ from, to, total }) => `Showing ${from}–${to} of ${total}`,
          }}
          leadingHeader={<CircleCheck className="text-muted-foreground/60 size-4" />}
          renderLeading={() => <CircleCheck className="text-muted-foreground/50 size-5" strokeWidth={1.75} />}
          renderAction={() => (
            <button
              aria-label="Row options"
              className="text-muted-foreground/60 hover:text-foreground hover:bg-muted flex size-7 items-center justify-center rounded-md transition-colors"
            >
              <EllipsisVertical className="size-4" />
            </button>
          )}
        />
      </div>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="p-8">
      <SmartTable columns={COLUMNS} rows={[]} getRowKey={(o) => o.id} emptyMessage="Belum ada order." />
    </div>
  ),
};
