import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("<Badge />", () => {
  it("renders children inside a span by default", () => {
    render(<Badge data-testid="b">New</Badge>);
    expect(screen.getByTestId("b").tagName).toBe("SPAN");
    expect(screen.getByTestId("b")).toHaveTextContent("New");
  });

  it("applies data-slot", () => {
    render(<Badge data-testid="b">x</Badge>);
    expect(screen.getByTestId("b")).toHaveAttribute("data-slot", "badge");
  });

  it("supports asChild composition", () => {
    render(
      <Badge asChild>
        <a href="/x" data-testid="b">link</a>
      </Badge>
    );
    expect(screen.getByTestId("b").tagName).toBe("A");
    expect(screen.getByTestId("b")).toHaveAttribute("href", "/x");
    expect(screen.getByTestId("b")).toHaveAttribute("data-slot", "badge");
  });

  it("merges consumer className", () => {
    render(<Badge data-testid="b" className="custom">x</Badge>);
    expect(screen.getByTestId("b")).toHaveClass("custom");
  });

  it("renders the success variant with success tokens", () => {
    render(<Badge data-testid="b" variant="success">Aktif</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-success");
    expect(el).toHaveClass("text-success-foreground");
  });

  it("renders the warning variant with warning tokens", () => {
    render(<Badge data-testid="b" variant="warning">Menunggu</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-warning");
    expect(el).toHaveClass("text-warning-foreground");
  });

  it("renders the info variant with info tokens", () => {
    render(<Badge data-testid="b" variant="info">Disetujui</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-info");
    expect(el).toHaveClass("text-info-foreground");
  });
});
