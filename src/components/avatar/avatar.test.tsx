import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

describe("<Avatar />", () => {
  it("renders root with data-slot", () => {
    render(
      <Avatar data-testid="root">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("root")).toHaveAttribute("data-slot", "avatar");
  });

  it("shows fallback when no image src is provided", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("fallback has data-slot=avatar-fallback", () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="fb">AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("fb")).toHaveAttribute("data-slot", "avatar-fallback");
  });

  it("renders without crashing with AvatarImage child", () => {
    render(
      <Avatar>
        <AvatarImage src="" alt="user" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});
