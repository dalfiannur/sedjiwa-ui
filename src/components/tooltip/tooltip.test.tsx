import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";

describe("<Tooltip />", () => {
  it("renders the trigger but not the content by default", () => {
    render(
      <Tooltip>
        <TooltipTrigger>hover me</TooltipTrigger>
        <TooltipContent>tip text</TooltipContent>
      </Tooltip>
    );
    expect(screen.getByText("hover me")).toBeInTheDocument();
    // No tooltip role rendered until the trigger is activated.
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens content on focus", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip>
        <TooltipTrigger>hover me</TooltipTrigger>
        <TooltipContent>tip text</TooltipContent>
      </Tooltip>
    );
    await user.tab();
    // Use role=tooltip to disambiguate from the assistive-tech duplicate
    // that Radix renders. Then assert the visible text is inside it.
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("tip text");
  });

  it("Tooltip works without an outer TooltipProvider (auto-wraps)", () => {
    // Sanity check: <Tooltip> should provide its own context, matching the
    // uang-gantung source. If the inner TooltipProvider were removed, this
    // would throw at runtime.
    render(
      <Tooltip>
        <TooltipTrigger>x</TooltipTrigger>
        <TooltipContent>y</TooltipContent>
      </Tooltip>
    );
    expect(screen.getByText("x")).toBeInTheDocument();
  });

  it("works wrapped in an explicit TooltipProvider too", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>z</TooltipTrigger>
          <TooltipContent>w</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText("z")).toBeInTheDocument();
  });
});
