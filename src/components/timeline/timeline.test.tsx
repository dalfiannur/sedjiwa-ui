import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Check } from "lucide-react";
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineRoot,
} from "./timeline";

const EVENTS = [
  { title: "Dibuat", timestamp: "10 Sep 2026 09:12" },
  { title: "Disetujui", timestamp: "10 Sep 2026 10:40", status: "success" as const },
  { title: "Dikirim", timestamp: "10 Sep 2026 14:03" },
];

function slots(name: string): Element[] {
  return Array.from(document.querySelectorAll(`[data-slot="${name}"]`));
}

describe("<Timeline />", () => {
  describe("semantics", () => {
    // An audit trail is an ordered list: the order carries the meaning, and a
    // reader announcing "list, 3 items" gets that across.
    it("is an ordered list", () => {
      const { container } = render(<Timeline items={EVENTS} />);
      expect(container.querySelector("ol")).toBeInTheDocument();
    });

    it("puts each event in a list item", () => {
      const { container } = render(<Timeline items={EVENTS} />);
      expect(container.querySelectorAll("li")).toHaveLength(3);
    });
  });

  describe("the preset", () => {
    it("renders every title", () => {
      render(<Timeline items={EVENTS} />);
      for (const event of EVENTS) {
        expect(screen.getByText(event.title)).toBeInTheDocument();
      }
    });

    it("renders timestamps", () => {
      render(<Timeline items={EVENTS} />);
      expect(screen.getByText("10 Sep 2026 09:12")).toBeInTheDocument();
    });

    it("renders an optional description", () => {
      render(
        <Timeline
          items={[
            { title: "Ditolak", description: "Anggaran tidak mencukupi" },
          ]}
        />,
      );
      expect(screen.getByText("Anggaran tidak mencukupi")).toBeInTheDocument();
    });

    it("renders nothing for an empty list", () => {
      const { container } = render(<Timeline items={[]} />);
      expect(container.querySelector("ol")).not.toBeInTheDocument();
    });

    it("keeps the given order", () => {
      render(<Timeline items={EVENTS} />);
      const titles = slots("timeline-title").map((el) => el.textContent);
      expect(titles).toEqual(["Dibuat", "Disetujui", "Dikirim"]);
    });
  });

  describe("the connector", () => {
    it("draws a line between consecutive events", () => {
      render(<Timeline items={EVENTS} />);
      expect(slots("timeline-connector")).toHaveLength(2);
    });

    // A tail hanging off the last dot promises an event that never comes.
    it("leaves no tail after the last event", () => {
      render(<Timeline items={EVENTS} />);
      const items = slots("timeline-item");
      expect(items[items.length - 1]).toHaveAttribute("data-last", "true");
    });

    it("draws no line at all for a single event", () => {
      render(<Timeline items={[{ title: "Dibuat" }]} />);
      expect(slots("timeline-connector")).toHaveLength(0);
    });
  });

  describe("status", () => {
    it("marks the dot, not the row", () => {
      render(<Timeline items={EVENTS} />);
      const dots = slots("timeline-dot");
      expect(dots[1]).toHaveAttribute("data-status", "success");
    });

    it("defaults to a neutral dot", () => {
      render(<Timeline items={EVENTS} />);
      expect(slots("timeline-dot")[0]).toHaveAttribute(
        "data-status",
        "default",
      );
    });

    // Colour alone cannot say "this one failed" — the title has to say it too,
    // so the status never becomes the only carrier of the meaning.
    it("does not colour the title along with the dot", () => {
      render(<Timeline items={[{ title: "Gagal", status: "error" }]} />);
      expect(slots("timeline-title")[0]).not.toHaveAttribute("data-status");
    });
  });

  describe("icons", () => {
    it("puts an icon inside the dot when given one", () => {
      render(
        <Timeline
          items={[{ title: "Selesai", icon: <Check data-testid="tick" /> }]}
        />,
      );
      expect(screen.getByTestId("tick")).toBeInTheDocument();
    });

    it("widens the dot so the icon fits", () => {
      render(<Timeline items={[{ title: "Selesai", icon: <Check /> }]} />);
      expect(slots("timeline-dot")[0]).toHaveAttribute("data-has-icon", "true");
    });
  });

  describe("the compound form", () => {
    it("composes the same markup by hand", () => {
      const { container } = render(
        <TimelineRoot>
          <TimelineItem>
            <TimelineDot />
            <TimelineContent>Dibuat</TimelineContent>
          </TimelineItem>
        </TimelineRoot>,
      );
      expect(container.querySelector("ol > li")).toBeInTheDocument();
      expect(screen.getByText("Dibuat")).toBeInTheDocument();
    });
  });
});
