import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateTimePicker } from "./date-time-picker";

const noop = () => {};

describe("<DateTimePicker />", () => {
  it("renders nothing when closed", () => {
    render(<DateTimePicker open={false} onOpenChange={noop} onApply={noop} />);
    expect(screen.queryByText("Apply")).toBeNull();
  });

  it("shows the title, today shortcut and time control when open", () => {
    render(<DateTimePicker open onOpenChange={noop} onApply={noop} title="Filter Activity Date" />);
    expect(screen.getByText("Filter Activity Date")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
  });

  it("commits date and time together as local ISO on Apply", async () => {
    const onApply = vi.fn();
    render(
      <DateTimePicker open onOpenChange={noop} onApply={onApply} value="2028-01-10T09:30" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T09:30");
  });

  it("closes after Apply", async () => {
    const onOpenChange = vi.fn();
    render(
      <DateTimePicker open onOpenChange={onOpenChange} onApply={noop} value="2028-01-10T09:30" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("snaps an off-grid incoming time down to the nearest step", async () => {
    const onApply = vi.fn();
    // 09:41 with the default 30-minute step is nearer 09:30 than 10:00
    render(
      <DateTimePicker open onOpenChange={noop} onApply={onApply} value="2028-01-10T09:41" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T09:30");
  });

  it("snaps UP when the nearest step is the later one", async () => {
    const onApply = vi.fn();
    // 09:50 is nearer 10:00. This case is what distinguishes rounding to the
    // NEAREST step from merely truncating — 09:41 alone passes either way.
    render(
      <DateTimePicker open onOpenChange={noop} onApply={onApply} value="2028-01-10T09:50" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T10:00");
  });

  it("never snaps past the end of the day", async () => {
    const onApply = vi.fn();
    // 23:59 must not round up to 24:00, which is not a valid option.
    render(
      <DateTimePicker open onOpenChange={noop} onApply={onApply} value="2028-01-10T23:59" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T23:30");
  });

  it("does not fire onApply merely from opening", () => {
    const onApply = vi.fn();
    render(<DateTimePicker open onOpenChange={noop} onApply={onApply} value="2028-01-10T09:30" />);
    expect(onApply).not.toHaveBeenCalled();
  });

  it("names each time dropdown, and groups them under the visible label", () => {
    render(<DateTimePicker open onOpenChange={noop} onApply={noop} locale="en-US" />);
    // Every combobox needs its own name — the visible "Time" text cannot name
    // two or three of them at once, and a nameless one is a critical axe
    // button-name violation.
    expect(screen.getByRole("combobox", { name: "Hour" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Minute" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Time" })).toBeInTheDocument();
  });

  it("shows an AM/PM dropdown in a 12-hour locale", () => {
    render(<DateTimePicker open onOpenChange={noop} onApply={noop} locale="en-US" />);
    expect(screen.getByRole("combobox", { name: "AM/PM" })).toBeInTheDocument();
  });

  it("omits the AM/PM dropdown in a 24-hour locale", () => {
    render(<DateTimePicker open onOpenChange={noop} onApply={noop} locale="id-ID" />);
    expect(screen.queryByRole("combobox", { name: "AM/PM" })).toBeNull();
    expect(screen.getByRole("combobox", { name: "Hour" })).toBeInTheDocument();
  });

  it("shows the hour in 24-hour form for a 24-hour locale", () => {
    render(
      <DateTimePicker
        open
        onOpenChange={noop}
        onApply={noop}
        locale="id-ID"
        value="2028-01-10T21:30"
      />,
    );
    expect(screen.getByRole("combobox", { name: "Hour" })).toHaveTextContent("21");
  });

  it("shows the hour in 12-hour form, with the period, for a 12-hour locale", () => {
    render(
      <DateTimePicker
        open
        onOpenChange={noop}
        onApply={noop}
        locale="en-US"
        value="2028-01-10T21:30"
      />,
    );
    expect(screen.getByRole("combobox", { name: "Hour" })).toHaveTextContent("9");
    expect(screen.getByRole("combobox", { name: "AM/PM" })).toHaveTextContent(/PM/i);
  });

  it("renders midnight as 12 AM rather than 0", () => {
    render(
      <DateTimePicker
        open
        onOpenChange={noop}
        onApply={noop}
        locale="en-US"
        value="2028-01-10T00:30"
      />,
    );
    expect(screen.getByRole("combobox", { name: "Hour" })).toHaveTextContent("12");
    expect(screen.getByRole("combobox", { name: "AM/PM" })).toHaveTextContent(/AM/i);
  });

  it("keeps PM when the hour is changed in a 12-hour locale", async () => {
    const onApply = vi.fn();
    render(
      <DateTimePicker
        open
        onOpenChange={noop}
        onApply={onApply}
        locale="en-US"
        value="2028-01-10T21:30"
      />,
    );
    // Picking "11" while PM is selected must mean 23:00, not 11:00. Reading
    // initial state alone cannot catch a dropped PM offset here.
    await userEvent.click(screen.getByRole("combobox", { name: "Hour" }));
    await userEvent.click(screen.getByRole("option", { name: "11" }));
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T23:30");
  });

  it("flips between AM and PM without changing the displayed hour", async () => {
    const onApply = vi.fn();
    render(
      <DateTimePicker
        open
        onOpenChange={noop}
        onApply={onApply}
        locale="en-US"
        value="2028-01-10T21:30"
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "AM/PM" }));
    await userEvent.click(screen.getByRole("option", { name: /AM/i }));
    expect(screen.getByRole("combobox", { name: "Hour" })).toHaveTextContent("9");
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T09:30");
  });

  it("changes the minute without disturbing the hour", async () => {
    const onApply = vi.fn();
    render(
      <DateTimePicker
        open
        onOpenChange={noop}
        onApply={onApply}
        locale="id-ID"
        timeStep={15}
        value="2028-01-10T21:30"
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Minute" }));
    await userEvent.click(screen.getByRole("option", { name: "45" }));
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T21:45");
  });

  it("offers minute options at the configured step", async () => {
    render(
      <DateTimePicker open onOpenChange={noop} onApply={noop} locale="id-ID" timeStep={15} />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Minute" }));
    const opts = screen.getAllByRole("option").map((o) => o.textContent);
    expect(opts).toEqual(["00", "15", "30", "45"]);
  });

  it("commits the 24-hour value even when displayed in 12-hour form", async () => {
    const onApply = vi.fn();
    render(
      <DateTimePicker
        open
        onOpenChange={noop}
        onApply={onApply}
        locale="en-US"
        value="2028-01-10T21:30"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T21:30");
  });

  it("accepts overridden labels", () => {
    render(
      <DateTimePicker
        open
        onOpenChange={noop}
        onApply={noop}
        applyLabel="Terapkan"
        todayLabel="Hari ini"
        timeLabel="Waktu"
      />,
    );
    expect(screen.getByText("Terapkan")).toBeInTheDocument();
    expect(screen.getByText("Hari ini")).toBeInTheDocument();
    expect(screen.getByText("Waktu")).toBeInTheDocument();
  });
});

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

function getInlineTrigger(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>(
    '[data-slot="date-time-picker-trigger"]',
  )!;
}

describe('<DateTimePicker mode="inline" />', () => {
  it("renders a trigger with the placeholder when there is no value", () => {
    render(<DateTimePicker mode="inline" placeholder="Pilih waktu" />);
    expect(
      screen.getByRole("button", { name: "Pilih waktu" }),
    ).toBeInTheDocument();
  });

  it("renders the formatted value in the trigger when there is one", () => {
    render(
      <DateTimePicker
        mode="inline"
        locale="en-US"
        value="2028-01-10T09:30"
        formatLabel={(d) => `picked ${d.getHours()}:${d.getMinutes()}`}
      />,
    );
    expect(getInlineTrigger()).toHaveTextContent("picked 9:30");
  });

  it("opens a popover on click, showing the calendar and the time group", async () => {
    render(<DateTimePicker mode="inline" locale="en-US" value="2028-01-10T09:30" />);
    expect(screen.queryByRole("grid")).toBeNull();
    await userEvent.click(getInlineTrigger());
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Time" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Hour" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Minute" })).toBeInTheDocument();
  });

  it("fires onValueChange with the full local ISO when a day is picked", async () => {
    const onValueChange = vi.fn();
    render(
      <DateTimePicker
        mode="inline"
        locale="en-US"
        value="2028-01-10T09:30"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(getInlineTrigger());
    await userEvent.click(getDayButton(15));
    // The existing time rides along; only the date changed.
    expect(onValueChange).toHaveBeenCalledWith("2028-01-15T09:30");
  });

  it("fires onValueChange with the whole value when the hour changes", async () => {
    const onValueChange = vi.fn();
    render(
      <DateTimePicker
        mode="inline"
        locale="id-ID"
        value="2028-01-10T09:30"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(getInlineTrigger());
    await userEvent.click(screen.getByRole("combobox", { name: "Hour" }));
    await userEvent.click(screen.getByRole("option", { name: "14" }));
    expect(onValueChange).toHaveBeenCalledWith("2028-01-10T14:30");
  });

  it("renders no Apply button in inline mode", async () => {
    render(<DateTimePicker mode="inline" locale="en-US" value="2028-01-10T09:30" />);
    await userEvent.click(getInlineTrigger());
    expect(screen.queryByRole("button", { name: /Apply/i })).toBeNull();
    expect(
      document.querySelector('[data-slot="date-time-picker-apply"]'),
    ).toBeNull();
  });

  it("still renders Apply in the modal branch", () => {
    // The reverse guard: the union must not strip the modal footer.
    render(<DateTimePicker open onOpenChange={noop} onApply={noop} />);
    expect(screen.getByRole("button", { name: /Apply/i })).toBeInTheDocument();
  });

  it("defaults to the modal branch when mode is omitted", () => {
    render(<DateTimePicker open onOpenChange={noop} onApply={noop} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders a hidden input carrying the value when name is given", () => {
    const { container } = render(
      <DateTimePicker mode="inline" name="startsAt" value="2028-01-10T09:30" />,
    );
    const hidden = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="startsAt"]',
    );
    expect(hidden).not.toBeNull();
    expect(hidden!.value).toBe("2028-01-10T09:30");
  });
});
