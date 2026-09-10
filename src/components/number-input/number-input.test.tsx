import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberInput } from "./number-input";

function getField(): HTMLInputElement {
  return screen.getByRole("spinbutton") as HTMLInputElement;
}

function stepUp(): HTMLButtonElement {
  return screen.getByRole("button", { name: "Naikkan" }) as HTMLButtonElement;
}

function stepDown(): HTMLButtonElement {
  return screen.getByRole("button", { name: "Turunkan" }) as HTMLButtonElement;
}

describe("<NumberInput />", () => {
  describe("display", () => {
    it("renders an empty field for a null value", () => {
      render(<NumberInput aria-label="Jumlah" value={null} />);
      expect(getField()).toHaveValue("");
    });

    it("renders zero rather than nothing", () => {
      render(<NumberInput aria-label="Jumlah" value={0} />);
      expect(getField()).toHaveValue("0");
    });

    it("leaves large numbers ungrouped by default", () => {
      render(<NumberInput aria-label="Jumlah" value={1234567} />);
      expect(getField()).toHaveValue("1234567");
    });

    it("groups them when thousandSeparator is on", () => {
      render(<NumberInput aria-label="Jumlah" value={1234567} thousandSeparator />);
      expect(getField()).toHaveValue("1.234.567");
    });

    it("pads the fraction to the decimals count", () => {
      render(<NumberInput aria-label="Jumlah" value={1.5} decimals={2} />);
      expect(getField()).toHaveValue("1,50");
    });

    it("follows an explicit locale", () => {
      render(
        <NumberInput
          aria-label="Jumlah"
          value={1234.5}
          decimals={1}
          locale="en-US"
          thousandSeparator
        />,
      );
      expect(getField()).toHaveValue("1,234.5");
    });
  });

  describe("typing", () => {
    it("reports the parsed number", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NumberInput aria-label="Jumlah" onValueChange={onValueChange} />);
      await user.type(getField(), "42");
      expect(onValueChange).toHaveBeenLastCalledWith(42);
    });

    it("reports null when the field is emptied", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          defaultValue={5}
          onValueChange={onValueChange}
        />,
      );
      await user.clear(getField());
      expect(onValueChange).toHaveBeenLastCalledWith(null);
    });

    it("refuses letters", async () => {
      const user = userEvent.setup();
      render(<NumberInput aria-label="Jumlah" />);
      await user.type(getField(), "12ab3");
      expect(getField()).toHaveValue("123");
    });

    it("refuses a minus sign unless negatives are allowed", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NumberInput aria-label="Jumlah" onValueChange={onValueChange} />);
      await user.type(getField(), "-5");
      expect(onValueChange).toHaveBeenLastCalledWith(5);
    });

    it("keeps the minus sign when negatives are allowed", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          allowNegative
          onValueChange={onValueChange}
        />,
      );
      await user.type(getField(), "-5");
      expect(onValueChange).toHaveBeenLastCalledWith(-5);
    });
  });

  describe("stepping", () => {
    it("increments by one on the up button", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          defaultValue={5}
          onValueChange={onValueChange}
        />,
      );
      await user.click(stepUp());
      expect(onValueChange).toHaveBeenLastCalledWith(6);
    });

    it("decrements by one on the down button", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          defaultValue={5}
          onValueChange={onValueChange}
        />,
      );
      await user.click(stepDown());
      expect(onValueChange).toHaveBeenLastCalledWith(4);
    });

    it("honours a custom step", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          defaultValue={100}
          step={25}
          onValueChange={onValueChange}
        />,
      );
      await user.click(stepUp());
      expect(onValueChange).toHaveBeenLastCalledWith(125);
    });

    it("does not accumulate float error on a fractional step", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          defaultValue={0.2}
          step={0.1}
          decimals={1}
          onValueChange={onValueChange}
        />,
      );
      await user.click(stepUp());
      expect(onValueChange).toHaveBeenLastCalledWith(0.3);
    });

    it("starts from min when the field is empty", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          min={10}
          onValueChange={onValueChange}
        />,
      );
      await user.click(stepUp());
      expect(onValueChange).toHaveBeenLastCalledWith(10);
    });

    it("starts from zero when the field is empty and there is no min", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NumberInput aria-label="Jumlah" onValueChange={onValueChange} />);
      await user.click(stepUp());
      expect(onValueChange).toHaveBeenLastCalledWith(0);
    });

    // Via the keyboard, not the button: at the bound the button is disabled,
    // so a click never reaches the handler that does the clamping.
    it("stops at max", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          defaultValue={10}
          max={10}
          onValueChange={onValueChange}
        />,
      );
      await user.click(getField());
      await user.keyboard("{ArrowUp}");
      expect(onValueChange).toHaveBeenLastCalledWith(10);
    });

    it("stops at min", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          defaultValue={0}
          min={0}
          onValueChange={onValueChange}
        />,
      );
      await user.click(getField());
      await user.keyboard("{ArrowDown}");
      expect(onValueChange).toHaveBeenLastCalledWith(0);
    });

    it("disables the up button at max", () => {
      render(<NumberInput aria-label="Jumlah" value={10} max={10} />);
      expect(stepUp()).toBeDisabled();
    });

    it("disables the down button at min", () => {
      render(<NumberInput aria-label="Jumlah" value={0} min={0} />);
      expect(stepDown()).toBeDisabled();
    });

    it("steps up on ArrowUp", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          defaultValue={5}
          onValueChange={onValueChange}
        />,
      );
      await user.click(getField());
      await user.keyboard("{ArrowUp}");
      expect(onValueChange).toHaveBeenLastCalledWith(6);
    });

    it("steps down on ArrowDown", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          defaultValue={5}
          onValueChange={onValueChange}
        />,
      );
      await user.click(getField());
      await user.keyboard("{ArrowDown}");
      expect(onValueChange).toHaveBeenLastCalledWith(4);
    });

    it("hides the buttons when hideControls is set", () => {
      render(<NumberInput aria-label="Jumlah" hideControls />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("keeps the buttons out of the tab order", () => {
      render(<NumberInput aria-label="Jumlah" />);
      expect(stepUp()).toHaveAttribute("tabindex", "-1");
      expect(stepDown()).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("bounds", () => {
    it("clamps a typed value on blur", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          max={10}
          onValueChange={onValueChange}
        />,
      );
      await user.type(getField(), "99");
      await user.tab();
      expect(onValueChange).toHaveBeenLastCalledWith(10);
    });

    it("leaves an out-of-range value alone when clamping is off", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <NumberInput
          aria-label="Jumlah"
          max={10}
          clampBehavior="none"
          onValueChange={onValueChange}
        />,
      );
      await user.type(getField(), "99");
      await user.tab();
      expect(onValueChange).toHaveBeenLastCalledWith(99);
    });
  });

  describe("accessibility", () => {
    it("is a spinbutton", () => {
      render(<NumberInput aria-label="Jumlah" />);
      expect(getField()).toBeInTheDocument();
    });

    it("publishes its bounds and current value", () => {
      render(<NumberInput aria-label="Jumlah" value={5} min={0} max={10} />);
      const field = getField();
      expect(field).toHaveAttribute("aria-valuenow", "5");
      expect(field).toHaveAttribute("aria-valuemin", "0");
      expect(field).toHaveAttribute("aria-valuemax", "10");
    });

    it("omits aria-valuenow while empty", () => {
      render(<NumberInput aria-label="Jumlah" value={null} />);
      expect(getField()).not.toHaveAttribute("aria-valuenow");
    });

    it("marks itself invalid in the error state", () => {
      render(<NumberInput aria-label="Jumlah" state="error" />);
      expect(getField()).toHaveAttribute("aria-invalid", "true");
    });

    it("disables the field and both buttons", () => {
      render(<NumberInput aria-label="Jumlah" disabled />);
      expect(getField()).toBeDisabled();
      expect(stepUp()).toBeDisabled();
      expect(stepDown()).toBeDisabled();
    });

    it("forwards a ref to the underlying input", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<NumberInput aria-label="Jumlah" ref={ref} />);
      expect(ref.current).toBe(getField());
    });
  });

  describe("controlled value", () => {
    it("does not move on its own", async () => {
      const user = userEvent.setup();
      render(<NumberInput aria-label="Jumlah" value={5} />);
      await user.click(stepUp());
      expect(getField()).toHaveValue("5");
    });
  });
});
