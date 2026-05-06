import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "./separator";

describe("<Separator />", () => {
  it("renders horizontal by default", () => {
    render(<Separator data-testid="sep" />);
    const el = screen.getByTestId("sep");
    expect(el).toHaveAttribute("data-orientation", "horizontal");
    expect(el).toHaveAttribute("data-slot", "separator");
  });

  it("renders vertical when requested", () => {
    render(<Separator orientation="vertical" data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveAttribute("data-orientation", "vertical");
  });

  it("is decorative by default (role=none)", () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveAttribute("role", "none");
  });

  it("becomes a real separator role when decorative=false", () => {
    render(<Separator decorative={false} data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveAttribute("role", "separator");
  });
});
