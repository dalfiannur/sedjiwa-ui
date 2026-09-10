import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PinInput } from "./pin-input";

function boxes(): HTMLInputElement[] {
  return screen
    .getAllByLabelText(/^Digit \d+$/)
    .map((el) => el as HTMLInputElement);
}

function box(n: number): HTMLInputElement {
  return screen.getByLabelText(`Digit ${n}`) as HTMLInputElement;
}

function values(): string[] {
  return boxes().map((b) => b.value);
}

describe("<PinInput />", () => {
  describe("shape", () => {
    it("renders six boxes by default", () => {
      render(<PinInput aria-label="Kode OTP" />);
      expect(boxes()).toHaveLength(6);
    });

    it("honours a custom length", () => {
      render(<PinInput aria-label="Kode OTP" length={4} />);
      expect(boxes()).toHaveLength(4);
    });

    it("groups the boxes under one name", () => {
      render(<PinInput aria-label="Kode OTP" />);
      expect(screen.getByRole("group", { name: "Kode OTP" })).toBeInTheDocument();
    });

    it("seeds the boxes from defaultValue", () => {
      render(<PinInput aria-label="Kode OTP" length={4} defaultValue="12" />);
      expect(values()).toEqual(["1", "2", "", ""]);
    });
  });

  describe("typing", () => {
    it("fills the focused box and advances", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(1));
      await user.keyboard("7");
      expect(box(1)).toHaveValue("7");
      expect(box(2)).toHaveFocus();
    });

    it("fills the whole code as the user types", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(1));
      await user.keyboard("1234");
      expect(values()).toEqual(["1", "2", "3", "4"]);
    });

    it("stays on the last box when the code is full", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(1));
      await user.keyboard("12345");
      expect(values()).toEqual(["1", "2", "3", "4"]);
      expect(box(4)).toHaveFocus();
    });

    it("replaces the digit in a box that already has one", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} defaultValue="1234" />);
      await user.click(box(2));
      await user.keyboard("9");
      expect(values()).toEqual(["1", "9", "3", "4"]);
    });

    it("refuses letters in numeric mode", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(1));
      await user.keyboard("a1");
      expect(values()).toEqual(["1", "", "", ""]);
    });

    it("accepts letters in alphanumeric mode", async () => {
      const user = userEvent.setup();
      render(
        <PinInput aria-label="Kode OTP" length={4} type="alphanumeric" />,
      );
      await user.click(box(1));
      await user.keyboard("a1");
      expect(values()).toEqual(["A", "1", "", ""]);
    });

    it("keeps the typed case when uppercasing is off", async () => {
      const user = userEvent.setup();
      render(
        <PinInput
          aria-label="Kode OTP"
          length={4}
          type="alphanumeric"
          uppercase={false}
        />,
      );
      await user.click(box(1));
      await user.keyboard("ab");
      expect(values()).toEqual(["a", "b", "", ""]);
    });
  });

  describe("erasing", () => {
    it("clears the current box and stays put", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} defaultValue="1234" />);
      await user.click(box(3));
      await user.keyboard("{Backspace}");
      expect(values()).toEqual(["1", "2", "", "4"]);
      expect(box(3)).toHaveFocus();
    });

    it("steps back and clears when the current box is empty", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} defaultValue="12" />);
      await user.click(box(3));
      await user.keyboard("{Backspace}");
      expect(values()).toEqual(["1", "", "", ""]);
      expect(box(2)).toHaveFocus();
    });

    it("does nothing at the first box", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(1));
      await user.keyboard("{Backspace}");
      expect(values()).toEqual(["", "", "", ""]);
    });
  });

  describe("moving", () => {
    it("goes left on ArrowLeft", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(3));
      await user.keyboard("{ArrowLeft}");
      expect(box(2)).toHaveFocus();
    });

    it("goes right on ArrowRight", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(1));
      await user.keyboard("{ArrowRight}");
      expect(box(2)).toHaveFocus();
    });

    it("jumps to the first box on Home", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(3));
      await user.keyboard("{Home}");
      expect(box(1)).toHaveFocus();
    });

    it("jumps to the last box on End", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(1));
      await user.keyboard("{End}");
      expect(box(4)).toHaveFocus();
    });
  });

  describe("pasting", () => {
    it("spreads a whole code across the boxes", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(1));
      await user.paste("1234");
      expect(values()).toEqual(["1", "2", "3", "4"]);
    });

    it("starts from the focused box, not the first", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(3));
      await user.paste("99");
      expect(values()).toEqual(["", "", "9", "9"]);
    });

    it("drops the overflow", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(1));
      await user.paste("123456");
      expect(values()).toEqual(["1", "2", "3", "4"]);
    });

    it("strips the separators people copy along with the code", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} />);
      await user.click(box(1));
      await user.paste("12-34");
      expect(values()).toEqual(["1", "2", "3", "4"]);
    });
  });

  describe("reporting", () => {
    it("reports the joined code as it grows", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <PinInput
          aria-label="Kode OTP"
          length={4}
          onValueChange={onValueChange}
        />,
      );
      await user.click(box(1));
      await user.keyboard("12");
      expect(onValueChange).toHaveBeenLastCalledWith("12");
    });

    it("fires onComplete once the last box is filled", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(
        <PinInput aria-label="Kode OTP" length={4} onComplete={onComplete} />,
      );
      await user.click(box(1));
      await user.keyboard("1234");
      expect(onComplete).toHaveBeenCalledWith("1234");
    });

    it("does not fire onComplete on a partial code", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(
        <PinInput aria-label="Kode OTP" length={4} onComplete={onComplete} />,
      );
      await user.click(box(1));
      await user.keyboard("123");
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("fires onComplete on a paste that fills it", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(
        <PinInput aria-label="Kode OTP" length={4} onComplete={onComplete} />,
      );
      await user.click(box(1));
      await user.paste("1234");
      expect(onComplete).toHaveBeenCalledWith("1234");
    });
  });

  describe("options", () => {
    it("masks the boxes when asked", () => {
      render(<PinInput aria-label="Kode OTP" length={4} mask />);
      expect(box(1)).toHaveAttribute("type", "password");
    });

    it("offers the SMS code to the first box only", () => {
      render(<PinInput aria-label="Kode OTP" length={4} oneTimeCode />);
      expect(box(1)).toHaveAttribute("autocomplete", "one-time-code");
      expect(box(2)).toHaveAttribute("autocomplete", "off");
    });

    it("takes a custom box label", () => {
      render(<PinInput aria-label="Kode OTP" length={2} boxLabel="Karakter" />);
      expect(screen.getByLabelText("Karakter 1")).toBeInTheDocument();
    });

    it("disables every box", () => {
      render(<PinInput aria-label="Kode OTP" length={4} disabled />);
      for (const b of boxes()) expect(b).toBeDisabled();
    });

    it("marks every box invalid in the error state", () => {
      render(<PinInput aria-label="Kode OTP" length={4} state="error" />);
      for (const b of boxes()) {
        expect(b).toHaveAttribute("aria-invalid", "true");
      }
    });
  });

  describe("controlled value", () => {
    it("shows what it is given", () => {
      render(<PinInput aria-label="Kode OTP" length={4} value="99" />);
      expect(values()).toEqual(["9", "9", "", ""]);
    });

    it("does not change on its own", async () => {
      const user = userEvent.setup();
      render(<PinInput aria-label="Kode OTP" length={4} value="99" />);
      await user.click(box(3));
      await user.keyboard("1");
      expect(values()).toEqual(["9", "9", "", ""]);
    });
  });
});
