import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar, SidebarContent } from "../sidebar";
import { SidebarLayout } from "./sidebar-layout";

function Shell(props: Partial<React.ComponentProps<typeof SidebarLayout>> = {}) {
  return (
    <SidebarLayout
      sidebar={
        <Sidebar>
          <SidebarContent>menu</SidebarContent>
        </Sidebar>
      }
      {...props}
    >
      <p>isi halaman</p>
    </SidebarLayout>
  );
}

describe("<SidebarLayout />", () => {
  it("merender sidebar, header, dan isinya", () => {
    render(<Shell />);
    expect(screen.getByText("menu")).toBeInTheDocument();
    expect(screen.getByText("isi halaman")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  // SidebarInset sudah <main>. Kalau layout ini menambah <main> lagi, halaman
  // di dalamnya punya dua landmark utama dan pembaca layar kehilangan satu
  // tempat yang seharusnya tunggal.
  it("hanya menyediakan satu landmark main", () => {
    render(<Shell />);
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("memasang pemicu sidebar di header tanpa diminta", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    const trigger = screen.getByRole("button", { name: /sidebar/i });
    expect(trigger).toBeInTheDocument();
    await user.click(trigger);
  });

  it("menaruh aksi di header", () => {
    render(<Shell headerActions={<button type="button">Tema</button>} />);
    const header = screen.getByRole("banner");
    expect(header).toContainElement(screen.getByRole("button", { name: "Tema" }));
  });

  // Header dan takik di balik sudut membulat sama-sama bg-sidebar; konten
  // bg-surface. Perbedaan nada itulah yang memisahkan keduanya — tidak ada
  // border-b yang memikulnya, jadi kelas ini yang menjaga pemisahan tetap ada.
  it("memakai nada cangkang untuk header dan nada konten untuk isinya", () => {
    const { container } = render(<Shell />);
    expect(screen.getByRole("banner")).toHaveClass("bg-sidebar");
    expect(
      container.querySelector('[data-slot="sidebar-layout-content"]'),
    ).toHaveClass("bg-surface");
    expect(screen.getByRole("main")).toHaveClass("bg-sidebar");
  });

  // Di mobile sidebar-nya sheet dan konten menempel tepi layar; satu sudut
  // membulat di sana terbaca sebagai sisa render, bukan niat.
  it("membulatkan sudut konten hanya dari md ke atas", () => {
    const { container } = render(<Shell />);
    expect(
      container.querySelector('[data-slot="sidebar-layout-content"]'),
    ).toHaveClass("md:rounded-tl-2xl");
  });

  it("membiarkan padding konten diganti", () => {
    const { container } = render(<Shell contentClassName="p-0" />);
    expect(
      container.querySelector('[data-slot="sidebar-layout-content"]'),
    ).toHaveClass("p-0");
  });

  it("meneruskan prop provider, misalnya keadaan buka bawaan", () => {
    render(<Shell defaultOpen={false} />);
    expect(screen.getByText("isi halaman")).toBeInTheDocument();
  });
});
