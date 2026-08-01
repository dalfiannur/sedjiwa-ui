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

// Controlled wrapper: the anchor for Shift-range lives in the Calendar's own
// ref, so multi-step interactions (plain click, then Shift-click) need the
// `value` prop to actually update between clicks.
function MultipleHarness({
  initial = [],
  min,
  max,
}: {
  initial?: Date[];
  min?: Date;
  max?: Date;
}) {
  const [value, setValue] = React.useState<Date[]>(initial);
  return (
    <Calendar
      mode="multiple"
      value={value}
      onSelect={setValue}
      min={min}
      max={max}
    />
  );
}

function selectedDays(): number[] {
  return Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      'button[data-slot="calendar-day"][data-selected="true"]',
    ),
  )
    .filter((b) => !b.dataset.outside)
    .map((b) => Number(b.textContent?.trim()))
    .sort((a, b) => a - b);
}

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

describe("<Calendar mode=multiple /> Shift-click range", () => {
  it("selects the inclusive span between a plain click and a Shift-click", async () => {
    const user = userEvent.setup();
    render(<MultipleHarness />);

    await user.click(dayButton(10)); // sets the anchor
    await user.keyboard("{Shift>}");
    await user.click(dayButton(14));
    await user.keyboard("{/Shift}");

    expect(selectedDays()).toEqual([10, 11, 12, 13, 14]);
  });

  it("unions the span with prior non-contiguous selected days", async () => {
    const user = userEvent.setup();
    render(<MultipleHarness initial={[jul(3)]} />);

    await user.click(dayButton(10)); // anchor, day 3 stays selected
    await user.keyboard("{Shift>}");
    await user.click(dayButton(12));
    await user.keyboard("{/Shift}");

    expect(selectedDays()).toEqual([3, 10, 11, 12]);
  });

  it("selects the span when the Shift-click is earlier than the anchor", async () => {
    const user = userEvent.setup();
    render(<MultipleHarness />);

    await user.click(dayButton(20)); // anchor
    await user.keyboard("{Shift>}");
    await user.click(dayButton(17));
    await user.keyboard("{/Shift}");

    expect(selectedDays()).toEqual([17, 18, 19, 20]);
  });

  it("treats a Shift-click with no prior anchor as a plain toggle", async () => {
    const user = userEvent.setup();
    render(<MultipleHarness initial={[jul(10)]} />);

    // No plain click happened this session, so there is no anchor yet.
    await user.keyboard("{Shift>}");
    await user.click(dayButton(14));
    await user.keyboard("{/Shift}");

    expect(selectedDays()).toEqual([10, 14]); // no in-between fill
  });

  it("previews the span while Shift is held over a day", async () => {
    const user = userEvent.setup();
    render(<MultipleHarness />);

    await user.click(dayButton(10)); // anchor
    await user.keyboard("{Shift>}");
    await user.hover(dayButton(13));

    expect(dayButton(12).dataset.inRange).toBe("true");
    expect(dayButton(11).dataset.inRange).toBe("true");

    await user.keyboard("{/Shift}");
  });
});

describe("<Calendar /> headerVariant", () => {
  // The month/year SelectTriggers pass their own data-slot ("calendar-month-select" /
  // "calendar-year-select") which lands after the internal data-slot="select-trigger" in the
  // prop spread, overriding it — so `[data-slot="select-trigger"]` never matches here. Detect
  // the dropdowns by their actual slots instead.
  const dropdownSelector = '[data-slot="calendar-month-select"], [data-slot="calendar-year-select"]';

  it("renders month and year dropdowns by default", () => {
    const { container } = render(<Calendar mode="single" value={new Date(2028, 0, 10)} />);
    expect(container.querySelectorAll(dropdownSelector).length).toBeGreaterThan(0);
  });

  it("renders a static label instead of dropdowns when headerVariant is label", () => {
    const { container } = render(
      <Calendar mode="single" value={new Date(2028, 0, 10)} headerVariant="label" />
    );
    expect(container.querySelectorAll(dropdownSelector).length).toBe(0);
    expect(container.querySelector('[data-slot="calendar-label"]')).toHaveTextContent("January 2028");
  });

  it("keeps month navigation in label mode", () => {
    render(<Calendar mode="single" value={new Date(2028, 0, 10)} headerVariant="label" />);
    expect(screen.getByLabelText("Previous month")).toBeInTheDocument();
    expect(screen.getByLabelText("Next month")).toBeInTheDocument();
  });
});
