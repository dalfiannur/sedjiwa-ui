import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateTimeRangePicker } from "./date-time-range-picker";

function getTrigger(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>(
    '[data-slot="date-time-range-picker-trigger"]',
  )!;
}

function getDayButton(day: number): HTMLButtonElement {
  // Calendar day cells render as gridcell > button. Disambiguate by data-slot
  // because the chevron buttons are also <button>.
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    'button[data-slot="calendar-day"]',
  );
  const match = Array.from(buttons).find(
    (b) => b.textContent?.trim() === String(day) && !b.dataset.outside,
  );
  if (!match) throw new Error(`Day ${day} button not found in current month`);
  return match;
}

/** Current-month ISO date for `day`, matching what the open calendar shows. */
function thisMonth(day: number): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${String(day).padStart(2, "0")}`;
}

const startGroup = () =>
  within(screen.getByRole("group", { name: "Start" }));
const endGroup = () => within(screen.getByRole("group", { name: "End" }));

describe("<DateTimeRangePicker />", () => {
  it("shows the placeholder in the trigger when empty", () => {
    render(<DateTimeRangePicker placeholder="Pilih rentang" />);
    expect(
      screen.getByRole("button", { name: "Pilih rentang" }),
    ).toBeInTheDocument();
  });

  it("shows a formatted range in the trigger when both ends are set", () => {
    render(
      <DateTimeRangePicker
        locale="id-ID"
        placeholder="Pilih rentang"
        value={{ from: "2028-01-10T09:00", to: "2028-01-12T17:00" }}
      />,
    );
    const label = getTrigger().textContent ?? "";
    expect(label).not.toContain("Pilih rentang");
    expect(label).toContain("–");
    expect(label).toMatch(/10/);
    expect(label).toMatch(/12/);
  });

  it("emits both ends with the default 09:00 time when two days are picked", async () => {
    const onValueChange = vi.fn();
    // Uncontrolled so the component's own state carries the first click into
    // the second, the way Calendar's range logic expects.
    render(<DateTimeRangePicker locale="id-ID" onValueChange={onValueChange} />);
    await userEvent.click(getTrigger());

    await userEvent.click(getDayButton(10));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: `${thisMonth(10)}T09:00`,
      to: null,
    });

    await userEvent.click(getDayButton(15));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: `${thisMonth(10)}T09:00`,
      to: `${thisMonth(15)}T09:00`,
    });
  });

  it("changing the start time preserves the start date and the whole end", async () => {
    const onValueChange = vi.fn();
    render(
      <DateTimeRangePicker
        locale="id-ID"
        value={{ from: "2028-01-10T09:00", to: "2028-01-12T17:00" }}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(getTrigger());
    await userEvent.click(startGroup().getByRole("combobox", { name: "Hour" }));
    await userEvent.click(screen.getByRole("option", { name: "14" }));
    expect(onValueChange).toHaveBeenCalledWith({
      from: "2028-01-10T14:00",
      to: "2028-01-12T17:00",
    });
  });

  it("changing the end time preserves the end date and the whole start", async () => {
    const onValueChange = vi.fn();
    render(
      <DateTimeRangePicker
        locale="id-ID"
        value={{ from: "2028-01-10T09:00", to: "2028-01-12T17:00" }}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(getTrigger());
    await userEvent.click(endGroup().getByRole("combobox", { name: "Hour" }));
    await userEvent.click(screen.getByRole("option", { name: "20" }));
    expect(onValueChange).toHaveBeenCalledWith({
      from: "2028-01-10T09:00",
      to: "2028-01-12T20:00",
    });
  });

  it("keeps each end's own time when its day is re-picked", async () => {
    const onValueChange = vi.fn();
    render(
      <DateTimeRangePicker
        locale="id-ID"
        value={{ from: "2028-01-10T07:30", to: null }}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(getTrigger());
    // The calendar is anchored on January 2028 by the value.
    await userEvent.click(getDayButton(20));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: "2028-01-10T07:30",
      to: "2028-01-20T09:00",
    });
  });

  it("disables the end time control until an end date exists", async () => {
    const { rerender } = render(
      <DateTimeRangePicker
        locale="id-ID"
        value={{ from: "2028-01-10T09:00", to: null }}
      />,
    );
    await userEvent.click(getTrigger());
    expect(endGroup().getByRole("combobox", { name: "Hour" })).toBeDisabled();
    expect(endGroup().getByRole("combobox", { name: "Minute" })).toBeDisabled();
    // The start control stays usable — its day is already there.
    expect(
      startGroup().getByRole("combobox", { name: "Hour" }),
    ).not.toBeDisabled();

    rerender(
      <DateTimeRangePicker
        locale="id-ID"
        value={{ from: "2028-01-10T09:00", to: "2028-01-12T17:00" }}
      />,
    );
    expect(
      endGroup().getByRole("combobox", { name: "Hour" }),
    ).not.toBeDisabled();
  });

  it("still emits an inverted range rather than silently clamping it", async () => {
    const onValueChange = vi.fn();
    render(
      <DateTimeRangePicker
        locale="id-ID"
        value={{ from: "2028-01-10T09:00", to: "2028-01-10T12:00" }}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(getTrigger());
    // Pulling the end back to 08:00 on the same day makes it earlier than the
    // start. Validation is the caller's job; a silent correction would hide it.
    await userEvent.click(endGroup().getByRole("combobox", { name: "Hour" }));
    await userEvent.click(screen.getByRole("option", { name: "08" }));
    expect(onValueChange).toHaveBeenCalledWith({
      from: "2028-01-10T09:00",
      to: "2028-01-10T08:00",
    });
  });

  it("names both time groups and every combobox inside them", async () => {
    render(
      <DateTimeRangePicker
        locale="en-US"
        value={{ from: "2028-01-10T09:00", to: "2028-01-12T17:00" }}
      />,
    );
    await userEvent.click(getTrigger());
    expect(screen.getByRole("group", { name: "Start" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "End" })).toBeInTheDocument();
    for (const group of [startGroup(), endGroup()]) {
      expect(group.getByRole("combobox", { name: "Hour" })).toBeInTheDocument();
      expect(
        group.getByRole("combobox", { name: "Minute" }),
      ).toBeInTheDocument();
      // 12-hour locale, so a period dropdown too — and it needs a name.
      expect(
        group.getByRole("combobox", { name: "AM/PM" }),
      ).toBeInTheDocument();
    }
  });

  it("omits the AM/PM dropdowns in a 24-hour locale", async () => {
    render(
      <DateTimeRangePicker
        locale="id-ID"
        value={{ from: "2028-01-10T09:00", to: "2028-01-12T17:00" }}
      />,
    );
    await userEvent.click(getTrigger());
    expect(screen.queryAllByRole("combobox", { name: "AM/PM" })).toHaveLength(0);
  });

  it("renders hidden inputs named for each end when name is given", () => {
    const { container } = render(
      <DateTimeRangePicker
        name="period"
        value={{ from: "2028-01-10T09:00", to: "2028-01-12T17:00" }}
      />,
    );
    const from = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="period[from]"]',
    );
    const to = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="period[to]"]',
    );
    expect(from?.value).toBe("2028-01-10T09:00");
    expect(to?.value).toBe("2028-01-12T17:00");
  });

  it("snaps an off-grid incoming time onto the step grid", async () => {
    render(
      <DateTimeRangePicker
        locale="id-ID"
        timeStep={15}
        value={{ from: "2028-01-10T09:41", to: null }}
      />,
    );
    await userEvent.click(getTrigger());
    expect(
      startGroup().getByRole("combobox", { name: "Minute" }),
    ).toHaveTextContent("45");
  });

  it("does not open when disabled", async () => {
    render(<DateTimeRangePicker disabled />);
    expect(getTrigger()).toBeDisabled();
    await userEvent.click(getTrigger());
    expect(screen.queryByRole("grid")).toBeNull();
  });
});
