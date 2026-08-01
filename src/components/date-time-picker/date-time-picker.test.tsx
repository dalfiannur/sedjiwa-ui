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

  it("snaps an off-grid incoming time to the nearest step", async () => {
    const onApply = vi.fn();
    // 09:41 with the default 30-minute step rounds to 09:30
    render(
      <DateTimePicker open onOpenChange={noop} onApply={onApply} value="2028-01-10T09:41" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T09:30");
  });

  it("does not fire onApply merely from opening", () => {
    const onApply = vi.fn();
    render(<DateTimePicker open onOpenChange={noop} onApply={onApply} value="2028-01-10T09:30" />);
    expect(onApply).not.toHaveBeenCalled();
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
