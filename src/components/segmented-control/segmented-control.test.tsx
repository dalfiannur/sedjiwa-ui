import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SegmentedControl } from "./segmented-control";

const VIEWS = [
  { value: "list", label: "Daftar" },
  { value: "grid", label: "Kisi" },
  { value: "map", label: "Peta" },
];

function segment(name: string): HTMLElement {
  return screen.getByRole("radio", { name });
}

describe("<SegmentedControl />", () => {
  describe("rendering", () => {
    it("renders one segment per item", () => {
      render(<SegmentedControl items={VIEWS} defaultValue="list" />);
      expect(screen.getAllByRole("radio")).toHaveLength(3);
    });

    it("groups them as a radiogroup", () => {
      render(<SegmentedControl items={VIEWS} defaultValue="list" />);
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("checks the default value", () => {
      render(<SegmentedControl items={VIEWS} defaultValue="grid" />);
      expect(segment("Kisi")).toHaveAttribute("aria-checked", "true");
      expect(segment("Daftar")).toHaveAttribute("aria-checked", "false");
    });

    it("takes an accessible name for the group", () => {
      render(
        <SegmentedControl items={VIEWS} defaultValue="list" aria-label="Tampilan" />,
      );
      expect(
        screen.getByRole("radiogroup", { name: "Tampilan" }),
      ).toBeInTheDocument();
    });
  });

  describe("selection", () => {
    it("selects the clicked segment", async () => {
      const user = userEvent.setup();
      render(<SegmentedControl items={VIEWS} defaultValue="list" />);
      await user.click(segment("Peta"));
      expect(segment("Peta")).toHaveAttribute("aria-checked", "true");
    });

    it("reports the new value", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <SegmentedControl
          items={VIEWS}
          defaultValue="list"
          onValueChange={onValueChange}
        />,
      );
      await user.click(segment("Peta"));
      expect(onValueChange).toHaveBeenCalledWith("map");
    });

    // A segmented control answers a question that always has an answer. Radix's
    // single toggle group would happily clear itself on a second press.
    it("stays selected when the active segment is clicked again", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <SegmentedControl
          items={VIEWS}
          defaultValue="list"
          onValueChange={onValueChange}
        />,
      );
      await user.click(segment("Daftar"));
      expect(segment("Daftar")).toHaveAttribute("aria-checked", "true");
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("obeys a controlled value", async () => {
      const user = userEvent.setup();
      render(<SegmentedControl items={VIEWS} value="list" />);
      await user.click(segment("Peta"));
      expect(segment("Daftar")).toHaveAttribute("aria-checked", "true");
    });

    it("reports the request even when controlled", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <SegmentedControl
          items={VIEWS}
          value="list"
          onValueChange={onValueChange}
        />,
      );
      await user.click(segment("Peta"));
      expect(onValueChange).toHaveBeenCalledWith("map");
    });
  });

  describe("keyboard", () => {
    it("moves to the next segment with an arrow key", async () => {
      const user = userEvent.setup();
      render(<SegmentedControl items={VIEWS} defaultValue="list" />);
      await user.tab();
      await user.keyboard("{ArrowRight}");
      expect(segment("Kisi")).toHaveFocus();
    });

    it("holds a single tab stop for the whole group", async () => {
      const user = userEvent.setup();
      render(
        <>
          <SegmentedControl items={VIEWS} defaultValue="list" />
          <button type="button">setelah</button>
        </>,
      );
      await user.tab();
      await user.tab();
      expect(screen.getByRole("button", { name: "setelah" })).toHaveFocus();
    });
  });

  describe("disabled", () => {
    it("disables a single item", () => {
      const items = [...VIEWS.slice(0, 2), { ...VIEWS[2]!, disabled: true }];
      render(<SegmentedControl items={items} defaultValue="list" />);
      expect(segment("Peta")).toBeDisabled();
    });

    it("leaves the rest usable when one item is disabled", async () => {
      const user = userEvent.setup();
      const items = [...VIEWS.slice(0, 2), { ...VIEWS[2]!, disabled: true }];
      render(<SegmentedControl items={items} defaultValue="list" />);
      await user.click(segment("Kisi"));
      expect(segment("Kisi")).toHaveAttribute("aria-checked", "true");
    });

    it("disables every segment when the group is disabled", () => {
      render(<SegmentedControl items={VIEWS} defaultValue="list" disabled />);
      for (const item of VIEWS) {
        expect(segment(item.label)).toBeDisabled();
      }
    });
  });

  describe("in a form", () => {
    it("submits its value through a hidden input", () => {
      const { container } = render(
        <SegmentedControl items={VIEWS} defaultValue="grid" name="view" />,
      );
      const hidden = container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="view"]',
      );
      expect(hidden).toHaveValue("grid");
    });

    it("renders no hidden input without a name", () => {
      const { container } = render(
        <SegmentedControl items={VIEWS} defaultValue="grid" />,
      );
      expect(
        container.querySelector('input[type="hidden"]'),
      ).not.toBeInTheDocument();
    });
  });
});
