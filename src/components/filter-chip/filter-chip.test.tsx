import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterChip, FilterChipGroup } from "./filter-chip";

describe("<FilterChipGroup />", () => {
  // Single mode is a radio group (Radix), multiple a group of toggle buttons.
  it("is a labelled group of pressed/unpressed chips", () => {
    render(
      <FilterChipGroup type="single" aria-label="Status" value="open">
        <FilterChip value="open">Terbuka</FilterChip>
        <FilterChip value="done">Selesai</FilterChip>
      </FilterChipGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Status" })).toHaveAttribute("data-slot", "filter-chip-group");
    expect(screen.getByRole("radio", { name: "Terbuka" })).toHaveAttribute("data-state", "on");
    expect(screen.getByRole("radio", { name: "Selesai" })).toHaveAttribute("data-state", "off");
  });

  it("selects several in multiple mode", async () => {
    const onValueChange = vi.fn();
    render(
      <FilterChipGroup type="multiple" aria-label="Nomor" defaultValue={["a"]} onValueChange={onValueChange}>
        <FilterChip value="a">Sales</FilterChip>
        <FilterChip value="b">CS</FilterChip>
      </FilterChipGroup>,
    );
    await userEvent.click(screen.getByRole("button", { name: "CS" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]);
    expect(screen.getByRole("button", { name: "CS" })).toHaveAttribute("aria-pressed", "true");
  });

  it("renders a decorative leading icon", () => {
    render(
      <FilterChipGroup type="multiple" aria-label="Nomor">
        <FilterChip value="a" icon={<span data-testid="dot" />}>Sales</FilterChip>
      </FilterChipGroup>,
    );
    expect(screen.getByTestId("dot").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Sales" })).toHaveAttribute("data-slot", "filter-chip");
  });
});
