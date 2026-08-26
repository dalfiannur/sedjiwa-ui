import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert } from "./alert";

describe("<Alert />", () => {
  it("renders its message", () => {
    render(<Alert>Stok tidak mencukupi</Alert>);
    expect(screen.getByText("Stok tidak mencukupi")).toBeInTheDocument();
  });

  it("renders an optional title above the message", () => {
    render(<Alert title="Gagal menyimpan">Coba lagi sebentar.</Alert>);
    expect(screen.getByText("Gagal menyimpan")).toBeInTheDocument();
    expect(screen.getByText("Coba lagi sebentar.")).toBeInTheDocument();
  });

  // Errors and warnings interrupt; success and info wait their turn. The kit
  // asks for exactly this split.
  it.each([
    ["error", "alert"],
    ["warning", "alert"],
    ["success", "status"],
    ["info", "status"],
  ] as const)("gives %s the %s role", (variant, role) => {
    const { container } = render(<Alert variant={variant}>pesan</Alert>);
    expect(container.firstChild).toHaveAttribute("role", role);
  });

  // The kit describes this component twice and the passages disagree for info:
  // molecules says a static informational alert needs no role, feedback says
  // role="status". Both are right, for different cases — announce lets the
  // caller say which one they have.
  it("drops the live region when announce is off", () => {
    const { container } = render(<Alert variant="error" announce="off">pesan</Alert>);
    expect(container.firstChild).not.toHaveAttribute("role");
  });

  // Icon, text and the left border all carry the variant, so colour is never
  // the only signal.
  it.each([
    ["info", "border-l-info"],
    ["success", "border-l-success"],
    ["warning", "border-l-warning"],
    ["error", "border-l-destructive"],
  ] as const)("marks %s with a toned left edge", (variant, expected) => {
    const { container } = render(<Alert variant={variant}>pesan</Alert>);
    expect(container.firstChild).toHaveClass(expected);
    expect(container.querySelector('[data-slot="alert-icon"]')).toBeTruthy();
  });

  it("hides the icon from assistive tech", () => {
    const { container } = render(<Alert variant="error">pesan</Alert>);
    expect(container.querySelector('[data-slot="alert-icon"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("can drop the icon entirely", () => {
    const { container } = render(<Alert icon={null}>pesan</Alert>);
    expect(container.querySelector('[data-slot="alert-icon"]')).toBeNull();
  });

  it("is not dismissible unless given a handler", () => {
    render(<Alert>pesan</Alert>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("dismisses through a labelled button", async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(<Alert onDismiss={onDismiss}>pesan</Alert>);
    await user.click(screen.getByRole("button", { name: "Dismiss alert" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("lets the dismiss label be translated", () => {
    render(<Alert onDismiss={() => {}} dismissLabel="Tutup pemberitahuan">pesan</Alert>);
    expect(
      screen.getByRole("button", { name: "Tutup pemberitahuan" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["inline", "rounded-lg"],
    ["page", "rounded-none"],
  ] as const)("squares off the %s placement", (placement, expected) => {
    const { container } = render(<Alert placement={placement}>pesan</Alert>);
    expect(container.firstChild).toHaveClass(expected);
    expect(container.firstChild).toHaveAttribute("data-placement", placement);
  });

  it("renders an action slot", () => {
    render(<Alert action={<a href="/x">Lihat detail</a>}>pesan</Alert>);
    expect(screen.getByRole("link", { name: "Lihat detail" })).toBeInTheDocument();
  });
});
