import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResponsiveTable } from "./responsive-table";
import type { Column } from "../data-table";

type Person = { id: string; name: string; role: string; status: string };

const PEOPLE: Person[] = [
  { id: "1", name: "Ada", role: "Engineer", status: "Active" },
  { id: "2", name: "Grace", role: "Designer", status: "Away" },
];

const COLUMNS: Column<Person>[] = [
  { key: "status", header: "Status", render: (p) => p.status },
  { key: "name", header: "Name", render: (p) => p.name },
  { key: "role", header: "Role", render: (p) => p.role },
];

describe("<ResponsiveTable />", () => {
  it("renders both a real table (desktop) and card list (mobile) from one set of columns", () => {
    const { container } = render(
      <ResponsiveTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="card-list-table"]')
    ).toBeInTheDocument();
  });

  it("hides the table below md and the cards at md and up via breakpoint classes", () => {
    const { container } = render(
      <ResponsiveTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />
    );
    const table = container.querySelector('[data-slot="data-table"]');
    expect(table).toHaveClass("hidden");
    expect(table).toHaveClass("md:block");
    const cards = container.querySelector('[data-slot="card-list-table"]');
    expect(cards).toHaveClass("md:hidden");
  });

  it("forwards cardTitleKey so the mobile card uses it as a header (label not repeated)", () => {
    const { container } = render(
      <ResponsiveTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        cardTitleKey="status"
      />
    );
    const cards = container.querySelector(
      '[data-slot="card-list-table"]'
    ) as HTMLElement;
    // status renders as the card header; its label is not repeated in the card body
    expect(within(cards).queryByText("Status")).not.toBeInTheDocument();
    expect(within(cards).getAllByText("Active").length).toBeGreaterThan(0);
  });

  it("forwards renderAction to both views", async () => {
    const onAction = vi.fn();
    render(
      <ResponsiveTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        renderAction={(p) => <button onClick={onAction}>Act {p.name}</button>}
      />
    );
    // action appears in both the table row and the card (one per view, per row)
    const adaActions = screen.getAllByText("Act Ada");
    expect(adaActions.length).toBe(2);
    await userEvent.click(adaActions[0]!);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("shows the empty message when there are no rows", () => {
    render(
      <ResponsiveTable
        columns={COLUMNS}
        rows={[]}
        getRowKey={(p) => p.id}
        emptyMessage="Belum ada data."
      />
    );
    // rendered by both the table and the card empty states
    expect(screen.getAllByText("Belum ada data.").length).toBeGreaterThan(0);
  });
});
