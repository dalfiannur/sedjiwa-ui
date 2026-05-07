import type { Ref } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("<Button />", () => {
  it("renders its children", () => {
    render(<Button>Save</Button>);
    expect(
      screen.getByRole("button", { name: "Save" })
    ).toBeInTheDocument();
  });

  it("applies default variant and size data attributes", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-slot", "button");
    expect(btn).toHaveAttribute("data-variant", "default");
    expect(btn).toHaveAttribute("data-size", "default");
  });

  it("applies the requested variant and size data attributes", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-variant", "destructive");
    expect(btn).toHaveAttribute("data-size", "lg");
  });

  it("forwards onClick", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("merges consumer className with variant classes", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("renders as a child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/home">Home</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/home");
    expect(link).toHaveAttribute("data-slot", "button");
  });

  it("forwards ref to the underlying element", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Ref test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("forwards ref to the child element when asChild is set", () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <Button
        asChild
        ref={ref as unknown as Ref<HTMLButtonElement>}
      >
        <a href="/home">Home</a>
      </Button>
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current?.getAttribute("href")).toBe("/home");
  });

  it("emits aria-pressed=true and data-state=on when pressed=true", () => {
    render(<Button pressed>Toggle</Button>);
    const btn = screen.getByRole("button", { name: "Toggle" });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-state", "on");
  });

  it("emits aria-pressed=false and data-state=off when pressed=false", () => {
    render(<Button pressed={false}>Toggle</Button>);
    const btn = screen.getByRole("button", { name: "Toggle" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("data-state", "off");
  });

  it("emits neither aria-pressed nor data-state when pressed is undefined", () => {
    render(<Button>Toggle</Button>);
    const btn = screen.getByRole("button", { name: "Toggle" });
    expect(btn).not.toHaveAttribute("aria-pressed");
    expect(btn).not.toHaveAttribute("data-state");
  });

  it("emits aria-busy, aria-disabled, and data-state=loading when loading=true", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button", { name: /save/i });
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).toHaveAttribute("data-state", "loading");
  });

  it("does not set the native disabled attribute when loading=true", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button", { name: /save/i });
    expect(btn).not.toBeDisabled();
  });

  it("renders a spinner with aria-hidden when loading=true", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button", { name: /save/i });
    const spinner = btn.querySelector('[data-slot="loader"]');
    expect(spinner).not.toBeNull();
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(spinner).toHaveClass("animate-spin");
  });

  it("keeps children rendered when loading=true", () => {
    render(<Button loading>Save changes</Button>);
    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toHaveTextContent("Save changes");
  });

  it("does not render a spinner when loading is undefined or false", () => {
    const { rerender } = render(<Button>Save</Button>);
    expect(
      screen.getByRole("button").querySelector('[data-slot="loader"]')
    ).toBeNull();
    rerender(<Button loading={false}>Save</Button>);
    expect(
      screen.getByRole("button").querySelector('[data-slot="loader"]')
    ).toBeNull();
  });

  it("suppresses onClick when loading=true", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading wins over pressed: data-state is loading, not on", () => {
    render(
      <Button loading pressed>
        Toggle
      </Button>
    );
    const btn = screen.getByRole("button", { name: /toggle/i });
    expect(btn).toHaveAttribute("data-state", "loading");
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("propagates aria-busy to slotted child when asChild + loading", () => {
    render(
      <Button asChild loading>
        <a href="/save">Save</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: /save/i });
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("data-state", "loading");
  });
});
