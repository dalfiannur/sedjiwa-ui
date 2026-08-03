import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { DateRangePicker, type DateRangeValue } from "./date-range-picker";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../form";

function getTrigger(): HTMLButtonElement {
  return screen.getAllByRole("button")[0] as HTMLButtonElement;
}

function getDayButton(monthGrid: HTMLElement, day: number): HTMLButtonElement {
  const buttons = monthGrid.querySelectorAll<HTMLButtonElement>(
    'button[data-slot="calendar-day"]',
  );
  const match = Array.from(buttons).find(
    (b) => b.textContent?.trim() === String(day) && !b.dataset.outside,
  );
  if (!match) throw new Error(`Day ${day} not found in this month grid`);
  return match;
}

describe("<DateRangePicker />", () => {
  describe("trigger", () => {
    it("renders the placeholder when value is empty", () => {
      render(<DateRangePicker />);
      expect(
        screen.getByRole("button", { name: /pilih rentang tanggal/i }),
      ).toBeInTheDocument();
    });

    it("formats both ends on the same month", () => {
      render(
        <DateRangePicker
          value={{ from: "2026-05-01", to: "2026-05-31" }}
          locale="en-US"
        />,
      );
      expect(getTrigger()).toHaveTextContent(/1\s*–\s*31 May 2026/);
    });

    it("formats both ends across months in the same year", () => {
      render(
        <DateRangePicker
          value={{ from: "2026-05-01", to: "2026-06-05" }}
          locale="en-US"
        />,
      );
      expect(getTrigger()).toHaveTextContent(/May 1\s*–\s*Jun 5 2026/);
    });

    it("formats both ends across years", () => {
      render(
        <DateRangePicker
          value={{ from: "2026-12-15", to: "2027-01-05" }}
          locale="en-US"
        />,
      );
      expect(getTrigger()).toHaveTextContent(/Dec 15, 2026\s*–\s*Jan 5, 2027/);
    });

    it("formats a pending range with a suffix while choosing the end", () => {
      render(
        <DateRangePicker
          value={{ from: "2026-05-01", to: null }}
          locale="en-US"
        />,
      );
      expect(getTrigger()).toHaveTextContent(/May 1, 2026/);
    });

    it("disabled prevents opening the popover", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker disabled />);
      await user.click(getTrigger());
      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });

    it("state='error' propagates aria-invalid=true", () => {
      render(<DateRangePicker state="error" />);
      expect(getTrigger()).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("popover + range selection", () => {
    it("renders two month grids when open", async () => {
      const user = userEvent.setup();
      render(
        <DateRangePicker
          defaultValue={{ from: "2026-05-15", to: null }}
          locale="en-US"
        />,
      );
      await user.click(getTrigger());
      const grids = await screen.findAllByRole("grid");
      expect(grids).toHaveLength(2);
      expect(grids[0]).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/may 2026/i),
      );
      expect(grids[1]).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/june 2026/i),
      );
    });

    it("first click sets from; second click sets to; popover closes after both", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateRangePicker
          defaultValue={{ from: null, to: null }}
          locale="en-US"
          onValueChange={onChange}
        />,
      );
      await user.click(getTrigger());
      const [mayGrid] = await screen.findAllByRole("grid");
      await user.click(getDayButton(mayGrid!, 10));
      expect(onChange).toHaveBeenLastCalledWith({
        from: expect.stringMatching(/-10$/),
        to: null,
      });
      expect(screen.getAllByRole("grid")).toHaveLength(2);

      const [mayGridAgain] = screen.getAllByRole("grid");
      await user.click(getDayButton(mayGridAgain!, 20));
      expect(onChange).toHaveBeenLastCalledWith({
        from: expect.stringMatching(/-10$/),
        to: expect.stringMatching(/-20$/),
      });
      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });

    it("second click before from auto-swaps the endpoints", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateRangePicker
          defaultValue={{ from: null, to: null }}
          locale="en-US"
          onValueChange={onChange}
        />,
      );
      await user.click(getTrigger());
      const [mayGrid] = await screen.findAllByRole("grid");
      await user.click(getDayButton(mayGrid!, 20));
      const [mayGridAgain] = screen.getAllByRole("grid");
      await user.click(getDayButton(mayGridAgain!, 10));
      const last = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
      const ranges = last as DateRangeValue;
      expect(ranges.from?.endsWith("-10")).toBe(true);
      expect(ranges.to?.endsWith("-20")).toBe(true);
    });

    it("clicking again on a completed range starts a new from", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateRangePicker
          defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
          locale="en-US"
          onValueChange={onChange}
        />,
      );
      await user.click(getTrigger());
      const [mayGrid] = await screen.findAllByRole("grid");
      await user.click(getDayButton(mayGrid!, 25));
      expect(onChange).toHaveBeenLastCalledWith({
        from: expect.stringMatching(/-25$/),
        to: null,
      });
    });
  });

  describe("forwarding", () => {
    it("forwards ref to the trigger button", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<DateRangePicker ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("renders hidden inputs for name[from] and name[to]", () => {
      const { container } = render(
        <DateRangePicker
          name="vacation"
          defaultValue={{ from: "2026-05-10", to: "2026-05-20" }}
        />,
      );
      const fromInput = container.querySelector(
        'input[type="hidden"][name="vacation[from]"]',
      ) as HTMLInputElement | null;
      const toInput = container.querySelector(
        'input[type="hidden"][name="vacation[to]"]',
      ) as HTMLInputElement | null;
      expect(fromInput?.value).toBe("2026-05-10");
      expect(toInput?.value).toBe("2026-05-20");
    });
  });

  describe("RHF integration", () => {
    function RHFTestForm({
      onSubmit,
    }: {
      onSubmit: (data: { vacation: DateRangeValue }) => void;
    }) {
      const form = useForm<{ vacation: DateRangeValue }>({
        defaultValues: { vacation: { from: null, to: null } },
      });
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="vacation"
              rules={{
                validate: (v) =>
                  v.from && v.to ? true : "Pilih rentang tanggal",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vacation</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      locale="en-US"
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button type="submit">Submit</button>
          </form>
        </Form>
      );
    }

    it("Controller wires field.onChange to onValueChange", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<RHFTestForm onSubmit={onSubmit} />);
      await user.click(screen.getByLabelText("Vacation"));
      const grids = await screen.findAllByRole("grid");
      await user.click(getDayButton(grids[0]!, 10));
      const gridsAgain = screen.getAllByRole("grid");
      await user.click(getDayButton(gridsAgain[0]!, 15));
      await user.click(screen.getByRole("button", { name: /submit/i }));
      const submitted = onSubmit.mock.calls[0]![0] as {
        vacation: DateRangeValue;
      };
      expect(submitted.vacation.from?.endsWith("-10")).toBe(true);
      expect(submitted.vacation.to?.endsWith("-15")).toBe(true);
    });

    it("FormControl Slot-cloning lands id/aria-describedby/aria-invalid on the trigger", async () => {
      const user = userEvent.setup();
      render(<RHFTestForm onSubmit={() => {}} />);
      await user.click(screen.getByRole("button", { name: /submit/i }));
      const trigger = screen.getByLabelText("Vacation");
      expect(trigger).toHaveAttribute("id");
      expect(trigger).toHaveAttribute("aria-invalid", "true");
      expect(trigger.getAttribute("aria-describedby")).toMatch(
        /form-item-message/,
      );
    });
  });

  describe("min / max", () => {
    it("disables days before min in the calendar", async () => {
      const user = userEvent.setup();
      render(
        <DateRangePicker
          defaultValue={{ from: "2026-05-15", to: null }}
          locale="en-US"
          min="2026-05-10"
          max="2026-05-20"
        />,
      );
      await user.click(getTrigger());
      const grids = await screen.findAllByRole("grid");
      const day5 = within(grids[0]!).queryByRole("button", { name: "5" });
      expect(day5).toBeDisabled();
    });
  });
});
