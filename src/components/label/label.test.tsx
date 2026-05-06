import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "./label";

describe("<Label />", () => {
  it("renders the children", () => {
    render(<Label>Email</Label>);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("applies data-slot", () => {
    render(<Label>Email</Label>);
    expect(screen.getByText("Email")).toHaveAttribute("data-slot", "label");
  });

  it("supports htmlFor", () => {
    render(<Label htmlFor="email-input">Email</Label>);
    expect(screen.getByText("Email")).toHaveAttribute("for", "email-input");
  });

  it("merges consumer className", () => {
    render(<Label className="custom">Email</Label>);
    expect(screen.getByText("Email")).toHaveClass("custom");
  });
});
