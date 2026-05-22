import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DynamicTab, DynamicTabPanel } from "./dynamic-tab";
import type { DynamicTabItem } from "./dynamic-tab.types";

const SEED: DynamicTabItem[] = [
  { id: "a", label: "Sheet1" },
  { id: "b", label: "Sheet2" },
  { id: "c", label: "Sheet3" },
];

function Harness({
  initial = SEED,
  ...rest
}: React.ComponentProps<typeof DynamicTab> & { initial?: DynamicTabItem[] }) {
  return (
    <DynamicTab defaultTabs={initial} defaultActiveTabId={initial[0]?.id} {...rest}>
      {initial.map((t) => (
        <DynamicTabPanel key={t.id} tabId={t.id}>
          <div>panel-{t.label}</div>
        </DynamicTabPanel>
      ))}
    </DynamicTab>
  );
}

describe("<DynamicTab />", () => {
  it("renders all triggers and only the active panel", () => {
    render(<Harness />);
    expect(screen.getByRole("tab", { name: /Sheet1/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Sheet2/ })).toBeInTheDocument();
    expect(screen.getByText("panel-Sheet1")).toBeInTheDocument();
    expect(screen.queryByText("panel-Sheet2")).not.toBeInTheDocument();
  });

  it("activates a tab on click", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("tab", { name: /Sheet2/ }));
    expect(screen.getByText("panel-Sheet2")).toBeInTheDocument();
    expect(screen.queryByText("panel-Sheet1")).not.toBeInTheDocument();
  });

  it("carries data-slot=dynamic-tab-trigger on triggers", () => {
    render(<Harness />);
    expect(
      screen.getByRole("tab", { name: /Sheet1/ }),
    ).toHaveAttribute("data-slot", "dynamic-tab-trigger");
  });

  it("enters rename mode on double-click and commits with Enter", async () => {
    const onTabsChange = vi.fn();
    const onRename = vi.fn();
    const user = userEvent.setup();
    render(<Harness onTabsChange={onTabsChange} onRename={onRename} />);

    const trigger = screen.getByRole("tab", { name: /Sheet1/ });
    await user.dblClick(trigger);

    const input = screen.getByDisplayValue("Sheet1") as HTMLInputElement;
    expect(input).toHaveAttribute("data-slot", "dynamic-tab-rename-input");

    await user.clear(input);
    await user.type(input, "Budget");
    await user.keyboard("{Enter}");

    expect(onRename).toHaveBeenCalledWith("a", "Budget");
    expect(onTabsChange).toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: /Budget/ })).toBeInTheDocument();
  });

  it("reverts the label when rename is cancelled with Escape", async () => {
    const onRename = vi.fn();
    const user = userEvent.setup();
    render(<Harness onRename={onRename} />);

    await user.dblClick(screen.getByRole("tab", { name: /Sheet1/ }));
    const input = screen.getByDisplayValue("Sheet1");
    await user.clear(input);
    await user.type(input, "Discard me");
    await user.keyboard("{Escape}");

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: /Sheet1/ })).toBeInTheDocument();
  });

  it("adds a new tab and lands in rename mode on the new tab", async () => {
    const user = userEvent.setup();
    const onTabsChange = vi.fn();
    render(<Harness onTabsChange={onTabsChange} />);

    await user.click(screen.getByRole("button", { name: /add tab/i }));

    expect(onTabsChange).toHaveBeenCalled();
    const lastCall = onTabsChange.mock.calls.at(-1)![0] as DynamicTabItem[];
    expect(lastCall).toHaveLength(4);
    expect(lastCall[3]?.label).toBe("Sheet4");

    // The rename input for the new tab should appear (deferred via timeout).
    const input = await screen.findByDisplayValue("Sheet4");
    expect(input).toBeInTheDocument();
  });

  it("calls onAdd when provided and uses the returned item", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn(async () => ({ id: "server-1", label: "From server" }));
    const onTabsChange = vi.fn();
    render(<Harness onAdd={onAdd} onTabsChange={onTabsChange} />);

    await user.click(screen.getByRole("button", { name: /add tab/i }));

    expect(onAdd).toHaveBeenCalled();
    const last = onTabsChange.mock.calls.at(-1)![0] as DynamicTabItem[];
    expect(last.at(-1)).toMatchObject({ id: "server-1", label: "From server" });
  });

  it("shows a delete confirmation dialog and removes the tab on confirm", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onTabsChange = vi.fn();
    render(<Harness onDelete={onDelete} onTabsChange={onTabsChange} />);

    const trigger = screen.getByRole("tab", { name: /Sheet2/ });
    const close = within(trigger).getByRole("button", { name: /close sheet2/i });
    await user.click(close);

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(/delete this tab/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /^delete$/i }));

    expect(onDelete).toHaveBeenCalledWith("b");
    expect(screen.queryByRole("tab", { name: /Sheet2/ })).not.toBeInTheDocument();
  });

  it("deletes immediately when confirmDelete=false", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<Harness confirmDelete={false} onDelete={onDelete} />);

    const trigger = screen.getByRole("tab", { name: /Sheet2/ });
    const close = within(trigger).getByRole("button", { name: /close sheet2/i });
    await user.click(close);

    expect(onDelete).toHaveBeenCalledWith("b");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Sheet2/ })).not.toBeInTheDocument();
  });

  it("hides the close affordance when only one tab remains", () => {
    render(<Harness initial={[{ id: "only", label: "Solo" }]} />);
    const trigger = screen.getByRole("tab", { name: /Solo/ });
    expect(
      within(trigger).queryByRole("button", { name: /close solo/i }),
    ).not.toBeInTheDocument();
  });

  it("reflects external tab updates in controlled mode", () => {
    const onTabsChange = vi.fn();
    const { rerender } = render(
      <DynamicTab
        tabs={SEED}
        onTabsChange={onTabsChange}
        activeTabId="a"
        onActiveTabChange={() => {}}
      >
        {SEED.map((t) => (
          <DynamicTabPanel key={t.id} tabId={t.id}>
            <div>panel-{t.label}</div>
          </DynamicTabPanel>
        ))}
      </DynamicTab>,
    );

    expect(screen.getByRole("tab", { name: /Sheet1/ })).toBeInTheDocument();

    const next: DynamicTabItem[] = [
      { id: "a", label: "Renamed" },
      { id: "b", label: "Sheet2" },
    ];
    rerender(
      <DynamicTab
        tabs={next}
        onTabsChange={onTabsChange}
        activeTabId="a"
        onActiveTabChange={() => {}}
      >
        {next.map((t) => (
          <DynamicTabPanel key={t.id} tabId={t.id}>
            <div>panel-{t.label}</div>
          </DynamicTabPanel>
        ))}
      </DynamicTab>,
    );

    expect(screen.getByRole("tab", { name: /Renamed/ })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Sheet3/ })).not.toBeInTheDocument();
  });

  it("renders the strip at the top when position=top", () => {
    const { container } = render(<Harness position="top" />);
    const strip = container.querySelector('[data-slot="dynamic-tab-strip"]');
    const content = container.querySelector('[data-slot="dynamic-tab-content"]');
    expect(strip).not.toBeNull();
    expect(content).not.toBeNull();
    // Strip should come before content in DOM order.
    expect(
      strip!.compareDocumentPosition(content!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders the strip at the bottom by default", () => {
    const { container } = render(<Harness />);
    const strip = container.querySelector('[data-slot="dynamic-tab-strip"]');
    const content = container.querySelector('[data-slot="dynamic-tab-content"]');
    expect(strip).not.toBeNull();
    expect(content).not.toBeNull();
    expect(
      content!.compareDocumentPosition(strip!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("hides the + button when addable=false", () => {
    render(<Harness addable={false} />);
    expect(
      screen.queryByRole("button", { name: /add tab/i }),
    ).not.toBeInTheDocument();
  });
});
