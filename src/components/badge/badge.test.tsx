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

  it("defaults to the solid appearance", () => {
    render(<Badge data-testid="b" variant="success">Aktif</Badge>);
    expect(screen.getByTestId("b")).toHaveAttribute("data-appearance", "solid");
  });

  it("renders the subtle appearance using the subtle token pair", () => {
    render(
      <Badge data-testid="b" variant="success" appearance="subtle">
        Aktif
      </Badge>
    );
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-success-subtle");
    expect(el).toHaveClass("text-success-text");
    expect(el).toHaveAttribute("data-appearance", "subtle");
  });

  it("drops the solid fill when subtle is selected", () => {
    render(
      <Badge data-testid="b" variant="success" appearance="subtle">
        Aktif
      </Badge>
    );
    const el = screen.getByTestId("b");
    expect(el).not.toHaveClass("bg-success");
    expect(el).not.toHaveClass("text-success-foreground");
  });

  it("supports subtle destructive without the dark solid override", () => {
    render(
      <Badge data-testid="b" variant="destructive" appearance="subtle">
        Diblokir
      </Badge>
    );
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-destructive-subtle");
    expect(el).toHaveClass("text-destructive-text");
    expect(el).not.toHaveClass("dark:bg-destructive/60");
  });

  it("keeps the outline variant's border when subtle is selected", () => {
    render(
      <Badge data-testid="b" variant="outline" appearance="subtle">
        Draf
      </Badge>
    );
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("border");
    expect(el).not.toHaveClass("border-transparent");
  });

  it.each(["success", "warning", "info", "destructive"] as const)(
    "keeps border-transparent on the %s variant when subtle",
    (variant) => {
      render(
        <Badge data-testid="b" variant={variant} appearance="subtle">
          x
        </Badge>
      );
      expect(screen.getByTestId("b")).toHaveClass("border-transparent");
    }
  );

  // Every solid tone takes its foreground from a token, never a literal:
  // warning's has to be dark ink where the rest are near-white, and a
  // hard-coded text-white would be invisible on it (1.63:1).
  it.each(["destructive", "success", "warning", "info"] as const)(
    "takes the %s foreground from a token rather than literal white",
    (variant) => {
      render(<Badge data-testid="b" variant={variant}>Status</Badge>);
      const el = screen.getByTestId("b");
      expect(el).toHaveClass(`text-${variant}-foreground`);
      expect(el).not.toHaveClass("text-white");
    },
  );

  it("does not dilute the destructive fill in dark mode", () => {
    render(<Badge data-testid="b" variant="destructive">Ditolak</Badge>);
    expect(screen.getByTestId("b")).not.toHaveClass("dark:bg-destructive/60");
  });

  // Label colours are a fixed palette precisely so the gate can check them; an
  // open colour prop would leave `bun run contrast` unable to see what ships.
  it.each(["teal", "blue", "amber", "rose", "violet", "lime"] as const)(
    "fills the %s label from its own gated pair",
    (label) => {
      render(
        <Badge data-testid="b" variant={`label-${label}`}>
          Work
        </Badge>
      );
      const el = screen.getByTestId("b");
      expect(el).toHaveClass(`bg-label-${label}`);
      expect(el).toHaveClass(`text-label-${label}-text`);
    }
  );

  // A label has no solid/subtle pair — it is only ever the tinted chip — so
  // appearance must not smuggle a semantic fill in over it.
  it("ignores appearance on a label variant", () => {
    render(
      <Badge data-testid="b" variant="label-rose" appearance="subtle">
        Friends
      </Badge>
    );
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-label-rose");
    expect(el).not.toHaveClass("bg-destructive-subtle");
  });

  it("renders a decorative dot before the label with `dot`", () => {
    render(<Badge data-testid="b" variant="success" appearance="subtle" dot>Tersambung</Badge>);
    const el = screen.getByTestId("b");
    const dot = el.querySelector('[data-slot="badge-dot"]');
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(el.firstElementChild).toBe(dot);
    expect(el).toHaveTextContent("Tersambung");
  });

  it("ignores `dot` with asChild", () => {
    render(
      <Badge asChild dot>
        <a href="/x" data-testid="b">link</a>
      </Badge>
    );
    expect(screen.getByTestId("b").querySelector('[data-slot="badge-dot"]')).toBeNull();
  });
});
