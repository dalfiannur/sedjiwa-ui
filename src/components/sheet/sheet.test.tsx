import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Sheet, SheetTrigger, SheetClose, SheetContent,
  SheetTitle, SheetDescription,
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
});
