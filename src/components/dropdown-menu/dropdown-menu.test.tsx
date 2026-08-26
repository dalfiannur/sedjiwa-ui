import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "./dropdown-menu";

describe("<DropdownMenu />", () => {
  it("renders trigger; menu hidden by default", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByText("Open"));
    const menu = await screen.findByRole("menu");
    expect(menu).toHaveTextContent("Actions");
    expect(menu).toHaveTextContent("One");
  });

  it("fires onSelect when item is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByText("Open"));
    await user.click(await screen.findByRole("menuitem", { name: "One" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("data-variant=destructive flag is on the item", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByText("Open"));
    const item = await screen.findByRole("menuitem", { name: "Delete" });
    expect(item).toHaveAttribute("data-variant", "destructive");
  });

  // The kit caps the menu at 320px. Without it a single long item label
  // stretches the whole menu — the same unbounded-width gap Tooltip had.
  it("caps the content at the kit's 320px", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByText("Open"));
    expect(await screen.findByRole("menu")).toHaveClass("max-w-80");
  });

});
