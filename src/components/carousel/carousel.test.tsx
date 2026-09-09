import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselStatus,
} from "./carousel";

function Basic({ label = "Produk unggulan" }: { label?: string }) {
  return (
    <Carousel aria-label={label}>
      <CarouselContent>
        <CarouselItem aria-label="1 dari 2">Beats Headphone</CarouselItem>
        <CarouselItem aria-label="2 dari 2">Apple Watch</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselStatus />
    </Carousel>
  );
}

describe("<Carousel />", () => {
  // Without role=region + aria-roledescription a carousel is announced as an
  // anonymous stack of divs, and the arrows have nothing to refer to.
  it("announces itself as a labelled carousel region", () => {
    render(<Basic />);
    const region = screen.getByRole("region", { name: "Produk unggulan" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
  });

  it("marks each slide as a slide", () => {
    render(<Basic />);
    const slides = screen.getAllByRole("group");
    expect(slides).toHaveLength(2);
    for (const slide of slides) {
      expect(slide).toHaveAttribute("aria-roledescription", "slide");
    }
  });

  it("names both arrows", () => {
    render(<Basic />);
    expect(screen.getByRole("button", { name: "Sebelumnya" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Berikutnya" })).toBeInTheDocument();
  });

  it("takes custom arrow labels", () => {
    render(
      <Carousel aria-label="Produk">
        <CarouselContent>
          <CarouselItem>satu</CarouselItem>
        </CarouselContent>
        <CarouselPrevious label="Produk sebelumnya" />
        <CarouselNext label="Produk berikutnya" />
      </Carousel>,
    );
    expect(
      screen.getByRole("button", { name: "Produk sebelumnya" }),
    ).toBeInTheDocument();
  });

  it("disables the previous arrow while sitting on the first slide", () => {
    render(<Basic />);
    expect(screen.getByRole("button", { name: "Sebelumnya" })).toBeDisabled();
  });

  // Arrow clicks move the slide silently otherwise — nothing in the DOM
  // changes that a screen reader would report.
  it("exposes a polite live region for the slide position", () => {
    render(<Basic />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveClass("sr-only");
  });

  it("can show the position visibly", () => {
    render(
      <Carousel aria-label="Produk">
        <CarouselContent>
          <CarouselItem>satu</CarouselItem>
        </CarouselContent>
        <CarouselStatus visuallyHidden={false} />
      </Carousel>,
    );
    expect(screen.getByRole("status")).not.toHaveClass("sr-only");
  });

  it("records the orientation for styling hooks", () => {
    render(
      <Carousel aria-label="Produk" orientation="vertical">
        <CarouselContent>
          <CarouselItem>satu</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    expect(screen.getByRole("region")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  it("fails loudly when a part is used outside the root", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<CarouselNext />)).toThrow(
      /must be rendered inside <Carousel>/,
    );
    spy.mockRestore();
  });
});
