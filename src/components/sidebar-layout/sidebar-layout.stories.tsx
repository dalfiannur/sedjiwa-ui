import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../sidebar";
import { SidebarLayout } from "./sidebar-layout";

const meta: Meta<typeof SidebarLayout> = {
  title: "Layout/SidebarLayout",
  component: SidebarLayout,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof SidebarLayout>;

/** Sidebar contoh. Di aplikasi sungguhan isinya terikat router masing-masing,
 *  dan justru karena itu ia diserahkan sebagai prop. */
function DemoSidebar() {
  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md font-semibold">
                s
              </span>
              <span className="font-semibold">sedjiwa</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {["Beranda", "Daftar", "Pengaturan"].map((label, i) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton isActive={i === 0}>{label}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export const Default: Story = {
  render: () => (
    <SidebarLayout
      sidebar={<DemoSidebar />}
      headerActions={<Button variant="outline" size="sm">Tema</Button>}
    >
      <h1 className="text-2xl font-semibold tracking-tight">Judul halaman</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Konten duduk di --surface, satu tingkat di bawah cangkangnya.
      </p>
      <div className="bg-card mt-6 rounded-lg border p-6 text-sm">
        Kartu naik lagi di atas konten — tangga tiga tingkat yang sama di kedua mode.
      </div>
    </SidebarLayout>
  ),
};

/** Sidebar tertutup sejak awal, lewat prop yang diteruskan ke SidebarProvider. */
export const SidebarTertutup: Story = {
  render: () => (
    <SidebarLayout sidebar={<DemoSidebar />} defaultOpen={false}>
      <p className="text-sm">Pemicunya ada di kiri header.</p>
    </SidebarLayout>
  ),
};
