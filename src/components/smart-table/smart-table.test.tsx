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

  it("right-aligns a right-aligned column's header, not just its cells", () => {
    // The fixture has always had a right-aligned column, but nothing asserted
    // on its header — so the header rendering hard left above right-aligned
    // values shipped unnoticed until it was seen against real rows.
    const { container } = render(
      <SmartTable columns={COLUMNS} rows={ORDERS} getRowKey={(o) => o.id} />,
    );
    const headers = container.querySelectorAll('[role="columnheader"]');
    const phoneHeader = Array.from(headers).find((h) =>
      h.textContent?.includes("Phone"),
    )!;

    expect(phoneHeader.querySelector(".text-right")).not.toBeNull();
    // and the cells under it agree
    expect(
      screen.getByText("(303) 555-0105").closest(".text-right"),
    ).not.toBeNull();
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

  it("shows a ⋮ menu on every hideable column (hideable by default)", () => {
    render(<SmartTable columns={COLUMNS} rows={ORDERS} getRowKey={(o) => o.id} />);
    expect(screen.getAllByLabelText("Column options")).toHaveLength(3);
  });

  it("does not offer sorting for a column without a sortAccessor, but offers Hide", async () => {
    render(<SmartTable columns={COLUMNS} rows={ORDERS} getRowKey={(o) => o.id} />);
    await userEvent.click(screen.getAllByLabelText("Column options")[0]!);
    expect(screen.queryByText("Sort ascending")).not.toBeInTheDocument();
    expect(screen.getByText("Hide column")).toBeInTheDocument();
  });

  it("sorts rows client-side when a sortable column's Sort item is clicked", async () => {
    const cols: SmartColumn<Order>[] = [
      { key: "name", header: "Name", render: (o) => o.name, sortAccessor: (o) => o.name },
      { key: "phone", header: "Phone", render: (o) => o.phone },
    ];
    render(<SmartTable columns={cols} rows={ORDERS} getRowKey={(o) => o.id} />);
    await userEvent.click(screen.getAllByLabelText("Column options")[0]!);
    await userEvent.click(screen.getByText("Sort ascending"));
    const cells = screen.getAllByRole("cell").map((c) => c.textContent);
    const krazyIdx = cells.findIndex((t) => t?.startsWith("Krazy"));
    const lindaIdx = cells.findIndex((t) => t?.startsWith("Linda"));
    expect(krazyIdx).toBeGreaterThanOrEqual(0);
    expect(krazyIdx).toBeLessThan(lindaIdx);
  });

  it("hides a column via its menu and restores it via Show all columns", async () => {
    render(<SmartTable columns={COLUMNS} rows={ORDERS} getRowKey={(o) => o.id} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    await userEvent.click(screen.getAllByLabelText("Column options")[1]!);
    await userEvent.click(screen.getByText("Hide column"));
    expect(screen.queryByText("Name")).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByLabelText("Column options")[0]!);
    await userEvent.click(screen.getByText("Show all columns"));
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("localizes the built-in menu via menuLabels", async () => {
    render(
      <SmartTable
        columns={COLUMNS}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        menuLabels={{ hideColumn: "Sembunyikan kolom" }}
      />
    );
    await userEvent.click(screen.getAllByLabelText("Column options")[0]!);
    expect(screen.getByText("Sembunyikan kolom")).toBeInTheDocument();
  });

  it("controlled sort: emits onSortChange with the column's sortField and does not sort client-side", async () => {
    const onSortChange = vi.fn();
    const cols: SmartColumn<Order>[] = [
      { key: "name", header: "Name", render: (o) => o.name, sortField: "name", sortAccessor: (o) => o.name },
      { key: "phone", header: "Phone", render: (o) => o.phone },
    ];
    render(
      <SmartTable
        columns={cols}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        sortState={null}
        onSortChange={onSortChange}
      />
    );
    await userEvent.click(screen.getAllByLabelText("Column options")[0]!);
    await userEvent.click(screen.getByText("Sort ascending"));
    expect(onSortChange).toHaveBeenCalledWith({ key: "name", dir: "asc" });
    // rows stay in the given (server) order — no client reorder
    const cells = screen.getAllByRole("cell").map((c) => c.textContent);
    const lindaIdx = cells.findIndex((t) => t?.startsWith("Linda"));
    const krazyIdx = cells.findIndex((t) => t?.startsWith("Krazy"));
    expect(lindaIdx).toBeLessThan(krazyIdx); // original order preserved
  });

  it("controlled sort: a column without sortField offers no sorting", async () => {
    const cols: SmartColumn<Order>[] = [
      { key: "name", header: "Name", render: (o) => o.name, sortField: "name" },
      { key: "phone", header: "Phone", render: (o) => o.phone },
    ];
    render(
      <SmartTable
        columns={cols}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        sortState={null}
        onSortChange={vi.fn()}
      />
    );
    // phone column (no sortField) → menu has only Hide, no Sort
    await userEvent.click(screen.getAllByLabelText("Column options")[1]!);
    expect(screen.queryByText("Sort ascending")).not.toBeInTheDocument();
    expect(screen.getByText("Hide column")).toBeInTheDocument();
  });

  it("controlled sort: reflects sortState in the header (aria-sort)", () => {
    const cols: SmartColumn<Order>[] = [
      { key: "name", header: "Name", render: (o) => o.name, sortField: "name" },
    ];
    const { container } = render(
      <SmartTable
        columns={cols}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        sortState={{ key: "name", dir: "desc" }}
        onSortChange={vi.fn()}
      />
    );
    const header = container.querySelector('[role="columnheader"]');
    expect(header).toHaveAttribute("aria-sort", "descending");
  });

  it("renders custom headerMenu content when provided", async () => {
    const cols: SmartColumn<Order>[] = [
      { key: "id", header: "Order ID", render: (o) => o.id, headerMenu: <div>custom-menu</div> },
      { key: "name", header: "Name", render: (o) => o.name },
    ];
    render(<SmartTable columns={cols} rows={ORDERS} getRowKey={(o) => o.id} />);
    await userEvent.click(screen.getAllByLabelText("Column options")[0]!);
    expect(screen.getByText("custom-menu")).toBeInTheDocument();
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

  it("renders a pager when there is more than one page and navigates", async () => {
    const onPageChange = vi.fn();
    render(
      <SmartTable
        columns={COLUMNS}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        pagination={{ page: 1, pageSize: 2, total: 6, onPageChange }}
      />
    );
    expect(screen.getByLabelText("Page 2")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Next page"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("does not render a pager for a single page", () => {
    render(
      <SmartTable
        columns={COLUMNS}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        pagination={{ page: 1, pageSize: 10, total: 2, onPageChange: vi.fn() }}
      />
    );
    expect(
      screen.queryByRole("navigation", { name: "Pagination" })
    ).not.toBeInTheDocument();
  });

  it("shows a pagination summary via renderSummary", () => {
    render(
      <SmartTable
        columns={COLUMNS}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        pagination={{
          page: 1,
          pageSize: 2,
          total: 6,
          onPageChange: vi.fn(),
          renderSummary: ({ from, to, total }) => `Show ${from}-${to}/${total}`,
        }}
      />
    );
    expect(screen.getByText("Show 1-2/6")).toBeInTheDocument();
  });

  const headerTexts = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[role="columnheader"]')).map(
      (h) => h.textContent,
    );

  it("moves a column left/right via its menu", async () => {
    const { container } = render(
      <SmartTable columns={COLUMNS} rows={ORDERS} getRowKey={(o) => o.id} />,
    );
    await userEvent.click(screen.getAllByLabelText("Column options")[1]!);
    await userEvent.click(screen.getByText("Move left"));
    expect(headerTexts(container)).toEqual(["Name", "Order ID", "Phone"]);
    // cells follow the header
    const firstRow = screen.getAllByRole("row")[1]!;
    expect(firstRow.querySelector('[role="cell"]')!.textContent).toBe(
      "Linda's Asian Kitchen",
    );

    await userEvent.click(screen.getAllByLabelText("Column options")[0]!);
    expect(screen.getByText("Move left").closest("[role=menuitem]")).toHaveAttribute(
      "data-disabled",
    );
    await userEvent.click(screen.getByText("Move right"));
    expect(headerTexts(container)).toEqual(["Order ID", "Name", "Phone"]);
  });

  it("controlled column state: renders columnState and emits changes instead of applying them", async () => {
    const onColumnStateChange = vi.fn();
    const { container } = render(
      <SmartTable
        columns={COLUMNS}
        rows={ORDERS}
        getRowKey={(o) => o.id}
        columnState={{ order: ["phone", "id", "name"], hidden: ["id"] }}
        onColumnStateChange={onColumnStateChange}
      />,
    );
    expect(headerTexts(container)).toEqual(["Phone", "Name"]);

    await userEvent.click(screen.getAllByLabelText("Column options")[0]!);
    await userEvent.click(screen.getByText("Hide column"));
    expect(onColumnStateChange).toHaveBeenLastCalledWith({
      order: ["phone", "id", "name"],
      hidden: ["id", "phone"],
    });
    expect(headerTexts(container)).toEqual(["Phone", "Name"]);
  });

  it("omits Move items for a column with reorderable: false", async () => {
    render(
      <SmartTable
        columns={[{ ...COLUMNS[0]!, reorderable: false }, COLUMNS[1]!]}
        rows={ORDERS}
        getRowKey={(o) => o.id}
      />,
    );
    await userEvent.click(screen.getAllByLabelText("Column options")[0]!);
    expect(screen.queryByText("Move right")).not.toBeInTheDocument();
  });
});
