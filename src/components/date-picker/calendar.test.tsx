import { afterEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
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
  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("jumps the view to the earliest date when selection is seeded after mount", () => {
    // "Today" is faked to a month far from July 2026 so the assertions below
    // actually prove the follow-effect moved the view — if `today` genuinely
    // fell in July 2026 (as it does at the time of writing this suite), the
    // initial render would already show July 2026 and the test would pass
    // trivially even with a broken follow-effect.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2020, 0, 15));

    const { rerender } = render(
      <Calendar mode="multiple" value={[]} onSelect={() => {}} />,
    );
    const gridBefore = screen.getByRole("grid");
    expect(gridBefore.getAttribute("aria-label")).toMatch(/january 2020/i);

    rerender(
      <Calendar mode="multiple" value={[jul(15), jul(3)]} onSelect={() => {}} />,
    );

    const gridAfter = screen.getByRole("grid");
    expect(gridAfter.getAttribute("aria-label")).toMatch(/july 2026/i);
    // dayButton throws if the day isn't in the now-visible month, and the
    // follow-effect must sort the unsorted input to pick day 3 (not 15) as
    // the anchor.
    expect(dayButton(3).dataset.selected).toBe("true");
    expect(dayButton(15).dataset.selected).toBe("true");
    expect(dayButton(3).dataset.focused).toBe("true");
  });
});
