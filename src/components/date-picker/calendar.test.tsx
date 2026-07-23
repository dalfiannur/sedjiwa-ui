import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "./calendar";

// Day cells render as button[data-slot="calendar-day"]; chevrons are also
// <button>, so select by slot (same trick as date-picker.test.tsx).
function dayButton(day: number): HTMLButtonElement {
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    'button[data-slot="calendar-day"]',
  );
  const match = Array.from(buttons).find(
    (b) => b.textContent?.trim() === String(day) && !b.dataset.outside,
  );
  if (!match) throw new Error(`Day ${day} button not found in current month`);
  return match;
}

// Anchor all tests to July 2026 via the initial value so the visible month
// is deterministic.
const jul = (day: number) => new Date(2026, 6, day);

describe("<Calendar mode=multiple />", () => {
  it("adds a clicked day to the selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar mode="multiple" value={[jul(10)]} onSelect={onSelect} />);
    await user.click(dayButton(15));
    expect(onSelect).toHaveBeenCalledTimes(1);
    const next = onSelect.mock.calls[0]![0] as Date[];
    expect(next.map((d) => d.getDate())).toEqual([10, 15]);
  });

  it("keeps the selection sorted ascending when adding an earlier day", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar mode="multiple" value={[jul(10)]} onSelect={onSelect} />);
    await user.click(dayButton(5));
    const next = onSelect.mock.calls[0]![0] as Date[];
    expect(next.map((d) => d.getDate())).toEqual([5, 10]);
  });

  it("removes an already-selected day (toggle off)", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar mode="multiple" value={[jul(10), jul(15)]} onSelect={onSelect} />,
    );
    await user.click(dayButton(10));
    const next = onSelect.mock.calls[0]![0] as Date[];
    expect(next.map((d) => d.getDate())).toEqual([15]);
  });

  it("marks selected days with data-selected", () => {
    render(<Calendar mode="multiple" value={[jul(10), jul(15)]} onSelect={() => {}} />);
    expect(dayButton(10).dataset.selected).toBe("true");
    expect(dayButton(15).dataset.selected).toBe("true");
    expect(dayButton(11).dataset.selected).toBeUndefined();
  });

  it("does not toggle days outside min/max", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="multiple"
        value={[jul(10)]}
        onSelect={onSelect}
        min={jul(8)}
        max={jul(20)}
      />,
    );
    await user.click(dayButton(25)); // disabled — after max
    expect(onSelect).not.toHaveBeenCalled();
  });
});
