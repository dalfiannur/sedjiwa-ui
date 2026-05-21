import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  BellIcon,
  HomeIcon,
  InfoIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { AppShell, useAppShell } from "./app-shell";
import { Button } from "../button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "../sidebar";

const meta = {
  title: "Components/AppShell",
  component: AppShell.Root,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AppShell.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlaceholderNav() {
  return (
    <nav className="flex flex-col gap-1 p-3 text-sm">
      <div className="text-muted-foreground px-2 pb-2 text-xs font-medium uppercase">
        Navigation
      </div>
      {[
        { icon: HomeIcon, label: "Dashboard" },
        { icon: UsersIcon, label: "Members" },
        { icon: BellIcon, label: "Notifications" },
        { icon: SettingsIcon, label: "Settings" },
      ].map(({ icon: Icon, label }) => (
        <button
          key={label}
          className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-left"
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function HeaderBar({
  title = "Dashboard",
  showAsideTrigger = false,
}: {
  title?: string;
  showAsideTrigger?: boolean;
}) {
  return (
    <div className="flex w-full items-center gap-3 px-4">
      <AppShell.SidebarTrigger />
      <div className="font-semibold">{title}</div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Search">
          <SearchIcon />
        </Button>
        {showAsideTrigger && <AppShell.AsideTrigger />}
      </div>
    </div>
  );
}

function FooterBar() {
  return (
    <div className="text-muted-foreground flex w-full items-center justify-between px-4 text-xs">
      <span>v0.11.0</span>
      <span>© 2026 Sedjiwa UI</span>
    </div>
  );
}

function MainContent({ paragraphs = 3 }: { paragraphs?: number }) {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Welcome back</h1>
      {Array.from({ length: paragraphs }).map((_, i) => (
        <p key={i} className="text-muted-foreground mb-4 max-w-2xl text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </p>
      ))}
    </div>
  );
}

function AsidePanel() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <div className="text-muted-foreground mb-2 text-xs font-medium uppercase">
          Details
        </div>
        <div className="text-sm">
          Right-side context panel for selected items, activity feeds, or
          inline help.
        </div>
      </div>
      <div className="bg-muted rounded-md p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <InfoIcon className="size-4" /> Tip
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          The Aside slot collapses into a Sheet below the aside breakpoint
          (default 1024px).
        </p>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <AppShell.Root>
      <AppShell.Header>
        <HeaderBar />
      </AppShell.Header>
      <AppShell.Sidebar>
        <PlaceholderNav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <MainContent />
      </AppShell.Main>
      <AppShell.Footer>
        <FooterBar />
      </AppShell.Footer>
    </AppShell.Root>
  ),
};

export const StickyChrome: Story = {
  render: () => (
    <AppShell.Root>
      <AppShell.Header sticky>
        <HeaderBar title="Sticky header" />
      </AppShell.Header>
      <AppShell.Sidebar>
        <PlaceholderNav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <MainContent paragraphs={20} />
      </AppShell.Main>
      <AppShell.Footer sticky>
        <FooterBar />
      </AppShell.Footer>
    </AppShell.Root>
  ),
};

export const WithAside: Story = {
  render: () => (
    <AppShell.Root>
      <AppShell.Header>
        <HeaderBar title="With Aside" showAsideTrigger />
      </AppShell.Header>
      <AppShell.Sidebar>
        <PlaceholderNav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <MainContent paragraphs={6} />
      </AppShell.Main>
      <AppShell.Aside>
        <AsidePanel />
      </AppShell.Aside>
      <AppShell.Footer>
        <FooterBar />
      </AppShell.Footer>
    </AppShell.Root>
  ),
};

export const WithExistingSidebarComponent: Story = {
  render: () => (
    <AppShell.Root sidebarWidth="16rem">
      <AppShell.Header>
        <HeaderBar title="Using <Sidebar />" />
      </AppShell.Header>
      <AppShell.Sidebar className="p-0">
        <SidebarProvider>
          <Sidebar collapsible="none" className="w-full">
            <SidebarHeader>
              <div className="px-2 py-1.5 text-sm font-semibold">Acme Inc.</div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {[
                      { icon: HomeIcon, label: "Home" },
                      { icon: UsersIcon, label: "Members" },
                      { icon: SettingsIcon, label: "Settings" },
                    ].map(({ icon: Icon, label }) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton>
                          <Icon />
                          <span>{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div className="text-muted-foreground px-2 text-xs">
                Signed in as uray@qyubit.io
              </div>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      </AppShell.Sidebar>
      <AppShell.Main>
        <MainContent />
      </AppShell.Main>
    </AppShell.Root>
  ),
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => (
    <AppShell.Root>
      <AppShell.Header sticky>
        <HeaderBar title="Mobile" />
      </AppShell.Header>
      <AppShell.Sidebar>
        <PlaceholderNav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <MainContent paragraphs={6} />
      </AppShell.Main>
    </AppShell.Root>
  ),
};

export const CustomSizes: Story = {
  render: () => (
    <AppShell.Root
      headerHeight="80px"
      sidebarWidth="240px"
      asideWidth="360px"
      footerHeight="56px"
    >
      <AppShell.Header>
        <HeaderBar title="Custom sizes" showAsideTrigger />
      </AppShell.Header>
      <AppShell.Sidebar>
        <PlaceholderNav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <MainContent />
      </AppShell.Main>
      <AppShell.Aside>
        <AsidePanel />
      </AppShell.Aside>
      <AppShell.Footer>
        <FooterBar />
      </AppShell.Footer>
    </AppShell.Root>
  ),
};

function ControlledShell() {
  const [open, setOpen] = useState(true);
  return (
    <AppShell.Root sidebarOpen={open} onSidebarOpenChange={setOpen}>
      <AppShell.Header>
        <div className="flex w-full items-center gap-3 px-4">
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Close sidebar" : "Open sidebar"}
          </Button>
          <span className="text-sm">External state: {String(open)}</span>
        </div>
      </AppShell.Header>
      <AppShell.Sidebar>
        <PlaceholderNav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <MainContent paragraphs={4} />
      </AppShell.Main>
    </AppShell.Root>
  );
}

export const ControlledSidebar: Story = {
  render: () => <ControlledShell />,
};

function ConsumerTriggers() {
  const { sidebarOpen, asideOpen } = useAppShell();
  return (
    <div className="text-muted-foreground text-xs">
      sidebar:{String(sidebarOpen)} · aside:{String(asideOpen)}
    </div>
  );
}

export const UsingUseAppShell: Story = {
  render: () => (
    <AppShell.Root>
      <AppShell.Header>
        <div className="flex w-full items-center gap-3 px-4">
          <AppShell.SidebarTrigger />
          <AppShell.AsideTrigger />
          <ConsumerTriggers />
        </div>
      </AppShell.Header>
      <AppShell.Sidebar>
        <PlaceholderNav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <MainContent />
      </AppShell.Main>
      <AppShell.Aside>
        <AsidePanel />
      </AppShell.Aside>
    </AppShell.Root>
  ),
};
