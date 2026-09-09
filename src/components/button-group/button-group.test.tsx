import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ButtonGroup } from "./button-group";
import { Button } from "../button";

describe("<ButtonGroup />", () => {
  // Three icon buttons in a row are three unexplained controls without a name
  // on the set — each is labelled, none of them is placed.
  it("names the set", () => {
    render(
      <ButtonGroup aria-label="Tindakan surat">
        <Button aria-label="Arsipkan">a</Button>
      </ButtonGroup>,
    );
    expect(
      screen.getByRole("group", { name: "Tindakan surat" }),
    ).toBeInTheDocument();
  });

  it("keeps its children as ordinary buttons", async () => {
    const onClick = vi.fn();
    render(
      <ButtonGroup aria-label="Tindakan">
        <Button onClick={onClick}>Arsipkan</Button>
        <Button disabled>Hapus</Button>
      </ButtonGroup>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Arsipkan" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Hapus" })).toBeDisabled();
  });

  it("defaults to a horizontal run", () => {
    const { container } = render(
      <ButtonGroup aria-label="Tindakan">
        <Button>a</Button>
      </ButtonGroup>,
    );
    expect(container.firstChild).toHaveAttribute("data-orientation", "horizontal");
    expect(container.firstChild).toHaveClass("flex-row");
  });

  it("stacks when told to", () => {
    const { container } = render(
      <ButtonGroup aria-label="Tindakan" orientation="vertical">
        <Button>a</Button>
      </ButtonGroup>,
    );
    expect(container.firstChild).toHaveAttribute("data-orientation", "vertical");
    expect(container.firstChild).toHaveClass("flex-col");
  });

  // The frame belongs to the group; two stacked hairlines between neighbours
  // is the thing this component exists to avoid.
  it("strips the children's own radius, border and shadow", () => {
    const { container } = render(
      <ButtonGroup aria-label="Tindakan">
        <Button>a</Button>
      </ButtonGroup>,
    );
    const group = container.firstChild;
    expect(group).toHaveClass("[&>*]:rounded-none");
    expect(group).toHaveClass("[&>*]:border-0");
    expect(group).toHaveClass("[&>*]:shadow-none");
  });

  // The group clips its overflow, so an outset focus ring would be cut in half.
  it("draws focus inside and lifts the focused child", () => {
    const { container } = render(
      <ButtonGroup aria-label="Tindakan">
        <Button>a</Button>
      </ButtonGroup>,
    );
    expect(container.firstChild).toHaveClass("[&>*:focus-visible]:ring-inset");
    expect(container.firstChild).toHaveClass("[&>*:focus-visible]:z-10");
  });
});
