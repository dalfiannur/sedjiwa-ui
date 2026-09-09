import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Rating } from "./rating";

function fillWidth(container: HTMLElement): string | undefined {
  const el = container.querySelector<HTMLElement>(
    '[data-slot="rating-stars"] > span:last-child',
  );
  return el?.style.width;
}

describe("<Rating />", () => {
  // Stars are shapes. Without a name they carry nothing at all to a screen
  // reader, which is why the role is img rather than a bare div.
  it("speaks the score", () => {
    render(<Rating value={4} />);
    expect(
      screen.getByRole("img", { name: "4 dari 5 bintang" }),
    ).toBeInTheDocument();
  });

  it("folds the count into the spoken name", () => {
    render(<Rating value={4} count={131} />);
    expect(
      screen.getByRole("img", { name: "4 dari 5 bintang, 131 ulasan" }),
    ).toBeInTheDocument();
  });

  it("shows the count", () => {
    render(<Rating value={4} count={131} />);
    expect(screen.getByText("(131)")).toBeInTheDocument();
  });

  it("omits the count element when there is none", () => {
    const { container } = render(<Rating value={4} />);
    expect(container.querySelector('[data-slot="rating-count"]')).toBeNull();
  });

  it("draws one star per point of max", () => {
    const { container } = render(<Rating value={2} max={10} />);
    // Two rows of `max` stars: the muted base and the clipped fill.
    expect(container.querySelectorAll("svg")).toHaveLength(20);
  });

  it("fills proportionally", () => {
    const { container } = render(<Rating value={4} max={5} />);
    expect(fillWidth(container)).toBe("80%");
  });

  // Rounding a 4.3 to 4 tells the reader something untrue about the score.
  it("draws fractions rather than rounding", () => {
    const { container } = render(<Rating value={4.3} max={5} />);
    expect(fillWidth(container)).toBe("86%");
  });

  it.each([
    [-2, "0%"],
    [9, "100%"],
  ])("clamps a value of %s", (value, expected) => {
    const { container } = render(<Rating value={value} max={5} />);
    expect(fillWidth(container)).toBe(expected);
  });

  it("reports the clamped value, not the one passed", () => {
    render(<Rating value={9} max={5} />);
    expect(
      screen.getByRole("img", { name: "5 dari 5 bintang" }),
    ).toBeInTheDocument();
  });

  it("hides the stars themselves from assistive tech", () => {
    const { container } = render(<Rating value={4} />);
    expect(container.querySelector('[data-slot="rating-stars"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("takes custom wording", () => {
    render(
      <Rating
        value={4}
        count={131}
        formatLabel={(v, m, c) => `Rated ${v} of ${m}, ${c} reviews`}
        formatCount={(n) => `${n} ulasan`}
      />,
    );
    expect(
      screen.getByRole("img", { name: "Rated 4 of 5, 131 reviews" }),
    ).toBeInTheDocument();
    expect(screen.getByText("131 ulasan")).toBeInTheDocument();
  });

  it("survives a max of zero without dividing by it", () => {
    const { container } = render(<Rating value={0} max={0} />);
    expect(fillWidth(container)).toBe("0%");
  });
});
