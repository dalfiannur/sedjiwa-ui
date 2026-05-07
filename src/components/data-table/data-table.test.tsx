import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type Column } from "./data-table";

type Person = { id: string; name: string; role: string };

const PEOPLE: Person[] = [
  { id: "1", name: "Ada", role: "Engineer" },
  { id: "2", name: "Grace", role: "Designer" },
];

const COLUMNS: Column<Person>[] = [
  { key: "name", header: "Name", render: (p) => p.name },
  { key: "role", header: "Role", render: (p) => p.role, align: "right" },
];

describe("<DataTable />", () => {
  it("renders headers in column order with their labels", () => {
    render(
      <DataTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />
    );
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual(["Name", "Role"]);
  });

  it("renders body cells for each row using each column's render fn", () => {
    render(
      <DataTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />
    );
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });

  it("renders the empty message when rows is empty (default 'No data')", () => {
    render(
      <DataTable columns={COLUMNS} rows={[]} getRowKey={(p) => p.id} />
    );
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders a custom empty message when supplied", () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={[]}
        getRowKey={(p) => p.id}
        emptyMessage="Nobody here yet"
      />
    );
    expect(screen.getByText("Nobody here yet")).toBeInTheDocument();
  });

  it("calls onRowClick with the clicked row's data", async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        onRowClick={onRowClick}
      />
    );
    await user.click(screen.getByText("Ada"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(PEOPLE[0]);
  });

  it("renders the Actions column only when renderAction is supplied", () => {
    const { rerender } = render(
      <DataTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />
    );
    expect(screen.queryByRole("columnheader", { name: "Actions" })).not.toBeInTheDocument();

    rerender(
      <DataTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        renderAction={(p) => <button>Edit {p.name}</button>}
      />
    );
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Ada" })).toBeInTheDocument();
  });

  it("clicking inside an action cell does not fire onRowClick", async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        onRowClick={onRowClick}
        renderAction={(p) => <button>Edit {p.name}</button>}
      />
    );
    await user.click(screen.getByRole("button", { name: "Edit Ada" }));
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("forwards className to the outer wrapper", () => {
    const { container } = render(
      <DataTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        className="custom-wrap"
      />
    );
    expect(container.querySelector(".custom-wrap")).toBeTruthy();
  });
});
