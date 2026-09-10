import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { BellIcon, LockIcon, SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Card, CardContent } from "../card";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

/**
 * Tabs swap between views where exactly one is visible. When the sections are
 * content rather than views — and any number of them may be open — reach for
 * `Accordion` instead.
 */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="umum" className="w-96">
      <TabsList>
        <TabsTrigger value="umum">Umum</TabsTrigger>
        <TabsTrigger value="akses">Akses</TabsTrigger>
        <TabsTrigger value="notifikasi">Notifikasi</TabsTrigger>
      </TabsList>
      <TabsContent value="umum">
        Nama organisasi, zona waktu, dan bahasa antarmuka.
      </TabsContent>
      <TabsContent value="akses">Siapa yang boleh masuk, dan lewat cara apa.</TabsContent>
      <TabsContent value="notifikasi">
        Kapan sistem boleh mengirim email atau pesan.
      </TabsContent>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="umum" className="w-96">
      <TabsList>
        <TabsTrigger value="umum">
          <SettingsIcon />
          Umum
        </TabsTrigger>
        <TabsTrigger value="akses">
          <LockIcon />
          Akses
        </TabsTrigger>
        <TabsTrigger value="notifikasi">
          <BellIcon />
          Notifikasi
        </TabsTrigger>
      </TabsList>
      <TabsContent value="umum">Pengaturan umum.</TabsContent>
      <TabsContent value="akses">Pengaturan akses.</TabsContent>
      <TabsContent value="notifikasi">Pengaturan notifikasi.</TabsContent>
    </Tabs>
  ),
};

export const WithCardPanels: Story = {
  render: () => (
    <Tabs defaultValue="aktif" className="w-96">
      <TabsList>
        <TabsTrigger value="aktif">Aktif</TabsTrigger>
        <TabsTrigger value="arsip">Arsip</TabsTrigger>
      </TabsList>
      <TabsContent value="aktif">
        <Card>
          <CardContent className="p-4 text-sm">12 pesanan berjalan.</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="arsip">
        <Card>
          <CardContent className="p-4 text-sm">184 pesanan selesai.</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="umum" className="w-96">
      <TabsList>
        <TabsTrigger value="umum">Umum</TabsTrigger>
        <TabsTrigger value="lanjutan" disabled>
          Lanjutan
        </TabsTrigger>
      </TabsList>
      <TabsContent value="umum">Pengaturan umum.</TabsContent>
      <TabsContent value="lanjutan">Tidak terjangkau.</TabsContent>
    </Tabs>
  ),
};

/**
 * Radix gives the list a roving tabindex: one tab stop for the whole strip,
 * arrow keys to move inside it. The panel follows the arrow, so a keyboard user
 * never has to press Enter to see what they landed on.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <Tabs defaultValue="umum" className="w-96">
      <TabsList>
        <TabsTrigger value="umum">Umum</TabsTrigger>
        <TabsTrigger value="akses">Akses</TabsTrigger>
        <TabsTrigger value="notifikasi">Notifikasi</TabsTrigger>
      </TabsList>
      <TabsContent value="umum">Panel umum.</TabsContent>
      <TabsContent value="akses">Panel akses.</TabsContent>
      <TabsContent value="notifikasi">Panel notifikasi.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("tab", { name: "Umum" });
    first.focus();
    await userEvent.keyboard("{ArrowRight}");

    const second = canvas.getByRole("tab", { name: "Akses" });
    await expect(second).toHaveFocus();
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText("Panel akses.")).toBeVisible();
  },
};
