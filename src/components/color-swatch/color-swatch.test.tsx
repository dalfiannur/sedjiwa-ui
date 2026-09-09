import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ColorSwatch, ColorSwatchList } from "./color-swatch";

function renderRow() {
  return render(
    <ColorSwatchList label="Warna tersedia">
      <ColorSwatch color="#1B1B1B" name="Hitam" />
      <ColorSwatch color="#8E8E8E" name="Abu" />
      <ColorSwatch color="#EE8888" name="Merah muda" />
    </ColorSwatchList>
  );
}

describe("<ColorSwatchList />", () => {
  it("is a named list", () => {
    renderRow();
    expect(screen.getByRole("list", { name: "Warna tersedia" })).toBeInTheDocument();
  });

  it("holds one item per colour", () => {
    renderRow();
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("carries data-slot", () => {
    renderRow();
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-slot",
      "color-swatch-list"
    );
  });
});

describe("<ColorSwatch />", () => {
  // The reason the component exists. A dot with no accessible name turns the
  // whole column into silence, and it looks perfectly finished while doing so.
  it("speaks its name", () => {
    renderRow();
    expect(
      screen.getByRole("listitem", { name: "Merah muda" })
    ).toBeInTheDocument();
  });

  it("shows its name on hover too", () => {
    renderRow();
    expect(screen.getByRole("listitem", { name: "Hitam" })).toHaveAttribute(
      "title",
      "Hitam"
    );
  });

  it("paints the colour it was given", () => {
    renderRow();
    expect(screen.getByRole("listitem", { name: "Abu" })).toHaveStyle({
      backgroundColor: "#8E8E8E",
    });
  });

  it("keeps an edge so pale colours stay visible on a pale surface", () => {
    render(
      <ColorSwatchList label="Warna tersedia">
        <ColorSwatch color="#FFFFFF" name="Putih" />
      </ColorSwatchList>
    );
    expect(screen.getByRole("listitem", { name: "Putih" })).toHaveClass(
      "ring-1",
      "ring-foreground/15",
      "ring-inset"
    );
  });

  it("lets a caller's style survive alongside the colour", () => {
    render(
      <ColorSwatchList label="Warna tersedia">
        <ColorSwatch
          color="#1B1B1B"
          name="Hitam"
          style={{ outlineStyle: "dashed" }}
        />
      </ColorSwatchList>
    );
    const swatch = screen.getByRole("listitem", { name: "Hitam" });
    expect(swatch).toHaveStyle({
      backgroundColor: "#1B1B1B",
      outlineStyle: "dashed",
    });
  });

  it("takes its size from the list, not from its own default", () => {
    // Both carry a size class; `[&>*]` on the list has the higher specificity
    // and wins. jsdom cannot see that — the browser test in the story can.
    const { container } = render(
      <ColorSwatchList label="Warna tersedia" size="lg">
        <ColorSwatch color="#1B1B1B" name="Hitam" />
      </ColorSwatchList>
    );
    expect(container.querySelector('[data-slot="color-swatch-list"]')).toHaveClass(
      "[&>*]:size-5"
    );
  });
});
