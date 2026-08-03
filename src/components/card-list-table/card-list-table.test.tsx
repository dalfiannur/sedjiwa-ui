import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardListTable } from "./card-list-table";
import type { Column } from "../data-table";

type Person = { id: string; name: string; role: string; status: string };

const PEOPLE: Person[] = [
  { id: "1", name: "Ada", role: "Engineer", status: "Active" },
  { id: "2", name: "Grace", role: "Designer", status: "Away" },
];

const COLUMNS: Column<Person>[] = [
  { key: "status", header: "Status", render: (p) => p.status },
  { key: "name", header: "Name", render: (p) => p.name },
  { key: "role", header: "Role", render: (p) => p.role, align: "right" },
];

describe("<CardListTable />", () => {
  it("renders each column's header label and rendered value for every row", () => {
    render(<CardListTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />);
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
    expect(screen.getAllByText("Name")).toHaveLength(2);
  });

  it("with titleKey, shows that column's value as the card header and omits its label", () => {
    render(
      <CardListTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} titleKey="status" />
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Away")).toBeInTheDocument();
    expect(screen.queryByText("Status")).not.toBeInTheDocument();
  });

  it("renders the action and stops its click from triggering onRowClick", async () => {
    const onRowClick = vi.fn();
    const onAction = vi.fn();
    render(
      <CardListTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        onRowClick={onRowClick}
        renderAction={(p) => <button onClick={onAction}>Act {p.name}</button>}
      />
    );
    await userEvent.click(screen.getByText("Act Ada"));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("fires onRowClick with the row when the card body is clicked", async () => {
    const onRowClick = vi.fn();
    render(
      <CardListTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} onRowClick={onRowClick} />
    );
    await userEvent.click(screen.getByText("Ada"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(PEOPLE[0]);
  });

  it("renders the default empty message when there are no rows", () => {
    render(<CardListTable columns={COLUMNS} rows={[]} getRowKey={(p) => p.id} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders a custom empty message", () => {
    render(
      <CardListTable columns={COLUMNS} rows={[]} getRowKey={(p) => p.id} emptyMessage="Nothing here" />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("applies col.className but NOT align:right to the value cell", () => {
    // align is a table concern. In a two-column label/value list, honouring it
    // drags one value to the far card edge — away from its own label and out
    // of line with every other value ("Penumpang ........ 2 org").
    const cols: Column<Person>[] = [
      { key: "name", header: "Name", render: (p) => p.name },
      { key: "role", header: "Role", render: (p) => p.role, align: "right", className: "font-bold" },
    ];
    render(<CardListTable columns={cols} rows={PEOPLE} getRowKey={(p) => p.id} />);
    const value = screen.getByText("Engineer");
    expect(value).not.toHaveClass("text-right");
    expect(value).toHaveClass("font-bold");
  });

  it("puts the action on the title's line, not in a block below the fields", () => {
    const { container } = render(
      <CardListTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        titleKey="status"
        renderAction={(p) => <button>Act {p.name}</button>}
      />
    );
    const card = container.querySelector('[data-slot="card-list-table-item"]')!;
    const action = screen.getByText("Act Ada");
    const title = screen.getByText("Active");
    // Same header row as the title...
    const header = title.closest("div")!.parentElement!;
    expect(header.contains(action)).toBe(true);
    // ...and that row comes before the field list, not after it.
    const dl = card.querySelector("dl")!;
    expect(header.compareDocumentPosition(dl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders the action even with no titleKey", () => {
    render(
      <CardListTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        renderAction={(p) => <button>Act {p.name}</button>}
      />
    );
    expect(screen.getByText("Act Ada")).toBeInTheDocument();
  });

  it("sizes the label a step below the value so the pair stays legible when both are muted", () => {
    // A column rendered as tier-2 in the table arrives already muted, so colour
    // alone leaves label and value identical. Size carries the distinction.
    render(<CardListTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />);
    expect(screen.getAllByText("Role")[0]).toHaveClass("text-xs");
  });

  it("marks the container dense and tightens the stack gap when dense", () => {
    const { container } = render(
      <CardListTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} dense />
    );
    const wrapper = container.querySelector('[data-slot="card-list-table"]');
    expect(wrapper).toHaveAttribute("data-dense");
    expect(wrapper).toHaveClass("gap-2");
  });

  it("uses the roomier default spacing when not dense", () => {
    const { container } = render(
      <CardListTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />
    );
    const wrapper = container.querySelector('[data-slot="card-list-table"]');
    expect(wrapper).not.toHaveAttribute("data-dense");
    expect(wrapper).toHaveClass("gap-3");
  });

  it("defaults to row orientation", () => {
    const { container } = render(
      <CardListTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />
    );
    const wrapper = container.querySelector('[data-slot="card-list-table"]');
    expect(wrapper).toHaveAttribute("data-orientation", "row");
  });

  it("renders every field's label and value in column orientation", () => {
    const { container } = render(
      <CardListTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        orientation="column"
      />
    );
    const wrapper = container.querySelector('[data-slot="card-list-table"]');
    expect(wrapper).toHaveAttribute("data-orientation", "column");
    // labels + values still present, one per row (2 cards)
    expect(screen.getAllByText("Name")).toHaveLength(2);
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
  });

  it("renders a single shared header row (labels once) when showHeader in column orientation", () => {
    const { container } = render(
      <CardListTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        orientation="column"
        showHeader
      />
    );
    const header = container.querySelector('[data-slot="card-list-table-header"]');
    expect(header).toBeInTheDocument();
    // a divider line separates the header from the cards
    expect(header).toHaveClass("border-b");
    // each column label appears exactly once — in the shared header, not per card
    expect(screen.getAllByText("Name")).toHaveLength(1);
    expect(screen.getAllByText("Role")).toHaveLength(1);
    // values still render for every row
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
  });

  it("with showHeader, titleKey is ignored so its column stays a table column", () => {
    render(
      <CardListTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        orientation="column"
        showHeader
        titleKey="status"
      />
    );
    // "Status" label present (in header) and both status values render as cells
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Away")).toBeInTheDocument();
  });

  it("renders no shared header when showHeader is absent", () => {
    const { container } = render(
      <CardListTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        orientation="column"
      />
    );
    expect(
      container.querySelector('[data-slot="card-list-table-header"]')
    ).not.toBeInTheDocument();
  });
});
