import { describe, expect, it } from "vitest";
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
