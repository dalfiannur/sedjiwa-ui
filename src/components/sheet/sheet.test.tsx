import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Sheet, SheetTrigger, SheetClose, SheetContent,
  SheetBody, SheetTitle, SheetDescription,
} from "./sheet";

describe("<Sheet />", () => {
  it("renders trigger but not content by default", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    await user.click(screen.getByText("Open"));
    expect(await screen.findByRole("dialog")).toHaveTextContent("Title");
  });

  it("closes on internal close button", async () => {
    const user = userEvent.setup();
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
          <SheetClose>X</SheetClose>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByText("X"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a drag handle by default for side='bottom'", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="bottom">
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    const handle = screen
      .getByRole("dialog")
      .querySelector('[data-slot="sheet-handle"]');
    expect(handle).not.toBeNull();
  });

  it("renders a drag handle by default for side='top'", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="top">
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    const handle = screen
      .getByRole("dialog")
      .querySelector('[data-slot="sheet-handle"]');
    expect(handle).not.toBeNull();
  });

  it("does not render a drag handle for side='right' by default", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="right">
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    const handle = screen
      .getByRole("dialog")
      .querySelector('[data-slot="sheet-handle"]');
    expect(handle).toBeNull();
  });

  it("hides the drag handle when showDragHandle={false}", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="bottom" showDragHandle={false}>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    const handle = screen
      .getByRole("dialog")
      .querySelector('[data-slot="sheet-handle"]');
    expect(handle).toBeNull();
  });
});

describe("<SheetBody />", () => {
  it("renders a scrollable body region with the sheet-body slot", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
          <SheetBody>
            <p>Body content</p>
          </SheetBody>
        </SheetContent>
      </Sheet>
    );
    const body = screen
      .getByRole("dialog")
      .querySelector('[data-slot="sheet-body"]');
    expect(body).not.toBeNull();
    expect(body).toHaveTextContent("Body content");
    expect(body).toHaveClass("overflow-y-auto");
  });
});
