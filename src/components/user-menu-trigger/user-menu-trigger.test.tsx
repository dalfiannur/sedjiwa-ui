import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenuTrigger } from "./user-menu-trigger";
import { DropdownMenu, DropdownMenuTrigger } from "../dropdown-menu";

describe("<UserMenuTrigger />", () => {
  it("renders the name and role", () => {
    render(<UserMenuTrigger name="Moni Roy" role="Admin" />);
    expect(screen.getByText("Moni Roy")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("omits the role line when there is no role", () => {
    render(<UserMenuTrigger name="Moni Roy" />);
    expect(screen.queryByText("Admin")).toBeNull();
  });

  it("defaults to type=button so it never submits a surrounding form", () => {
    render(<UserMenuTrigger name="Moni Roy" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("can drop the chevron", () => {
    const { container } = render(
      <UserMenuTrigger name="Moni Roy" showChevron={false} />,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  // The whole reason this is a bare <button> with everything forwarded: Radix
  // needs to own aria-expanded / aria-haspopup via asChild.
  it("inherits the menu's ARIA wiring through asChild", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UserMenuTrigger name="Moni Roy" role="Admin" />
        </DropdownMenuTrigger>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(<UserMenuTrigger name="Moni Roy" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
