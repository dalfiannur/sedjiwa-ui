import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { DatePicker } from "./date-picker";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../form";

function getTrigger(): HTMLButtonElement {
  return screen.getByRole("button", { name: /pilih tanggal|.+/i }) as HTMLButtonElement;
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

describe("<DatePicker />", () => {
  describe("trigger", () => {
    it("renders a trigger button with the default placeholder", () => {
      render(<DatePicker />);
      expect(
        screen.getByRole("button", { name: /pilih tanggal/i }),
      ).toBeInTheDocument();
    });

    it("renders the formatted date label when value is set", () => {
      render(
        <DatePicker
          value="2026-05-20"
          locale="en-US"
          onValueChange={() => {}}
        />,
      );
      expect(screen.getByRole("button")).toHaveTextContent("May 20, 2026");
    });

    it("uses a custom placeholder", () => {
      render(<DatePicker placeholder="Pilih tanggal" />);
      expect(
        screen.getByRole("button", { name: /pilih tanggal/i }),
      ).toBeInTheDocument();
    });

    it("disabled prevents opening the popover", async () => {
      const user = userEvent.setup();
      render(<DatePicker disabled />);
      await user.click(screen.getByRole("button"));
      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });

    it("loading state disables the trigger and shows spinner", () => {
      render(<DatePicker loading />);
      const trigger = screen.getByRole("button");
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute("aria-busy", "true");
    });

    it("state='error' propagates aria-invalid=true", () => {
      render(<DatePicker state="error" />);
      expect(screen.getByRole("button")).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("popover + calendar", () => {
    it("opens the calendar on trigger click", async () => {
      const user = userEvent.setup();
      render(<DatePicker defaultValue="2026-05-20" locale="en-US" />);
      await user.click(getTrigger());
      const grid = await screen.findByRole("grid");
      expect(grid).toBeInTheDocument();
      expect(within(grid).getByText("20")).toBeInTheDocument();
    });

    it("month header reflects the value's month", async () => {
      const user = userEvent.setup();
      render(<DatePicker defaultValue="2026-05-20" locale="en-US" />);
      await user.click(getTrigger());
      const grid = await screen.findByRole("grid");
      expect(grid).toHaveAttribute("aria-label", expect.stringMatching(/may 2026/i));
    });

    it("clicking a day fires onValueChange with ISO string and closes the popover", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker
          defaultValue="2026-05-20"
          locale="en-US"
          onValueChange={onChange}
        />,
      );
      await user.click(getTrigger());
      await screen.findByRole("grid");
      await user.click(getDayButton(15));
      expect(onChange).toHaveBeenLastCalledWith("2026-05-15");
      // Popover closes
      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });

    it("controlled mode does not update locally without onValueChange ack", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker
          value="2026-05-20"
          locale="en-US"
          onValueChange={onChange}
        />,
      );
      await user.click(getTrigger());
      await screen.findByRole("grid");
      await user.click(getDayButton(15));
      expect(onChange).toHaveBeenCalledWith("2026-05-15");
      // Reopen — still shows the original value
      await user.click(getTrigger());
      const trigger = screen.getByRole("button", { name: /may 20/i });
      expect(trigger).toBeInTheDocument();
    });

    it("Previous Month / Next Month navigation", async () => {
      const user = userEvent.setup();
      render(<DatePicker defaultValue="2026-05-20" locale="en-US" />);
      await user.click(getTrigger());
      await user.click(screen.getByRole("button", { name: /previous month/i }));
      expect(screen.getByRole("grid")).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/april 2026/i),
      );
      await user.click(screen.getByRole("button", { name: /next month/i }));
      await user.click(screen.getByRole("button", { name: /next month/i }));
      expect(screen.getByRole("grid")).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/june 2026/i),
      );
    });
  });

  describe("month / year selects", () => {
    it("renders Month and Year select triggers in the header", async () => {
      const user = userEvent.setup();
      render(<DatePicker defaultValue="2026-05-20" locale="en-US" />);
      await user.click(getTrigger());
      await screen.findByRole("grid");
      expect(
        screen.getByRole("combobox", { name: /month/i }),
      ).toHaveTextContent(/may/i);
      expect(
        screen.getByRole("combobox", { name: /year/i }),
      ).toHaveTextContent("2026");
    });

    it("picking a month from the dropdown shifts the calendar grid", async () => {
      const user = userEvent.setup();
      render(<DatePicker defaultValue="2026-05-20" locale="en-US" />);
      await user.click(getTrigger());
      await screen.findByRole("grid");
      await user.click(screen.getByRole("combobox", { name: /month/i }));
      await user.click(
        await screen.findByRole("option", { name: /august/i }),
      );
      expect(screen.getByRole("grid")).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/august 2026/i),
      );
    });

    it("picking a year from the dropdown shifts the calendar grid", async () => {
      const user = userEvent.setup();
      render(
        <DatePicker
          defaultValue="2026-05-20"
          locale="en-US"
          fromYear={2024}
          toYear={2028}
        />,
      );
      await user.click(getTrigger());
      await screen.findByRole("grid");
      await user.click(screen.getByRole("combobox", { name: /year/i }));
      await user.click(await screen.findByRole("option", { name: "2027" }));
      expect(screen.getByRole("grid")).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/may 2027/i),
      );
    });

    it("disables month options outside [min, max]", async () => {
      const user = userEvent.setup();
      render(
        <DatePicker
          defaultValue="2026-05-20"
          min="2026-04-01"
          max="2026-06-30"
          locale="en-US"
        />,
      );
      await user.click(getTrigger());
      await screen.findByRole("grid");
      await user.click(screen.getByRole("combobox", { name: /month/i }));
      const january = await screen.findByRole("option", { name: /january/i });
      const april = await screen.findByRole("option", { name: /april/i });
      expect(january).toHaveAttribute("data-disabled");
      expect(april).not.toHaveAttribute("data-disabled");
    });
  });

  describe("min / max", () => {
    it("disables days before min", async () => {
      const user = userEvent.setup();
      render(
        <DatePicker
          defaultValue="2026-05-20"
          min="2026-05-10"
          locale="en-US"
        />,
      );
      await user.click(getTrigger());
      expect(getDayButton(5)).toBeDisabled();
      expect(getDayButton(10)).not.toBeDisabled();
    });

    it("disables days after max", async () => {
      const user = userEvent.setup();
      render(
        <DatePicker
          defaultValue="2026-05-20"
          max="2026-05-25"
          locale="en-US"
        />,
      );
      await user.click(getTrigger());
      expect(getDayButton(25)).not.toBeDisabled();
      expect(getDayButton(26)).toBeDisabled();
    });
  });

  describe("keyboard navigation", () => {
    it("ArrowRight moves focus to next day", async () => {
      const user = userEvent.setup();
      render(<DatePicker defaultValue="2026-05-20" locale="en-US" />);
      await user.click(getTrigger());
      const day20 = getDayButton(20);
      day20.focus();
      await user.keyboard("{ArrowRight}");
      // The 21st should now be the focused / tabbable day.
      expect(getDayButton(21)).toHaveAttribute("tabindex", "0");
    });

    it("Enter on a day selects it", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker
          defaultValue="2026-05-20"
          locale="en-US"
          onValueChange={onChange}
        />,
      );
      await user.click(getTrigger());
      const day20 = getDayButton(20);
      day20.focus();
      await user.keyboard("{ArrowRight}{Enter}");
      expect(onChange).toHaveBeenLastCalledWith("2026-05-21");
    });
  });

  describe("forwarding", () => {
    it("forwards ref to the trigger button", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<DatePicker ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("renders a hidden input when name is provided", () => {
      const { container } = render(
        <DatePicker name="birthday" defaultValue="2026-05-20" />,
      );
      const hidden = container.querySelector(
        'input[type="hidden"][name="birthday"]',
      ) as HTMLInputElement | null;
      expect(hidden).not.toBeNull();
      expect(hidden!.value).toBe("2026-05-20");
    });
  });

  describe("RHF integration", () => {
    function RHFTestForm({
      onSubmit,
    }: {
      onSubmit: (data: { birthday: string | null }) => void;
    }) {
      const form = useForm<{ birthday: string | null }>({
        defaultValues: { birthday: null },
      });
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="birthday"
              rules={{ required: "Birthday is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birthday</FormLabel>
                  <FormControl>
                    <DatePicker
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
      await user.click(screen.getByLabelText("Birthday"));
      await screen.findByRole("grid");
      await user.click(getDayButton(15));
      await user.click(screen.getByRole("button", { name: /submit/i }));
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ birthday: expect.stringMatching(/^\d{4}-\d{2}-15$/) }),
        expect.anything(),
      );
    });

    it("FormControl Slot-cloning lands id/aria-describedby/aria-invalid on the trigger button", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<RHFTestForm onSubmit={onSubmit} />);
      await user.click(screen.getByRole("button", { name: /submit/i }));
      const trigger = screen.getByLabelText("Birthday");
      expect(trigger).toHaveAttribute("id");
      expect(trigger).toHaveAttribute("aria-invalid", "true");
      expect(trigger.getAttribute("aria-describedby")).toMatch(
        /form-item-message/,
      );
    });
  });
});
