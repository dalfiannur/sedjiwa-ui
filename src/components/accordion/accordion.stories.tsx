import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Bell, Lock, Settings } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionSize,
  type AccordionVariant,
} from "./accordion";
import { Switch } from "../switch";
import { Label } from "../label";

const SECTIONS = [
  {
    value: "umum",
    title: "Umum",
    body: "Nama organisasi, zona waktu, dan bahasa antarmuka.",
  },
  {
    value: "akses",
    title: "Akses",
    body: "Siapa yang boleh masuk, dan lewat cara apa.",
  },
  {
    value: "notifikasi",
    title: "Notifikasi",
    body: "Kapan sistem boleh mengirim email atau pesan.",
  },
];

/** `AccordionProps` carries Radix's `single | multiple` union, and Storybook
 *  cannot infer story args through it — every `render` would take an implicit
 *  `any`. The controls only ever drive these two props, so the meta is typed
 *  on them and each story passes `type` itself. */
type AccordionStoryArgs = { variant?: AccordionVariant; size?: AccordionSize };

const meta: Meta<AccordionStoryArgs> = {
  title: "Components/Accordion",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["separated", "contained", "plain"],
    },
    size: { control: "select", options: ["sm", "default", "lg"] },
  },
  args: { variant: "separated", size: "default" },
};
export default meta;

type Story = StoryObj<AccordionStoryArgs>;

export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <Accordion {...args} type="single" collapsible defaultValue="umum">
        {SECTIONS.map((section) => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionContent>{section.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/** Each section in its own card, for blocks that are not part of one list. */
export const Contained: Story = {
  args: { variant: "contained" },
  render: (args) => (
    <div className="w-96">
      <Accordion {...args} type="single" collapsible>
        {SECTIONS.map((section) => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionContent>{section.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/** More than one section open at a time. */
export const Multiple: Story = {
  render: (args) => (
    <div className="w-96">
      <Accordion {...args} type="multiple" defaultValue={["umum", "akses"]}>
        {SECTIONS.map((section) => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionContent>{section.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const WithIcons: Story = {
  args: { variant: "contained" },
  render: (args) => (
    <div className="w-96">
      <Accordion {...args} type="single" collapsible>
        {[
          { value: "umum", title: "Umum", icon: <Settings /> },
          { value: "akses", title: "Akses", icon: <Lock /> },
          { value: "notifikasi", title: "Notifikasi", icon: <Bell /> },
        ].map((section) => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                {section.icon}
                {section.title}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              Pengaturan untuk bagian {section.title.toLowerCase()}.
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/** Sections holding real controls, which is what a settings panel actually is. */
export const WithControls: Story = {
  render: (args) => (
    <div className="w-96">
      <Accordion {...args} type="single" collapsible defaultValue="notifikasi">
        <AccordionItem value="notifikasi">
          <AccordionTrigger>Notifikasi</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {["Email harian", "Pengingat tenggat", "Ringkasan mingguan"].map(
                (label, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <Switch id={`notif-${i}`} defaultChecked={i === 0} />
                    <Label htmlFor={`notif-${i}`}>{label}</Label>
                  </div>
                ),
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="akses">
          <AccordionTrigger>Akses</AccordionTrigger>
          <AccordionContent>{SECTIONS[1]!.body}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const WithDisabledSection: Story = {
  render: (args) => (
    <div className="w-96">
      <Accordion {...args} type="single" collapsible>
        <AccordionItem value="umum">
          <AccordionTrigger>Umum</AccordionTrigger>
          <AccordionContent>{SECTIONS[0]!.body}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="lanjutan" disabled>
          <AccordionTrigger>Lanjutan (perlu izin admin)</AccordionTrigger>
          <AccordionContent>Tidak terjangkau.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = useState<string>("umum");
    return (
      <div className="w-96 space-y-3">
        <Accordion
          {...args}
          type="single"
          collapsible
          value={open}
          onValueChange={setOpen}
        >
          {SECTIONS.map((section) => (
            <AccordionItem key={section.value} value={section.value}>
              <AccordionTrigger>{section.title}</AccordionTrigger>
              <AccordionContent>{section.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="text-muted-foreground text-sm">
          Terbuka: {open || "tidak ada"}
        </p>
      </div>
    );
  },
};
