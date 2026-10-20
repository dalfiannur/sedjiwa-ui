import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SmartTableColumnsMenu } from "./smart-table-columns-menu";

const COLUMNS = [
  { key: "id", header: "Order ID" },
  { key: "name", header: "Name" },
  { key: "phone", header: "Phone" },
];

const STATE = { order: ["id", "name", "phone"], hidden: ["phone"] };

function setup(props: Partial<Parameters<typeof SmartTableColumnsMenu>[0]> = {}) {
  const onColumnStateChange = vi.fn();
  render(
    <SmartTableColumnsMenu
      columns={COLUMNS}
      columnState={STATE}
      onColumnStateChange={onColumnStateChange}
      {...props}
    />,
  );
  return { onColumnStateChange };
}

describe("<SmartTableColumnsMenu />", () => {
  it("lists every column in order with its visibility", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Columns" }));
    expect(screen.getByLabelText("Order ID")).toBeChecked();
    expect(screen.getByLabelText("Name")).toBeChecked();
    expect(screen.getByLabelText("Phone")).not.toBeChecked();
  });

  it("toggles visibility", async () => {
    const { onColumnStateChange } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Columns" }));
    await userEvent.click(screen.getByLabelText("Phone"));
    expect(onColumnStateChange).toHaveBeenLastCalledWith({
      order: ["id", "name", "phone"],
      hidden: [],
    });
    await userEvent.click(screen.getByLabelText("Name"));
    expect(onColumnStateChange).toHaveBeenLastCalledWith({
      order: ["id", "name", "phone"],
      hidden: ["phone", "name"],
    });
  });

  it("reorders among visible columns and disables the edges", async () => {
    const { onColumnStateChange } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Columns" }));
    expect(screen.getByRole("button", { name: "Move up: Order ID" })).toBeDisabled();
    // Name is the last *visible* column; Phone is hidden.
    expect(screen.getByRole("button", { name: "Move down: Name" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move up: Phone" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Move up: Name" }));
    expect(onColumnStateChange).toHaveBeenLastCalledWith({
      order: ["name", "id", "phone"],
      hidden: ["phone"],
    });
  });

  it("won't uncheck the last visible column", async () => {
    setup({ columnState: { order: ["id", "name", "phone"], hidden: ["id", "phone"] } });
    await userEvent.click(screen.getByRole("button", { name: "Columns" }));
    expect(screen.getByLabelText("Name")).toBeDisabled();
  });

  it("shows Reset only with onReset, and localizes labels", async () => {
    const onReset = vi.fn();
    setup({ onReset, labels: { trigger: "Kolom", reset: "Atur ulang" } });
    await userEvent.click(screen.getByRole("button", { name: "Kolom" }));
    await userEvent.click(screen.getByRole("button", { name: "Atur ulang" }));
    expect(onReset).toHaveBeenCalled();
  });
});
