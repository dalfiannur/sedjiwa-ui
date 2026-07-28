import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SmartTable, type SmartColumn } from "./smart-table";

type Order = { id: string; name: string; phone: string; status: string };

const ORDERS: Order[] = [
  { id: "504513718", name: "Linda's Asian Kitchen", phone: "(555) 555-5555", status: "Not Called" },
  { id: "504513701", name: "Krazy Pizza and Wings", phone: "(303) 555-0105", status: "Pending" },
];

const COLUMNS: SmartColumn<Order>[] = [
  { key: "id", header: "Order ID", render: (o) => o.id },
  { key: "name", header: "Name", render: (o) => o.name },
  { key: "phone", header: "Phone", render: (o) => o.phone, align: "right" },
];

describe("<SmartTable />", () => {
  it("renders each column header and each row's cells", () => {
    render(<SmartTable columns={COLUMNS} rows={ORDERS} getRowKey={(o) => o.id} />);
    expect(screen.getByText("Order ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Linda's Asian Kitchen")).toBeInTheDocument();
    expect(screen.getByText("(303) 555-0105")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(ORDERS.length + 1); // + header
  });

  it("renders a leading cell per row and the leading header when renderLeading is set", () => {
    render(
      <SmartTable
        columns={COLUMNS}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        leadingHeader={<span>lead-head</span>}
        renderLeading={(o) => <span>lead-{o.id}</span>}
      />
    );
    expect(screen.getByText("lead-head")).toBeInTheDocument();
    expect(screen.getByText("lead-504513718")).toBeInTheDocument();
    expect(screen.getByText("lead-504513701")).toBeInTheDocument();
  });

  it("renders an interactive column menu only when headerMenu is provided", () => {
    const cols: SmartColumn<Order>[] = [
      { key: "id", header: "Order ID", render: (o) => o.id, headerMenu: <div>menu</div> },
      { key: "name", header: "Name", render: (o) => o.name },
    ];
    render(<SmartTable columns={cols} rows={ORDERS} getRowKey={(o) => o.id} />);
    const triggers = screen.getAllByLabelText("Column options");
    expect(triggers).toHaveLength(1);
  });

  it("fires row action without triggering onRowClick", async () => {
    const onRowClick = vi.fn();
    const onAction = vi.fn();
    render(
      <SmartTable
        columns={COLUMNS}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        onRowClick={onRowClick}
        renderAction={(o) => <button onClick={onAction}>act-{o.id}</button>}
      />
    );
    await userEvent.click(screen.getByText("act-504513718"));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("fires onRowClick when the row body is clicked", async () => {
    const onRowClick = vi.fn();
    render(
      <SmartTable columns={COLUMNS} rows={ORDERS} getRowKey={(o) => o.id} onRowClick={onRowClick} />
    );
    await userEvent.click(screen.getByText("Linda's Asian Kitchen"));
    expect(onRowClick).toHaveBeenCalledWith(ORDERS[0]);
  });

  it("reserves grid tracks for the leading and action columns", () => {
    const { container } = render(
      <SmartTable
        columns={COLUMNS}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        renderLeading={() => <span>x</span>}
        renderAction={() => <button>y</button>}
      />
    );
    const header = container.querySelector(
      '[data-slot="smart-table-header"]'
    ) as HTMLElement;
    expect(header.style.gridTemplateColumns).toContain("2.75rem");
    expect(header.style.gridTemplateColumns).toContain("3rem");
  });

  it("shows the empty message when there are no rows", () => {
    render(
      <SmartTable columns={COLUMNS} rows={[]} getRowKey={(o) => o.id} emptyMessage="Belum ada order." />
    );
    expect(screen.getByText("Belum ada order.")).toBeInTheDocument();
  });

  it("does not render a card fallback by default", () => {
    const { container } = render(
      <SmartTable columns={COLUMNS} rows={ORDERS} getRowKey={(o) => o.id} />
    );
    expect(
      container.querySelector('[data-slot="card-list-table"]')
    ).not.toBeInTheDocument();
  });

  it("renders a mobile card fallback (and a md-only table) when responsive", () => {
    const { container } = render(
      <SmartTable
        columns={COLUMNS}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        responsive
        cardTitleKey="id"
      />
    );
    const cards = container.querySelector('[data-slot="card-list-table"]');
    expect(cards).toBeInTheDocument();
    expect(cards).toHaveClass("md:hidden");
    // table still rendered (CSS-hidden below md)
    expect(screen.getByRole("table")).toBeInTheDocument();
    const tableCard = container.querySelector('[role="table"]')
      ?.parentElement as HTMLElement;
    expect(tableCard).toHaveClass("md:block");
  });
});
