import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { avatarVariants } from "./avatar.variants";

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

  it("defaults to the middle step of the scale", () => {
    render(
      <Avatar data-testid="root">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("data-size", "default");
    expect(root).toHaveClass("size-8", "text-xs");
  });

  it("each size step sets a box and a matching text size", () => {
    // Paired on purpose: a step that moved the circle without the initials is
    // the fault this scale exists to remove. jsdom cannot see which class
    // wins, but it can see that neither is missing.
    const steps = {
      sm: ["size-6", "text-[0.625rem]"],
      default: ["size-8", "text-xs"],
      lg: ["size-10", "text-sm"],
      xl: ["size-16", "text-xl"],
      "2xl": ["size-28", "text-3xl"],
    } as const;

    for (const [size, [box, text]] of Object.entries(steps)) {
      const classes = avatarVariants({
        size: size as keyof typeof steps,
      }).split(" ");
      expect(classes).toContain(box);
      expect(classes).toContain(text);
    }
  });

  it("exposes the step as data-size", () => {
    render(
      <Avatar size="2xl" data-testid="root">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("root")).toHaveAttribute("data-size", "2xl");
  });

  it("lets className override the step's box size", () => {
    render(
      <Avatar size="lg" className="size-9" data-testid="root">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    const root = screen.getByTestId("root");
    expect(root).toHaveClass("size-9");
    expect(root).not.toHaveClass("size-10");
  });

  it("fallback sets no text size of its own", () => {
    // It inherits the root's, which is the whole mechanism. A text class here
    // would win over the root and pin the initials at one size again.
    render(
      <Avatar size="2xl">
        <AvatarFallback data-testid="fb">AB</AvatarFallback>
      </Avatar>
    );
    const classes = screen.getByTestId("fb").className.split(" ");
    expect(classes.filter((c) => c.startsWith("text-"))).toHaveLength(0);
  });

  it("tints the fallback by colorKey, the same key always the same colour", () => {
    render(
      <>
        <Avatar><AvatarFallback data-testid="a" colorKey="628111@c.us">BS</AvatarFallback></Avatar>
        <Avatar><AvatarFallback data-testid="b" colorKey="628111@c.us">BS</AvatarFallback></Avatar>
        <Avatar><AvatarFallback data-testid="c">BS</AvatarFallback></Avatar>
      </>
    );
    const a = screen.getByTestId("a").className;
    expect(a).toMatch(/bg-label-\w+ text-label-\w+-text/);
    expect(a).not.toContain("bg-muted");
    expect(screen.getByTestId("b").className).toBe(a);
    expect(screen.getByTestId("c")).toHaveClass("bg-muted");
  });

  it("keeps the DOM unchanged without a badge", () => {
    const { container } = render(<Avatar data-testid="root"><AvatarFallback>AB</AvatarFallback></Avatar>);
    expect(container.querySelector('[data-slot="avatar-wrapper"]')).toBeNull();
    expect(container.firstElementChild).toBe(screen.getByTestId("root"));
  });

  it("puts the badge outside the clipped circle and names it when labelled", () => {
    const { container } = render(
      <Avatar data-testid="root" badge={<svg />} badgeLabel="Grup">
        <AvatarFallback>TG</AvatarFallback>
      </Avatar>
    );
    const wrapper = container.querySelector('[data-slot="avatar-wrapper"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toContainElement(screen.getByTestId("root"));
    expect(screen.getByTestId("root")).not.toContainElement(screen.getByRole("img", { name: "Grup" }));
  });

  it("hides an unlabelled badge from assistive tech", () => {
    const { container } = render(<Avatar badge={<svg />}><AvatarFallback>TG</AvatarFallback></Avatar>);
    expect(container.querySelector('[data-slot="avatar-badge"]')).toHaveAttribute("aria-hidden", "true");
  });
});
