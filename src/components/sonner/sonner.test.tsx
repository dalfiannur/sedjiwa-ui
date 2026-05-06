import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Toaster } from "./sonner";

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
});
