import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./switch";

describe("<Switch />", () => {
  it("renders a switch role element", () => {
    render(<Switch aria-label="autosave" />);
    expect(screen.getByRole("switch", { name: "autosave" })).toBeInTheDocument();
  });

  it("applies data-slot=switch", () => {
    render(<Switch aria-label="autosave" />);
    expect(screen.getByRole("switch")).toHaveAttribute("data-slot", "switch");
  });

  it("calls onCheckedChange when clicked", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Switch aria-label="autosave" onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders a thumb when not loading", () => {
    const { container } = render(<Switch aria-label="autosave" />);
    expect(container.querySelector('[data-slot="switch-thumb"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="switch-loading"]')).toBeNull();
  });

  it("renders a centered spinner and sets aria-busy when loading=true", () => {
    const { container } = render(<Switch aria-label="autosave" loading />);
    expect(container.querySelector('[data-slot="switch-loading"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="switch-thumb"]')).toBeNull();
    expect(screen.getByRole("switch")).toHaveAttribute("aria-busy", "true");
  });

  it("blocks toggle while loading=true", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Switch
        aria-label="autosave"
        loading
        onCheckedChange={onCheckedChange}
      />,
    );
    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("applies size variant", () => {
    render(<Switch aria-label="autosave" size="sm" />);
    expect(screen.getByRole("switch")).toHaveAttribute("data-size", "sm");
    expect(screen.getByRole("switch")).toHaveClass("h-4");
  });

  it("applies error state styling", () => {
    render(<Switch aria-label="autosave" state="error" defaultChecked />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "data-state-tone",
      "error",
    );
    expect(screen.getByRole("switch")).toHaveClass(
      "data-[state=checked]:bg-destructive",
    );
  });

  it("respects disabled", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Switch
        aria-label="autosave"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Switch aria-label="autosave" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
