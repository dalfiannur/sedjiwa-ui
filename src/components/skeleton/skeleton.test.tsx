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
});
