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

describe("<Calendar /> label-mode month/year chooser", () => {
  const openChooser = async (value = new Date(2028, 0, 10)) => {
    const utils = render(
      <Calendar mode="single" value={value} headerVariant="label" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /January 2028/i }));
    return utils;
  };

  it("does not show the chooser until the label is clicked", () => {
    const { container } = render(
      <Calendar mode="single" value={new Date(2028, 0, 10)} headerVariant="label" />,
    );
    expect(container.querySelector('[data-slot="calendar-month-picker"]')).toBeNull();
    expect(container.querySelector('[data-slot="calendar-grid"]')).not.toBeNull();
  });

  it("replaces the day grid with the chooser when the label is clicked", async () => {
    const { container } = await openChooser();
    expect(container.querySelector('[data-slot="calendar-month-picker"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="calendar-grid"]')).toBeNull();
  });

  it("changes year without leaving the chooser", async () => {
    await openChooser();
    await userEvent.click(screen.getByLabelText("Next year"));
    expect(screen.getByText("2029")).toBeInTheDocument();
    // Still browsing — the header must not have committed yet.
    expect(screen.getByRole("button", { name: /January 2028/i })).toBeInTheDocument();
  });

  it("commits the chosen month and year, and returns to the day grid", async () => {
    const { container } = await openChooser();
    await userEvent.click(screen.getByLabelText("Next year"));
    await userEvent.click(screen.getByRole("button", { name: "March" }));
    expect(container.querySelector('[data-slot="calendar-month-picker"]')).toBeNull();
    expect(container.querySelector('[data-slot="calendar-label"]')).toHaveTextContent(
      "March 2029",
    );
  });

  it("marks the current month as selected", async () => {
    const { container } = await openChooser();
    const selected = container.querySelector(
      '[data-slot="calendar-month-option"][data-selected]',
    );
    expect(selected).toHaveTextContent("January");
  });

  it("does not offer a chooser in dropdowns mode", () => {
    const { container } = render(
      <Calendar mode="single" value={new Date(2028, 0, 10)} />,
    );
    expect(container.querySelector('[data-slot="calendar-label-trigger"]')).toBeNull();
  });

  it("stops at the year bounds", async () => {
    render(
      <Calendar
        mode="single"
        value={new Date(2028, 0, 10)}
        headerVariant="label"
        fromYear={2028}
        toYear={2028}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /January 2028/i }));
    expect(screen.getByLabelText("Previous year")).toBeDisabled();
    expect(screen.getByLabelText("Next year")).toBeDisabled();
  });

  it("disables months outside min/max", async () => {
    render(
      <Calendar
        mode="single"
        value={new Date(2028, 5, 10)}
        headerVariant="label"
        min={new Date(2028, 3, 1)}
        max={new Date(2028, 7, 31)}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /June 2028/i }));
    expect(screen.getByRole("button", { name: "February" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "May" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "October" })).toBeDisabled();
  });
});

describe("<Calendar /> grid semantics", () => {
  // ARIA requires grid > row > gridcell|columnheader. Without the row layer,
  // axe reports aria-required-children on the grid and aria-required-parent on
  // every single cell.
  it("puts every columnheader inside a row", () => {
    const { container } = render(<Calendar mode="single" value={new Date(2028, 0, 10)} />);
    const headers = [...container.querySelectorAll('[role="columnheader"]')];
    expect(headers).toHaveLength(7);
    for (const h of headers) {
      expect(h.parentElement).toHaveAttribute("role", "row");
    }
  });

  it("puts every gridcell inside a row", () => {
    const { container } = render(<Calendar mode="single" value={new Date(2028, 0, 10)} />);
    const cells = [...container.querySelectorAll('[role="gridcell"]')];
    expect(cells.length).toBeGreaterThan(27);
    for (const c of cells) {
      expect(c.parentElement).toHaveAttribute("role", "row");
    }
  });

  it("puts every row directly inside the grid", () => {
    const { container } = render(<Calendar mode="single" value={new Date(2028, 0, 10)} />);
    const rows = [...container.querySelectorAll('[role="row"]')];
    expect(rows.length).toBeGreaterThan(1);
    for (const r of rows) {
      expect(r.parentElement).toHaveAttribute("role", "grid");
    }
  });

  it("gives each row exactly seven children", () => {
    const { container } = render(<Calendar mode="single" value={new Date(2028, 0, 10)} />);
    for (const r of container.querySelectorAll('[role="row"]')) {
      expect(r.children).toHaveLength(7);
    }
  });

  // aria-selected is not allowed on role=button; it belongs on the gridcell.
  it("puts aria-selected on the gridcell, not the day button", () => {
    const { container } = render(<Calendar mode="single" value={new Date(2028, 0, 10)} />);
    const selectedCell = container.querySelector('[role="gridcell"][aria-selected="true"]');
    expect(selectedCell).not.toBeNull();
    expect(selectedCell).toHaveTextContent("10");
    expect(container.querySelector("button[aria-selected]")).toBeNull();
  });
});
