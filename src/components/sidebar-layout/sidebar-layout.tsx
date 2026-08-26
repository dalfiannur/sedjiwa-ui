import * as React from "react";
import { cn } from "../../lib/cn";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../sidebar";

export type SidebarLayoutProps = {
  /**
   * Sidebar aplikasi, dibangun dari primitif `Sidebar*`. Diserahkan sebagai
   * elemen, bukan disusun di sini, karena isinya — merek, daftar menu, tautan
   * aktif — selalu terikat router aplikasinya, dan pustaka ini tidak boleh
   * memilih router untuk siapa pun.
   */
  sidebar: React.ReactNode;
  /** Sisi kanan header. Pemicu sidebar sudah dipasang di sisi kiri. */
  headerActions?: React.ReactNode;
  /** Isi halaman. */
  children?: React.ReactNode;
  /** Kelas untuk pembungkus konten, misalnya mengganti padding bawaannya. */
  contentClassName?: string;
  className?: string;
} & Omit<React.ComponentProps<typeof SidebarProvider>, "children">;

/**
 * Cangkang admin yang sudah jadi: sidebar, header lengket, dan permukaan
 * konten yang terangkat.
 *
 * # Bedanya dengan AppShell
 *
 * `AppShell` adalah mesin tata letak — grid dengan header, sidebar, aside,
 * main, dan footer, lebar yang bisa diseret, dan breakpoint yang bisa diatur.
 * Ia menjawab "susun sendiri tata letaknya".
 *
 * Ini menjawab pertanyaan lain: "beri saya cangkang admin yang sudah benar".
 * Tidak ada aside, tidak ada footer, tidak ada grid yang perlu ditulis
 * pemakainya — dan itu bukan kekurangan melainkan seluruh alasannya ada.
 * Pemakai AppShell hari ini menulis sendiri `gridTemplateAreas` dan
 * `gridTemplateColumns` di call site-nya, dan menghitung sendiri keadaan buka
 * sidebar dari matchMedia.
 *
 * Pilih AppShell kalau butuh aside atau tata letak yang tidak lazim. Pilih ini
 * kalau yang dibutuhkan cangkang admin biasa.
 */
export function SidebarLayout({
  sidebar,
  headerActions,
  children,
  contentClassName,
  className,
  ...providerProps
}: SidebarLayoutProps) {
  return (
    <SidebarProvider {...providerProps}>
      {sidebar}

      {/* SidebarInset sudah `<main>`, jadi halaman di dalamnya tidak boleh
          memakai `<main>` lagi.

          bg-sidebar ada di sini DAN di header, dan keduanya menjawab hal
          berbeda. Di sini ia mengisi takik yang terbuka di balik sudut
          md:rounded-tl-2xl milik pembungkus konten; tanpa itu takiknya
          menampilkan --background, yang di mode terang nyaris sama dengan putih
          dan luput, tapi di mode gelap menganga sebagai potongan salah warna di
          sebelah header. */}
      <SidebarInset className={cn("bg-sidebar", className)}>
        {/* Tanpa bg sendiri, header yang sticky ini tembus pandang dan konten
            terlihat menggulung lewat di bawahnya. border-b sengaja tidak ada:
            beda nada --sidebar dan --surface yang memikul pemisahannya. */}
        <header
          data-slot="sidebar-layout-header"
          className="bg-sidebar sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 px-4"
        >
          <SidebarTrigger />
          <div className="flex-1" />
          {headerActions}
        </header>

        {/* Sudut membulat cuma dari md: ke atas. Di mobile sidebar-nya sheet,
            konten menempel tepi layar, dan satu sudut membulat di sana terbaca
            sebagai sisa render, bukan niat. */}
        <div
          data-slot="sidebar-layout-content"
          className={cn(
            "bg-surface flex-1 px-4 py-6 md:rounded-tl-2xl md:px-6",
            contentClassName,
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
