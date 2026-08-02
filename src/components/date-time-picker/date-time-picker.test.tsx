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
