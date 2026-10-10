import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthLayout } from "./auth-layout";

describe("<AuthLayout />", () => {
  it("renders the form under a single h1 and the panel content", () => {
    render(
      <AuthLayout
        brand={<span>Sedjiwa Inbox</span>}
        headline="Satu inbox untuk semua nomor."
        highlights={["Chat pribadi dan grup.", "Tanpa balasan dobel."]}
        note="inbox.sedjiwa.id"
        title="Masuk"
        description={<a href="/register">Buat workspace</a>}
      >
        <form aria-label="Masuk" />
      </AuthLayout>,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Masuk");
    expect(screen.getByRole("link", { name: "Buat workspace" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Masuk" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("inbox.sedjiwa.id")).toBeInTheDocument();
  });

  it("retints the panel with panelClassName", () => {
    const { container } = render(
      <AuthLayout brand="S" headline="h" title="t" panelClassName="bg-[#0B3D37]">
        <div />
      </AuthLayout>,
    );
    const panel = container.querySelector('[data-slot="auth-layout-panel"]');
    expect(panel).toHaveClass("bg-[#0B3D37]");
    expect(panel).not.toHaveClass("bg-primary");
  });
});
