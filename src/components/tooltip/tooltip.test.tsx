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

  // The kit sets a 300ms hover delay so sweeping across a toolbar does not
  // flash every tooltip on the way past. Assert the default rather than the
  // behaviour: faking 300ms of timers around Radix's own scheduling makes for
  // a slow, brittle test, and the default is the thing that regressed before.
  it("defaults to the kit's 300ms hover delay", () => {
    const provider = TooltipProvider({ children: null });
    expect(provider.props.delayDuration).toBe(300);
  });

  // Call sites that need instant text still get it — our own collapsed sidebar
  // and app-shell both pass 0, and that must keep winning over the default.
  it("lets a call site override the delay back to 0", () => {
    const provider = TooltipProvider({ children: null, delayDuration: 0 });
    expect(provider.props.delayDuration).toBe(0);
  });

  // The kit caps tooltips at 240px to prevent "tooltip walls". Radix supplies
  // no max-width of its own, so without this the class is the only thing
  // standing between a long string and one very wide line.
  it("caps the content at the kit's 240px", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip>
        <TooltipTrigger>hover me</TooltipTrigger>
        <TooltipContent>tip text</TooltipContent>
      </Tooltip>
    );
    await user.tab();
    // NOT getByRole("tooltip") — that is Radix's assistive-tech duplicate,
    // which carries no classes at all. The styled node is the one we render.
    await screen.findByRole("tooltip");
    const content = document.querySelector('[data-slot="tooltip-content"]');
    expect(content).toHaveClass("max-w-60");
  });

});
