import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./password-input";

function getField(): HTMLInputElement {
  return screen.getByLabelText("Kata sandi") as HTMLInputElement;
}

describe("<PasswordInput />", () => {
  describe("masking", () => {
    it("renders a masked field by default", () => {
      render(<PasswordInput aria-label="Kata sandi" />);
      expect(getField()).toHaveAttribute("type", "password");
    });

    it("reveals the value when the toggle is pressed", async () => {
      const user = userEvent.setup();
      render(<PasswordInput aria-label="Kata sandi" />);
      await user.click(screen.getByRole("button"));
      expect(getField()).toHaveAttribute("type", "text");
    });

    it("masks it again on a second press", async () => {
      const user = userEvent.setup();
      render(<PasswordInput aria-label="Kata sandi" />);
      const toggle = screen.getByRole("button");
      await user.click(toggle);
      await user.click(toggle);
      expect(getField()).toHaveAttribute("type", "password");
    });

    it("starts revealed when defaultVisible is set", () => {
      render(<PasswordInput aria-label="Kata sandi" defaultVisible />);
      expect(getField()).toHaveAttribute("type", "text");
    });
  });

  describe("the toggle", () => {
    it("is a button, not a submit", () => {
      render(<PasswordInput aria-label="Kata sandi" />);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("reports its state through aria-pressed", async () => {
      const user = userEvent.setup();
      render(<PasswordInput aria-label="Kata sandi" />);
      const toggle = screen.getByRole("button");
      expect(toggle).toHaveAttribute("aria-pressed", "false");
      await user.click(toggle);
      expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    it("names itself for what the next press will do", async () => {
      const user = userEvent.setup();
      render(<PasswordInput aria-label="Kata sandi" />);
      const toggle = screen.getByRole("button", { name: "Tampilkan kata sandi" });
      await user.click(toggle);
      expect(
        screen.getByRole("button", { name: "Sembunyikan kata sandi" }),
      ).toBeInTheDocument();
    });

    it("takes custom labels", () => {
      render(
        <PasswordInput
          aria-label="Kata sandi"
          showLabel="Show password"
          hideLabel="Hide password"
        />,
      );
      expect(
        screen.getByRole("button", { name: "Show password" }),
      ).toBeInTheDocument();
    });

    it("is absent when showToggle is false", () => {
      render(<PasswordInput aria-label="Kata sandi" showToggle={false} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("stays reachable by keyboard", async () => {
      const user = userEvent.setup();
      render(<PasswordInput aria-label="Kata sandi" />);
      getField().focus();
      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
    });
  });

  describe("controlled visibility", () => {
    it("obeys the visible prop over its own state", async () => {
      const user = userEvent.setup();
      render(<PasswordInput aria-label="Kata sandi" visible={false} />);
      await user.click(screen.getByRole("button"));
      expect(getField()).toHaveAttribute("type", "password");
    });

    it("reports the requested state through onVisibleChange", async () => {
      const user = userEvent.setup();
      const onVisibleChange = vi.fn();
      render(
        <PasswordInput
          aria-label="Kata sandi"
          visible={false}
          onVisibleChange={onVisibleChange}
        />,
      );
      await user.click(screen.getByRole("button"));
      expect(onVisibleChange).toHaveBeenCalledWith(true);
    });
  });

  describe("as a field", () => {
    it("accepts typing", async () => {
      const user = userEvent.setup();
      render(<PasswordInput aria-label="Kata sandi" />);
      await user.type(getField(), "rahasia");
      expect(getField()).toHaveValue("rahasia");
    });

    it("marks itself invalid in the error state", () => {
      render(<PasswordInput aria-label="Kata sandi" state="error" />);
      expect(getField()).toHaveAttribute("aria-invalid", "true");
    });

    it("disables the toggle along with the field", () => {
      render(<PasswordInput aria-label="Kata sandi" disabled />);
      expect(getField()).toBeDisabled();
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("forwards a ref to the underlying input", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<PasswordInput aria-label="Kata sandi" ref={ref} />);
      expect(ref.current).toBe(getField());
    });

    it("never carries the value into the DOM as plain text", async () => {
      const user = userEvent.setup();
      const { container } = render(<PasswordInput aria-label="Kata sandi" />);
      await user.type(getField(), "rahasia");
      expect(container.innerHTML).not.toContain("rahasia");
    });
  });
});
