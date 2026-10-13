import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { FilterChip, FilterChipGroup } from "./filter-chip";

const meta: Meta<typeof FilterChipGroup> = {
  title: "Components/FilterChip",
  component: FilterChipGroup,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof FilterChipGroup>;

export const Single: Story = {
  render: () => {
    const [v, setV] = useState("open");
    return (
      // Ignoring "" keeps one chip always on: the status filter always has an answer.
      <FilterChipGroup type="single" aria-label="Saring menurut status" value={v} onValueChange={(n) => n && setV(n)}>
        <FilterChip value="open">Terbuka</FilterChip>
        <FilterChip value="done">Selesai</FilterChip>
        <FilterChip value="all">Semua status</FilterChip>
      </FilterChipGroup>
    );
  },
};

const NOMOR = [
  { id: "sales", nama: "Sales", dot: "bg-label-blue-text" },
  { id: "cs", nama: "CS", dot: "bg-label-amber-text" },
  { id: "gudang", nama: "Gudang", dot: "bg-label-violet-text" },
];

/** An "all" chip that means no filter: it is on exactly when nothing else is,
 *  and pressing it clears the rest. */
export const MultipleWithAll: Story = {
  render: () => {
    const [pilih, setPilih] = useState<string[]>([]);
    const value = pilih.length ? pilih : ["all"];
    return (
      <FilterChipGroup
        type="multiple"
        aria-label="Saring menurut nomor"
        value={value}
        onValueChange={(next) => {
          const baru = next.filter((x) => !value.includes(x));
          setPilih(baru.includes("all") ? [] : next.filter((x) => x !== "all"));
        }}
      >
        <FilterChip value="all">Semua nomor</FilterChip>
        {NOMOR.map((n) => (
          <FilterChip key={n.id} value={n.id} icon={<span className={`size-2 rounded-full ${n.dot}`} />}>
            {n.nama}
          </FilterChip>
        ))}
      </FilterChipGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "CS" }));
    await expect(canvas.getByRole("button", { name: "Semua nomor" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Semua nomor" }));
    await expect(canvas.getByRole("button", { name: "CS" })).toHaveAttribute("aria-pressed", "false");
  },
};
