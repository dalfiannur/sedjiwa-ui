import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "./sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

const ITEMS = ["Ketersediaan", "Booking Saya", "Approval", "Kendaraan", "Driver"];

// `collapsible="none"` renders the sidebar in-flow instead of as a
// viewport-fixed panel, so it sits at a sensible size inside the Storybook
// canvas/docs iframe rather than overlaying it edge-to-edge.
function Nav({ active = "Kendaraan" }: { active?: string }) {
  return (
    <Sidebar collapsible="none" className="h-svh">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITEMS.map((label) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton isActive={label === active}>
                    {label}
                  </SidebarMenuButton>
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
    <SidebarProvider>
      <Nav />
    </SidebarProvider>
  ),
};

/**
 * Retinting is done purely by overriding `--sidebar-*` in a scope that wraps
 * the sidebar. No component classes change. The active fill below is
 * oklch(0.55 0.18 265), the only value clearing both 3:1 against the panel
 * and 4.5:1 for its white label.
 */
export const Retinted: Story = {
  name: "Retinted via token override",
  render: () => (
    <SidebarProvider>
      <div
        style={
          {
            "--sidebar": "oklch(0.25 0.1 265)",
            "--sidebar-foreground": "oklch(0.97 0.01 265)",
            "--sidebar-accent": "oklch(0.55 0.18 265)",
            "--sidebar-accent-foreground": "oklch(1 0 0)",
            "--sidebar-border": "oklch(0.32 0.09 265)",
          } as CSSProperties
        }
      >
        <Nav />
      </div>
    </SidebarProvider>
  ),
};
