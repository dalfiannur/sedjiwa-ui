import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { CurrencyInput } from "./currency-input";
import { Input } from "../input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../form";

function getInput(): HTMLInputElement {
  return screen.getByRole("textbox") as HTMLInputElement;
}

describe("<CurrencyInput />", () => {
  describe("symbol rendering", () => {
    it("renders 'Rp' leading addon for currency='IDR'", () => {
      render(<CurrencyInput currency="IDR" />);
      expect(screen.getByText("Rp")).toBeInTheDocument();
    });

    it("renders '$' leading addon for currency='USD'", () => {
      render(<CurrencyInput currency="USD" />);
      expect(screen.getByText("$")).toBeInTheDocument();
    });

    it("renders the supplied symbol from a custom CurrencyConfig", () => {
      render(
        <CurrencyInput
          currency={{ currency: "EUR", locale: "de-DE", symbol: "€" }}
        />,
      );
      expect(screen.getByText("€")).toBeInTheDocument();
    });

    it("derives the symbol via Intl when omitted from a custom config", () => {
      render(
        <CurrencyInput currency={{ currency: "EUR", locale: "en-US" }} />,
      );
      // en-US narrowSymbol for EUR is "€"
      expect(screen.getByText("€")).toBeInTheDocument();
    });

    it("hideSymbol suppresses the auto leading-addon", () => {
      render(<CurrencyInput currency="IDR" hideSymbol />);
      expect(screen.queryByText("Rp")).not.toBeInTheDocument();
    });

    it("consumer-supplied <Input.LeadingAddon> in children suppresses the default symbol", () => {
      render(
        <CurrencyInput currency="IDR">
          <Input.LeadingAddon>IDR</Input.LeadingAddon>
        </CurrencyInput>,
      );
      // Default "Rp" is suppressed; consumer's "IDR" is rendered.
      expect(screen.queryByText("Rp")).not.toBeInTheDocument();
      expect(screen.getByText("IDR")).toBeInTheDocument();
    });
  });

  describe("formatting and parsing", () => {
    it("controlled value renders formatted while unfocused (IDR)", () => {
      render(<CurrencyInput currency="IDR" value={1234567} onValueChange={() => {}} />);
      expect(getInput().value).toBe("1.234.567");
    });

    it("controlled value renders formatted while unfocused (USD)", () => {
      render(<CurrencyInput currency="USD" value={1234.5} onValueChange={() => {}} />);
      expect(getInput().value).toBe("1,234.50");
    });

    it("typing 1000000 (IDR) blurs to '1.000.000' and emits 1000000", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CurrencyInput currency="IDR" onValueChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await user.keyboard("1000000");
      await user.tab();
      expect(input.value).toBe("1.000.000");
      expect(onChange).toHaveBeenLastCalledWith(1000000);
    });

    it("typing 1234.56 (USD) blurs to '1,234.56' and emits 1234.56", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CurrencyInput currency="USD" onValueChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await user.keyboard("1234.56");
      await user.tab();
      expect(input.value).toBe("1,234.56");
      expect(onChange).toHaveBeenLastCalledWith(1234.56);
    });

    it("uncontrolled defaultValue renders and updates internal state", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CurrencyInput currency="IDR" defaultValue={500} onValueChange={onChange} />,
      );
      const input = getInput();
      expect(input.value).toBe("500");
      await user.click(input);
      // Focused: live-formatted ("500" needs no grouping)
      expect(input.value).toBe("500");
      await user.keyboard("0");
      await user.tab();
      expect(input.value).toBe("5.000");
      expect(onChange).toHaveBeenLastCalledWith(5000);
    });

    it("clearing the input emits onValueChange(null)", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CurrencyInput currency="IDR" defaultValue={500} onValueChange={onChange} />,
      );
      const input = getInput();
      await user.click(input);
      await user.clear(input);
      expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it("typing 0 emits 0 and displays '0' on blur (not empty)", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CurrencyInput currency="IDR" onValueChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await user.keyboard("0");
      await user.tab();
      expect(input.value).toBe("0");
      expect(onChange).toHaveBeenLastCalledWith(0);
    });

    it("blur reflow leaves an empty input empty (no 'Rp 0')", async () => {
      const user = userEvent.setup();
      render(<CurrencyInput currency="IDR" />);
      const input = getInput();
      await user.click(input);
      await user.tab();
      expect(input.value).toBe("");
    });
  });

  describe("live formatting (while typing)", () => {
    it("inserts thousand separators after each keystroke (IDR)", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CurrencyInput currency="IDR" onValueChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await user.keyboard("1");
      expect(input.value).toBe("1");
      await user.keyboard("2");
      expect(input.value).toBe("12");
      await user.keyboard("3");
      expect(input.value).toBe("123");
      await user.keyboard("4");
      expect(input.value).toBe("1.234");
      await user.keyboard("567");
      expect(input.value).toBe("1.234.567");
    });

    it("preserves the in-progress decimal portion while typing (USD)", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CurrencyInput currency="USD" onValueChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await user.keyboard("1234.5");
      // While focused, the trailing ".5" stays as typed (not padded to ".50").
      expect(input.value).toBe("1,234.5");
      await user.tab();
      // Blur reflow pads to min decimals.
      expect(input.value).toBe("1,234.50");
    });

    it("preserves caret position when editing in the middle of the value", async () => {
      const user = userEvent.setup();
      render(
        <CurrencyInput currency="IDR" defaultValue={1234567} onValueChange={() => {}} />,
      );
      const input = getInput();
      await user.click(input);
      // Focused live-format: "1.234.567" (length 9). Position 3 sits between
      // '2' (idx 2) and '3' (idx 3).
      expect(input.value).toBe("1.234.567");
      input.setSelectionRange(3, 3);
      await user.keyboard("9");
      // Inserting '9' between '2' and '3' produces digit-stream "12934567" →
      // formatted "12.934.567". Caret should sit immediately after the inserted '9'.
      expect(input.value).toBe("12.934.567");
      expect(input.selectionStart).toBe(4);
    });
  });

  describe("allowNegative", () => {
    it("strips a leading '-' when allowNegative=false (default)", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CurrencyInput currency="IDR" onValueChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await user.keyboard("-1000");
      await user.tab();
      expect(input.value).toBe("1.000");
      expect(onChange).toHaveBeenLastCalledWith(1000);
    });

    it("permits leading '-' when allowNegative=true", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CurrencyInput currency="IDR" allowNegative onValueChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await user.keyboard("-1000");
      await user.tab();
      expect(input.value).toBe("-1.000");
      expect(onChange).toHaveBeenLastCalledWith(-1000);
    });

    it("blocks mid-string '-' (only leading minus is accepted)", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CurrencyInput currency="IDR" allowNegative onValueChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await user.keyboard("10-5");
      await user.tab();
      // mid-string '-' stripped; result is 105 (positive)
      expect(onChange).toHaveBeenLastCalledWith(105);
    });
  });

  describe("decimals override", () => {
    it("USD with decimals=0 renders without decimals (controlled)", () => {
      render(
        <CurrencyInput
          currency="USD"
          decimals={0}
          value={1234}
          onValueChange={() => {}}
        />,
      );
      expect(getInput().value).toBe("1,234");
    });

    it("USD with decimals=0 rejects the decimal mark while typing (integer-only)", async () => {
      // With decimals=0 the input is integer-only — the decimal mark is stripped
      // immediately, so subsequent digits flow into the integer portion.
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CurrencyInput currency="USD" decimals={0} onValueChange={onChange} />,
      );
      const input = getInput();
      await user.click(input);
      await user.keyboard("1234.56");
      await user.tab();
      expect(input.value).toBe("123,456");
      expect(onChange).toHaveBeenLastCalledWith(123456);
    });
  });

  describe("min / max clamp", () => {
    it("clamps a typed value below min on blur", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CurrencyInput currency="IDR" min={100} onValueChange={onChange} />,
      );
      const input = getInput();
      await user.click(input);
      await user.keyboard("50");
      await user.tab();
      expect(input.value).toBe("100");
      expect(onChange).toHaveBeenLastCalledWith(100);
    });

    it("clamps a typed value above max on blur", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CurrencyInput currency="IDR" max={1000} onValueChange={onChange} />,
      );
      const input = getInput();
      await user.click(input);
      await user.keyboard("5000");
      await user.tab();
      expect(input.value).toBe("1.000");
      expect(onChange).toHaveBeenLastCalledWith(1000);
    });
  });

  describe("paste", () => {
    it("strips currency symbol and group separators (USD: '$1,234.56' → 1234.56)", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CurrencyInput currency="USD" onValueChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await user.paste("$1,234.56");
      expect(onChange).toHaveBeenLastCalledWith(1234.56);
    });
  });

  describe("disabled / readOnly / state", () => {
    it("disabled disables the inner <input>", () => {
      render(<CurrencyInput currency="IDR" disabled />);
      expect(getInput()).toBeDisabled();
    });

    it("readOnly sets readonly on the inner <input>", () => {
      render(<CurrencyInput currency="IDR" readOnly />);
      expect(getInput()).toHaveAttribute("readonly");
    });

    it("state='error' propagates aria-invalid=true to the inner <input>", () => {
      render(<CurrencyInput currency="IDR" state="error" />);
      expect(getInput()).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("composition", () => {
    it("appends a children <Input.Action> that fires onClick", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <CurrencyInput currency="IDR" defaultValue={1000}>
          <Input.Action aria-label="Clear" onClick={onClick}>
            <X />
          </Input.Action>
        </CurrencyInput>,
      );
      await user.click(screen.getByLabelText("Clear"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("RHF integration", () => {
    function RHFTestForm({
      onSubmit,
    }: {
      onSubmit: (data: { amount: number | null }) => void;
    }) {
      const form = useForm<{ amount: number | null }>({
        defaultValues: { amount: null },
      });
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="amount"
              rules={{ required: "Amount is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      currency="IDR"
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

    it("submits the numeric value via Controller", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<RHFTestForm onSubmit={onSubmit} />);
      const input = screen.getByLabelText("Amount") as HTMLInputElement;
      await user.click(input);
      await user.keyboard("5000");
      await user.tab();
      await user.click(screen.getByRole("button", { name: /submit/i }));
      expect(onSubmit).toHaveBeenCalledWith(
        { amount: 5000 },
        expect.anything(),
      );
    });

    it("FormControl Slot-cloning lands id/aria-describedby/aria-invalid on the inner <input>, not the wrapper", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const { container } = render(<RHFTestForm onSubmit={onSubmit} />);
      // Trigger required-validation to force aria-invalid + aria-describedby (with message id)
      await user.click(screen.getByRole("button", { name: /submit/i }));
      const input = screen.getByLabelText("Amount") as HTMLInputElement;
      const wrapper = container.querySelector('[data-slot="input"]');

      expect(input).toHaveAttribute("id");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input.getAttribute("aria-describedby")).toMatch(/form-item-message/);

      // The wrapper must NOT carry these — Input.Root routes them via context.
      expect(wrapper).not.toHaveAttribute("id");
      expect(wrapper).not.toHaveAttribute("aria-describedby");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to the inner <input> element", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<CurrencyInput currency="IDR" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});
