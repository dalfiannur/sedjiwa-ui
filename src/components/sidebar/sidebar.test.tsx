import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent,
  SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarTrigger, useSidebar,
} from "./sidebar";

describe("<Sidebar />", () => {
  it("renders provider + sidebar with menu items", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Item one</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>Footer</SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Item one")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("trigger button is rendered", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>x</SidebarContent>
        </Sidebar>
        <SidebarTrigger data-testid="trigger" />
      </SidebarProvider>
    );
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
  });

  // The menu primitives are generic markup — icon, label, count — and a mail
  // folder list or a settings nav wants that shape without an app shell around
  // it. Reading the sidebar context unconditionally welded them to the shell
  // for the sake of one tooltip.
  it("renders menu items with no provider around them", () => {
    render(
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton isActive>Inbox</SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>Terkirim</SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
    expect(screen.getByText("Inbox")).toBeInTheDocument();
    expect(screen.getByText("Terkirim")).toBeInTheDocument();
  });

  it("still marks the active item without a provider", () => {
    render(<SidebarMenuButton isActive>Inbox</SidebarMenuButton>);
    expect(screen.getByText("Inbox")).toHaveAttribute("data-active", "true");
  });

  // useSidebar itself keeps throwing: a caller reaching for the hook wants the
  // state, and silently handing back null would move the failure somewhere
  // further away.
  it("useSidebar still throws outside the provider", () => {
    function Probe() {
      useSidebar();
      return null;
    }
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/within a SidebarProvider/);
    spy.mockRestore();
  });

  it("useSidebar hook returns context inside the provider", () => {
    function Probe() {
      const { state } = useSidebar();
      return <span data-testid="state">{state}</span>;
    }
    render(
      <SidebarProvider>
        <Probe />
      </SidebarProvider>
    );
    expect(screen.getByTestId("state").textContent).toMatch(/^(expanded|collapsed)$/);
  });
});
