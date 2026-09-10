import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

function renderAccordion(props: Record<string, unknown> = {}) {
  return render(
    <Accordion type="single" collapsible {...props}>
      <AccordionItem value="umum">
        <AccordionTrigger>Umum</AccordionTrigger>
        <AccordionContent>Pengaturan umum</AccordionContent>
      </AccordionItem>
      <AccordionItem value="akses">
        <AccordionTrigger>Akses</AccordionTrigger>
        <AccordionContent>Pengaturan akses</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

function trigger(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

describe("<Accordion />", () => {
  describe("disclosure", () => {
    it("starts closed", () => {
      renderAccordion();
      expect(trigger("Umum")).toHaveAttribute("aria-expanded", "false");
    });

    it("opens the section that was clicked", async () => {
      const user = userEvent.setup();
      renderAccordion();
      await user.click(trigger("Umum"));
      expect(trigger("Umum")).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("Pengaturan umum")).toBeInTheDocument();
    });

    it("closes it again when collapsible", async () => {
      const user = userEvent.setup();
      renderAccordion();
      await user.click(trigger("Umum"));
      await user.click(trigger("Umum"));
      expect(trigger("Umum")).toHaveAttribute("aria-expanded", "false");
    });

    it("opens a section from defaultValue", () => {
      renderAccordion({ defaultValue: "akses" });
      expect(trigger("Akses")).toHaveAttribute("aria-expanded", "true");
    });

    it("reports the change", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderAccordion({ onValueChange });
      await user.click(trigger("Akses"));
      expect(onValueChange).toHaveBeenCalledWith("akses");
    });
  });

  describe("single vs multiple", () => {
    it("closes the previous section in single mode", async () => {
      const user = userEvent.setup();
      renderAccordion();
      await user.click(trigger("Umum"));
      await user.click(trigger("Akses"));
      expect(trigger("Umum")).toHaveAttribute("aria-expanded", "false");
    });

    it("keeps both open in multiple mode", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="multiple">
          <AccordionItem value="umum">
            <AccordionTrigger>Umum</AccordionTrigger>
            <AccordionContent>Pengaturan umum</AccordionContent>
          </AccordionItem>
          <AccordionItem value="akses">
            <AccordionTrigger>Akses</AccordionTrigger>
            <AccordionContent>Pengaturan akses</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      await user.click(trigger("Umum"));
      await user.click(trigger("Akses"));
      expect(trigger("Umum")).toHaveAttribute("aria-expanded", "true");
      expect(trigger("Akses")).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("wiring", () => {
    it("points each trigger at the region it controls", async () => {
      const user = userEvent.setup();
      renderAccordion();
      await user.click(trigger("Umum"));
      const controls = trigger("Umum").getAttribute("aria-controls");
      const region = screen.getByText("Pengaturan umum").closest("[id]");
      expect(region?.id).toBe(controls);
    });

    it("carries its open state on the item for CSS", async () => {
      const user = userEvent.setup();
      const { container } = renderAccordion();
      await user.click(trigger("Umum"));
      const item = container.querySelector('[data-slot="accordion-item"]');
      expect(item).toHaveAttribute("data-state", "open");
    });
  });

  describe("keyboard", () => {
    it("moves between triggers with the arrow keys", async () => {
      const user = userEvent.setup();
      renderAccordion();
      await user.tab();
      expect(trigger("Umum")).toHaveFocus();
      await user.keyboard("{ArrowDown}");
      expect(trigger("Akses")).toHaveFocus();
    });

    it("toggles on Enter", async () => {
      const user = userEvent.setup();
      renderAccordion();
      await user.tab();
      await user.keyboard("{Enter}");
      expect(trigger("Umum")).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("disabled", () => {
    it("disables a single section", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="umum" disabled>
            <AccordionTrigger>Umum</AccordionTrigger>
            <AccordionContent>Pengaturan umum</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(trigger("Umum")).toBeDisabled();
    });
  });
});
