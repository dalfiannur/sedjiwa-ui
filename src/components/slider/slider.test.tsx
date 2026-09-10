import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "./slider";

function thumbs(): HTMLElement[] {
  return screen.getAllByRole("slider");
}

describe("<Slider />", () => {
  describe("single value", () => {
    it("renders one thumb", () => {
      render(<Slider aria-label="Volume" defaultValue={50} />);
      expect(thumbs()).toHaveLength(1);
    });

    it("publishes its value and bounds", () => {
      render(<Slider aria-label="Volume" defaultValue={50} min={0} max={100} />);
      const [thumb] = thumbs();
      expect(thumb).toHaveAttribute("aria-valuenow", "50");
      expect(thumb).toHaveAttribute("aria-valuemin", "0");
      expect(thumb).toHaveAttribute("aria-valuemax", "100");
    });

    it("reports a plain number, not an array", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Slider
          aria-label="Volume"
          defaultValue={50}
          onValueChange={onValueChange}
        />,
      );
      await user.tab();
      await user.keyboard("{ArrowRight}");
      expect(onValueChange).toHaveBeenLastCalledWith(51);
    });

    it("moves by the step", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Slider
          aria-label="Volume"
          defaultValue={50}
          step={10}
          onValueChange={onValueChange}
        />,
      );
      await user.tab();
      await user.keyboard("{ArrowRight}");
      expect(onValueChange).toHaveBeenLastCalledWith(60);
    });

    it("stops at max", async () => {
      const user = userEvent.setup();
      render(<Slider aria-label="Volume" defaultValue={100} max={100} />);
      await user.tab();
      await user.keyboard("{ArrowRight}");
      expect(thumbs()[0]).toHaveAttribute("aria-valuenow", "100");
    });

    it("obeys a controlled value", async () => {
      const user = userEvent.setup();
      render(<Slider aria-label="Volume" value={50} />);
      await user.tab();
      await user.keyboard("{ArrowRight}");
      expect(thumbs()[0]).toHaveAttribute("aria-valuenow", "50");
    });
  });

  describe("range", () => {
    it("renders a thumb per end", () => {
      render(<Slider aria-label="Harga" defaultValue={[20, 80]} />);
      expect(thumbs()).toHaveLength(2);
    });

    it("gives each end its own value", () => {
      render(<Slider aria-label="Harga" defaultValue={[20, 80]} />);
      expect(thumbs()[0]).toHaveAttribute("aria-valuenow", "20");
      expect(thumbs()[1]).toHaveAttribute("aria-valuenow", "80");
    });

    it("reports a tuple", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Slider
          aria-label="Harga"
          defaultValue={[20, 80]}
          onValueChange={onValueChange}
        />,
      );
      await user.tab();
      await user.keyboard("{ArrowRight}");
      expect(onValueChange).toHaveBeenLastCalledWith([21, 80]);
    });

    it("names each end when given labels", () => {
      render(
        <Slider
          defaultValue={[20, 80]}
          thumbLabels={["Minimum", "Maksimum"]}
        />,
      );
      expect(
        screen.getByRole("slider", { name: "Minimum" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("slider", { name: "Maksimum" }),
      ).toBeInTheDocument();
    });
  });

  describe("marks", () => {
    it("renders a label under each mark", () => {
      render(
        <Slider
          aria-label="Ukuran"
          defaultValue={2}
          min={1}
          max={3}
          marks={[
            { value: 1, label: "Kecil" },
            { value: 2, label: "Sedang" },
            { value: 3, label: "Besar" },
          ]}
        />,
      );
      expect(screen.getByText("Kecil")).toBeInTheDocument();
      expect(screen.getByText("Besar")).toBeInTheDocument();
    });

    it("renders unlabelled marks too", () => {
      const { container } = render(
        <Slider
          aria-label="Ukuran"
          defaultValue={2}
          min={1}
          max={3}
          marks={[{ value: 1 }, { value: 2 }, { value: 3 }]}
        />,
      );
      expect(
        container.querySelectorAll('[data-slot="slider-mark"]'),
      ).toHaveLength(3);
    });

    it("marks the ones already passed", () => {
      const { container } = render(
        <Slider
          aria-label="Ukuran"
          defaultValue={2}
          min={1}
          max={3}
          marks={[{ value: 1 }, { value: 2 }, { value: 3 }]}
        />,
      );
      const filled = container.querySelectorAll(
        '[data-slot="slider-mark"][data-state="filled"]',
      );
      expect(filled).toHaveLength(2);
    });
  });

  describe("value bubble", () => {
    it("is absent by default", () => {
      const { container } = render(
        <Slider aria-label="Volume" defaultValue={50} />,
      );
      expect(
        container.querySelector('[data-slot="slider-bubble"]'),
      ).not.toBeInTheDocument();
    });

    it("shows the raw value when switched on", () => {
      render(<Slider aria-label="Volume" defaultValue={50} label />);
      expect(screen.getByText("50")).toBeInTheDocument();
    });

    it("takes a formatter", () => {
      render(
        <Slider
          aria-label="Volume"
          defaultValue={50}
          label={(v) => `${v}%`}
        />,
      );
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("gives each end of a range its own bubble", () => {
      render(<Slider aria-label="Harga" defaultValue={[20, 80]} label />);
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("80")).toBeInTheDocument();
    });
  });

  describe("states", () => {
    it("can be disabled", () => {
      render(<Slider aria-label="Volume" defaultValue={50} disabled />);
      expect(thumbs()[0]).toHaveAttribute("data-disabled");
    });

    it("takes a vertical orientation", () => {
      const { container } = render(
        <Slider aria-label="Volume" defaultValue={50} orientation="vertical" />,
      );
      expect(
        container.querySelector('[data-slot="slider"]'),
      ).toHaveAttribute("data-orientation", "vertical");
    });

    // Radix only mounts the hidden input when there is a form to submit it to.
    it("carries a name for form submission", () => {
      const { container } = render(
        <form>
          <Slider aria-label="Volume" defaultValue={50} name="volume" />
        </form>,
      );
      expect(
        container.querySelector('input[name="volume"]'),
      ).toHaveValue("50");
    });
  });
});
