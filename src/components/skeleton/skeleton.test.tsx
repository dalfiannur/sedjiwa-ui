import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("<Skeleton />", () => {
  it("renders with the data-slot marker", () => {
    render(<Skeleton data-testid="skel" />);
    const el = screen.getByTestId("skel");
    expect(el).toHaveAttribute("data-slot", "skeleton");
  });

  it("merges consumer className with default classes", () => {
    render(<Skeleton data-testid="skel" className="custom" />);
    const el = screen.getByTestId("skel");
    expect(el).toHaveClass("custom");
    expect(el.className).toContain("animate-pulse");
  });

  it("forwards arbitrary props to the underlying div", () => {
    render(<Skeleton data-testid="skel" aria-label="Loading user" />);
    expect(screen.getByTestId("skel")).toHaveAttribute("aria-label", "Loading user");
  });

  // A skeleton stands in for content that is not there yet — there is nothing
  // to announce, and unhidden the placeholder shapes sit in the a11y tree.
  it("is hidden from assistive tech", () => {
    const { container } = render(<Skeleton className="h-4 w-24" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  // The pulse is decoration. It is Tailwind's own animation, not a
  // tw-animate-css enter/exit one, so the base.css custom-property rule does
  // not reach it and the class has to say so itself.
  it("drops the pulse when reduced motion is asked for", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("motion-reduce:animate-none");
  });

});
