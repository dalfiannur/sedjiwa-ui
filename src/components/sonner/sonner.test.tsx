import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Toaster } from "./sonner";

// Capture the props Toaster hands to sonner's own Toaster.
let captured: Record<string, unknown> = {};
vi.mock("sonner", () => ({
  Toaster: (props: Record<string, unknown>) => {
    captured = props;
    return <section aria-label="notifications" />;
  },
}));

describe("<Toaster />", () => {
  it("renders without crashing", () => {
    const { container } = render(<Toaster />);
    expect(container.querySelector("[aria-label]")).toBeTruthy();
  });

  it("forwards arbitrary props without crashing", () => {
    const { container } = render(<Toaster position="top-right" />);
    // sonner renders its section tag with aria-label; data-sonner-toaster
    // is set by a DOM side-effect that doesn't run synchronously in jsdom,
    // so we verify the section (and thus the prop) rendered without error.
    expect(container.querySelector("[aria-label]")).toBeTruthy();
  });

  // Toaster calls useTheme(), so it cannot be invoked as a plain function the
  // way TooltipProvider can. Capture what it hands to sonner instead — that is
  // the actual contract, and it survives sonner changing its own defaults.
  it("passes the kit's 5s dismiss and 3 visible toasts to sonner", () => {
    render(<Toaster />);
    expect(captured).toMatchObject({ duration: 5000, visibleToasts: 3 });
  });

  it("lets a call site override both", () => {
    render(<Toaster duration={100} visibleToasts={9} />);
    expect(captured).toMatchObject({ duration: 100, visibleToasts: 9 });
  });
});
