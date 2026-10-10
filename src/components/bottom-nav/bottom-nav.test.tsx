import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav, BottomNavItem } from "./bottom-nav";

const Ikon = () => <svg data-testid="ikon" />;

describe("<BottomNav />", () => {
  it("is a labelled navigation landmark with visible labels", () => {
    render(
      <BottomNav aria-label="Navigasi utama">
        <BottomNavItem label="Inbox" icon={<Ikon />} active />
        <BottomNavItem label="Nomor" icon={<Ikon />} />
      </BottomNav>,
    );
    expect(screen.getByRole("navigation", { name: "Navigasi utama" })).toHaveAttribute("data-slot", "bottom-nav");
    expect(screen.getByRole("button", { name: "Inbox" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Nomor")).toBeVisible();
  });

  it("puts a count on the icon and announces it, hidden at zero", () => {
    render(
      <BottomNav aria-label="Nav">
        <BottomNavItem label="Inbox" icon={<Ikon />} badge={2} />
        <BottomNavItem label="Nomor" icon={<Ikon />} badge={0} />
      </BottomNav>,
    );
    const inbox = screen.getByRole("button", { name: "Inbox (2)" });
    expect(inbox.querySelector('[data-slot="bottom-nav-badge"]')).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: "Nomor" }).querySelector('[data-slot="bottom-nav-badge"]')).toBeNull();
  });

  it("renders into a router link with asChild", () => {
    render(
      <BottomNav aria-label="Nav">
        <BottomNavItem asChild label="Inbox" icon={<Ikon />}>
          <a href="/inbox" />
        </BottomNavItem>
      </BottomNav>,
    );
    const link = screen.getByRole("link", { name: "Inbox" });
    expect(link).toHaveAttribute("href", "/inbox");
    expect(link).toContainElement(screen.getByTestId("ikon"));
  });
});
