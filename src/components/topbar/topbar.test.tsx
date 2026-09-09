import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Topbar } from "./topbar";

describe("<Topbar />", () => {
  it("renders as a banner landmark", () => {
    render(<Topbar />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders the leading, search and action slots", () => {
    const { container } = render(
      <Topbar leading={<span>menu</span>} search={<input aria-label="Cari" />}>
        <button type="button">Keluar</button>
      </Topbar>,
    );
    expect(container.querySelector('[data-slot="topbar-leading"]')).toHaveTextContent(
      "menu",
    );
    expect(screen.getByLabelText("Cari")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keluar" })).toBeInTheDocument();
  });

  it("omits the leading and search wrappers when unused", () => {
    const { container } = render(<Topbar />);
    expect(container.querySelector('[data-slot="topbar-leading"]')).toBeNull();
    expect(container.querySelector('[data-slot="topbar-search"]')).toBeNull();
  });

  // ml-auto on the actions, not justify-between on the bar: the actions must
  // sit right whether or not a search slot is there to push them.
  it("keeps the actions wrapper even with no search", () => {
    const { container } = render(
      <Topbar>
        <button type="button">Keluar</button>
      </Topbar>,
    );
    expect(container.querySelector('[data-slot="topbar-actions"]')).toHaveClass(
      "ml-auto",
    );
  });
});
