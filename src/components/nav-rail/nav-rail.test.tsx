import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { formatNavCount } from "./format-nav-count";
import { NavRail, NavRailFooter, NavRailHeader, NavRailItem } from "./nav-rail";

const Ikon = () => <svg data-testid="ikon" />;

describe("<NavRail />", () => {
  it("is a labelled navigation landmark", () => {
    render(
      <NavRail aria-label="Navigasi utama">
        <NavRailHeader>S</NavRailHeader>
        <NavRailItem label="Inbox" icon={<Ikon />} />
        <NavRailFooter>RP</NavRailFooter>
      </NavRail>,
    );
    expect(screen.getByRole("navigation", { name: "Navigasi utama" })).toHaveAttribute("data-slot", "nav-rail");
  });

  it("names an icon-only item by its label and marks the active one", () => {
    render(
      <NavRail aria-label="Nav">
        <NavRailItem label="Inbox" icon={<Ikon />} active />
        <NavRailItem label="Nomor" icon={<Ikon />} />
      </NavRail>,
    );
    expect(screen.getByRole("button", { name: "Inbox" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Nomor" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("button", { name: "Nomor" })).toHaveAttribute("title", "Nomor");
  });

  it("shows and announces a count, hidden at zero", () => {
    render(
      <NavRail aria-label="Nav">
        <NavRailItem label="Inbox" icon={<Ikon />} badge={120} />
        <NavRailItem label="Nomor" icon={<Ikon />} badge={0} />
      </NavRail>,
    );
    const inbox = screen.getByRole("button", { name: "Inbox (99+)" });
    expect(inbox.querySelector('[data-slot="nav-rail-badge"]')).toHaveTextContent("99+");
    expect(screen.getByRole("button", { name: "Nomor" }).querySelector('[data-slot="nav-rail-badge"]')).toBeNull();
  });

  it("renders into a router link with asChild, icon and badge inside it", () => {
    render(
      <NavRail aria-label="Nav">
        <NavRailItem asChild label="Inbox" icon={<Ikon />} badge={3}>
          <a href="/inbox" aria-current="page" />
        </NavRailItem>
      </NavRail>,
    );
    const link = screen.getByRole("link", { name: "Inbox (3)" });
    expect(link).toHaveAttribute("href", "/inbox");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toContainElement(screen.getByTestId("ikon"));
    expect(link).not.toHaveAttribute("type");
  });
});

describe("formatNavCount", () => {
  it("caps at 99+", () => {
    expect(formatNavCount(7)).toBe("7");
    expect(formatNavCount(99)).toBe("99");
    expect(formatNavCount(100)).toBe("99+");
  });
});
