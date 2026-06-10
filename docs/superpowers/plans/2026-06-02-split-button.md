# SplitButton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compositional `SplitButton` component — a fixed default command merged with a dropdown trigger that opens an overlay of additional commands.

**Architecture:** A small React context carries shared `variant`/`size`/`disabled` from the `SplitButton` root to two halves: `SplitButtonAction` (renders the repo `Button`) and `SplitButtonMenu` (renders `DropdownMenu` with an icon-`Button` trigger + content). `SplitButtonItem`/`SplitButtonSeparator` are thin wrappers over `DropdownMenuItem`/`DropdownMenuSeparator`. Built purely on existing shadcn-derived primitives — no new dependency.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Radix (`@radix-ui/react-dropdown-menu`, via the repo's `DropdownMenu`), lucide-react, Vitest + Testing Library, Storybook. Package manager: **bun**.

**Design note (tightening of spec):** `variant`/`size` are **context-only** (set on the root, not overridable per-half) so the merged control never shows mismatched halves. `disabled` *is* overridable per-half. This refines the spec's "local override" note.

---

## File Structure

- Create: `src/components/split-button/split-button.tsx` — context + all five parts.
- Create: `src/components/split-button/index.ts` — barrel.
- Create: `src/components/split-button/split-button.test.tsx` — Vitest + Testing Library.
- Create: `src/components/split-button/split-button.stories.tsx` — Storybook.
- Modify: `src/index.ts` — public export block (after the `dropdown-menu` block, ~line 47).

No `.variants.ts` file — the parts reuse `buttonVariants` via `cn(...)` overrides (same as `dropdown-menu`, which ships none).

---

## Task 1: Write the failing test suite

**Files:**
- Test: `src/components/split-button/split-button.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/split-button/split-button.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  SplitButtonItem,
  SplitButtonSeparator,
} from "./split-button";

function Example(props: {
  onSave?: () => void;
  onSaveAs?: () => void;
  variant?: React.ComponentProps<typeof SplitButton>["variant"];
  size?: React.ComponentProps<typeof SplitButton>["size"];
  disabled?: boolean;
  actionDisabled?: boolean;
  loading?: boolean;
  triggerLabel?: string;
}) {
  return (
    <SplitButton
      aria-label="Save options"
      variant={props.variant}
      size={props.size}
      disabled={props.disabled}
    >
      <SplitButtonAction
        onClick={props.onSave}
        disabled={props.actionDisabled}
        loading={props.loading}
      >
        Save
      </SplitButtonAction>
      <SplitButtonMenu triggerLabel={props.triggerLabel}>
        <SplitButtonItem onSelect={props.onSaveAs}>Save as…</SplitButtonItem>
        <SplitButtonSeparator />
        <SplitButtonItem variant="destructive">Discard</SplitButtonItem>
      </SplitButtonMenu>
    </SplitButton>
  );
}

describe("<SplitButton />", () => {
  it("renders a labelled group with the default command", () => {
    render(<Example />);
    const group = screen.getByRole("group", { name: "Save options" });
    expect(group).toBeInTheDocument();
    expect(
      within(group).getByRole("button", { name: "Save" })
    ).toBeInTheDocument();
  });

  it("fires the action's onClick", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<Example onSave={onSave} />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("opens the overlay from the trigger and shows commands", async () => {
    const user = userEvent.setup();
    render(<Example />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "More commands" }));
    const menu = await screen.findByRole("menu");
    expect(menu).toHaveTextContent("Save as…");
    expect(menu).toHaveTextContent("Discard");
  });

  it("fires a menu item's onSelect and closes the overlay", async () => {
    const onSaveAs = vi.fn();
    const user = userEvent.setup();
    render(<Example onSaveAs={onSaveAs} />);
    await user.click(screen.getByRole("button", { name: "More commands" }));
    await user.click(await screen.findByRole("menuitem", { name: "Save as…" }));
    expect(onSaveAs).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("disables both halves when the root is disabled", () => {
    render(<Example disabled />);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "More commands" })
    ).toBeDisabled();
  });

  it("disabling the action does not disable the trigger", () => {
    render(<Example actionDisabled />);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "More commands" })
    ).not.toBeDisabled();
  });

  it("propagates variant to both halves and size to the action", () => {
    render(<Example variant="secondary" size="lg" />);
    const action = screen.getByRole("button", { name: "Save" });
    const trigger = screen.getByRole("button", { name: "More commands" });
    expect(action).toHaveAttribute("data-variant", "secondary");
    expect(trigger).toHaveAttribute("data-variant", "secondary");
    expect(action).toHaveAttribute("data-size", "lg");
  });

  it("uses a custom triggerLabel as the accessible name", () => {
    render(<Example triggerLabel="More save actions" />);
    expect(
      screen.getByRole("button", { name: "More save actions" })
    ).toBeInTheDocument();
  });

  it("shows a spinner and blocks the click while the action is loading", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<Example onSave={onSave} loading />);
    const action = screen.getByRole("button", { name: "Save" });
    expect(action.querySelector('[data-slot="loader"]')).toBeInTheDocument();
    await user.click(action);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("throws if a part is used outside <SplitButton>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<SplitButtonAction>Orphan</SplitButtonAction>)).toThrow(
      /must be used within a <SplitButton>/
    );
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test src/components/split-button/split-button.test.tsx`
Expected: FAIL — `Failed to resolve import "./split-button"` (the module does not exist yet).

---

## Task 2: Implement the component + barrel

**Files:**
- Create: `src/components/split-button/split-button.tsx`
- Create: `src/components/split-button/index.ts`
- Test: `src/components/split-button/split-button.test.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/split-button/split-button.tsx`:

```tsx
import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button, type ButtonProps } from "../button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../dropdown-menu";
import { cn } from "../../lib/cn";

type SplitButtonVariant = NonNullable<ButtonProps["variant"]>;
type SplitButtonSize = "sm" | "default" | "lg";

type SplitButtonContextValue = {
  variant: SplitButtonVariant;
  size: SplitButtonSize;
  disabled: boolean;
};

const SplitButtonContext =
  React.createContext<SplitButtonContextValue | null>(null);

function useSplitButtonContext(part: string): SplitButtonContextValue {
  const ctx = React.useContext(SplitButtonContext);
  if (!ctx) {
    throw new Error(`${part} must be used within a <SplitButton>`);
  }
  return ctx;
}

// size on the root -> icon size used by the chevron trigger button
const TRIGGER_SIZE: Record<SplitButtonSize, NonNullable<ButtonProps["size"]>> = {
  sm: "icon-sm",
  default: "icon",
  lg: "icon-lg",
};

export type SplitButtonProps = React.ComponentProps<"div"> & {
  variant?: SplitButtonVariant;
  size?: SplitButtonSize;
  disabled?: boolean;
};

export function SplitButton({
  className,
  variant = "default",
  size = "default",
  disabled = false,
  children,
  ...props
}: SplitButtonProps) {
  const ctx = React.useMemo<SplitButtonContextValue>(
    () => ({ variant, size, disabled }),
    [variant, size, disabled]
  );
  return (
    <SplitButtonContext.Provider value={ctx}>
      <div
        data-slot="split-button"
        role="group"
        className={cn("inline-flex items-center", className)}
        {...props}
      >
        {children}
      </div>
    </SplitButtonContext.Provider>
  );
}

export type SplitButtonActionProps = Omit<ButtonProps, "variant" | "size">;

export function SplitButtonAction({
  className,
  disabled,
  ...props
}: SplitButtonActionProps) {
  const ctx = useSplitButtonContext("SplitButtonAction");
  return (
    <Button
      data-slot="split-button-action"
      variant={ctx.variant}
      size={ctx.size}
      disabled={disabled ?? ctx.disabled}
      className={cn("relative rounded-r-none focus-visible:z-10", className)}
      {...props}
    />
  );
}

export type SplitButtonMenuProps = {
  children: React.ReactNode;
  /** Accessible name for the chevron trigger. */
  triggerLabel?: string;
  /** Disable just the trigger (defaults to the root's disabled). */
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: React.ComponentProps<typeof DropdownMenuContent>["align"];
  side?: React.ComponentProps<typeof DropdownMenuContent>["side"];
  /** Applied to the overlay content. */
  className?: string;
};

export function SplitButtonMenu({
  children,
  triggerLabel = "More commands",
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  align = "end",
  side,
  className,
}: SplitButtonMenuProps) {
  const ctx = useSplitButtonContext("SplitButtonMenu");
  return (
    <DropdownMenu
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuTrigger asChild>
        <Button
          data-slot="split-button-trigger"
          variant={ctx.variant}
          size={TRIGGER_SIZE[ctx.size]}
          disabled={disabled ?? ctx.disabled}
          aria-label={triggerLabel}
          className={cn(
            "relative -ml-px rounded-l-none focus-visible:z-10",
            // hairline divider between the two halves
            "before:absolute before:left-0 before:top-1/2 before:h-[60%] before:w-px",
            "before:-translate-y-1/2 before:bg-current before:opacity-20"
          )}
        >
          <ChevronDownIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className={className}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type SplitButtonItemProps = React.ComponentProps<
  typeof DropdownMenuItem
>;

export function SplitButtonItem({ ...props }: SplitButtonItemProps) {
  return <DropdownMenuItem data-slot="split-button-item" {...props} />;
}

export type SplitButtonSeparatorProps = React.ComponentProps<
  typeof DropdownMenuSeparator
>;

export function SplitButtonSeparator({ ...props }: SplitButtonSeparatorProps) {
  return (
    <DropdownMenuSeparator data-slot="split-button-separator" {...props} />
  );
}
```

- [ ] **Step 2: Write the barrel**

Create `src/components/split-button/index.ts`:

```ts
export {
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  SplitButtonItem,
  SplitButtonSeparator,
} from "./split-button";
export type {
  SplitButtonProps,
  SplitButtonActionProps,
  SplitButtonMenuProps,
  SplitButtonItemProps,
  SplitButtonSeparatorProps,
} from "./split-button";
```

- [ ] **Step 3: Run the tests to verify they pass**

Run: `bun run test src/components/split-button/split-button.test.tsx`
Expected: PASS — all 10 tests green.

- [ ] **Step 4: Commit**

```bash
git add src/components/split-button/split-button.tsx src/components/split-button/index.ts src/components/split-button/split-button.test.tsx
git commit -m "feat(split-button): add compositional SplitButton built on Button + DropdownMenu"
```

---

## Task 3: Wire the public exports

**Files:**
- Modify: `src/index.ts` (after the `dropdown-menu` export block, ~line 47)

- [ ] **Step 1: Add the export block**

In `src/index.ts`, immediately after the block ending with `} from "./components/dropdown-menu";`, add:

```ts
export {
  SplitButton, SplitButtonAction, SplitButtonMenu,
  SplitButtonItem, SplitButtonSeparator,
} from "./components/split-button";
export type {
  SplitButtonProps, SplitButtonActionProps, SplitButtonMenuProps,
  SplitButtonItemProps, SplitButtonSeparatorProps,
} from "./components/split-button";
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: PASS (exit 0, no output).

- [ ] **Step 3: Lint**

Run: `bun run lint`
Expected: PASS (no errors).

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat(split-button): export SplitButton parts from package root"
```

---

## Task 4: Storybook stories

**Files:**
- Create: `src/components/split-button/split-button.stories.tsx`

- [ ] **Step 1: Write the stories**

Create `src/components/split-button/split-button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Copy, Save, Share2, Trash2 } from "lucide-react";
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  SplitButtonItem,
  SplitButtonSeparator,
} from "./split-button";

const meta = {
  title: "Components/SplitButton",
  component: SplitButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: { control: "select", options: ["sm", "default", "lg"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

function SaveSplit(
  args: React.ComponentProps<typeof SplitButton>
) {
  return (
    <SplitButton aria-label="Save options" {...args}>
      <SplitButtonAction onClick={() => {}}>
        <Save />
        Save
      </SplitButtonAction>
      <SplitButtonMenu>
        <SplitButtonItem onSelect={() => {}}>
          <Copy />
          Save as…
        </SplitButtonItem>
        <SplitButtonItem onSelect={() => {}}>
          <Share2 />
          Save & share
        </SplitButtonItem>
        <SplitButtonSeparator />
        <SplitButtonItem variant="destructive" onSelect={() => {}}>
          <Trash2 />
          Discard
        </SplitButtonItem>
      </SplitButtonMenu>
    </SplitButton>
  );
}

export const Default: Story = {
  render: (args) => <SaveSplit {...args} />,
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <SaveSplit variant="default" />
      <SaveSplit variant="secondary" />
      <SaveSplit variant="outline" />
      <SaveSplit variant="destructive" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <SaveSplit size="sm" />
      <SaveSplit size="default" />
      <SaveSplit size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => <SaveSplit {...args} disabled />,
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex flex-col items-center gap-3">
        <SplitButton aria-label="Save options">
          <SplitButtonAction onClick={() => {}}>Save</SplitButtonAction>
          <SplitButtonMenu open={open} onOpenChange={setOpen}>
            <SplitButtonItem onSelect={() => {}}>Save as…</SplitButtonItem>
            <SplitButtonItem onSelect={() => {}}>Save all</SplitButtonItem>
          </SplitButtonMenu>
        </SplitButton>
        <span className="text-muted-foreground text-sm">
          overlay open: {String(open)}
        </span>
      </div>
    );
  },
};
```

- [ ] **Step 2: Typecheck (stories are type-checked by tsc)**

Run: `bun run typecheck`
Expected: PASS (exit 0).

- [ ] **Step 3: Commit**

```bash
git add src/components/split-button/split-button.stories.tsx
git commit -m "docs(split-button): add Storybook stories"
```

---

## Task 5: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full unit test suite**

Run: `bun run test`
Expected: PASS — all suites green, including `split-button`.

- [ ] **Step 2: Typecheck + lint**

Run: `bun run typecheck && bun run lint`
Expected: both PASS.

- [ ] **Step 3: Build the library**

Run: `bun run build`
Expected: PASS — `tsup` emits `dist/` with the new exports in `dist/index.d.ts`.

- [ ] **Step 4: Confirm the component renders in Storybook**

Storybook is already running (`bun run storybook`, port 6006). Open
`http://localhost:6006/?path=/story/components-splitbutton--default` and confirm
the merged control renders, the chevron opens the overlay, and the divider/variants
look correct. (If Storybook is not running, start it with `bun run storybook`.)

---

## Self-Review

**Spec coverage:**
- Compositional API (root/action/menu/item/separator) → Task 2. ✓
- Context-shared variant/size/disabled → Task 2 (`SplitButtonContext`), tested in Task 1 (propagation, disabled). ✓
- Merged + divider visual → Task 2 (`rounded-r-none`, `-ml-px rounded-l-none`, `before:` divider). ✓
- Size→icon-size mapping → Task 2 (`TRIGGER_SIZE`). ✓
- Fixed default command, overlay forwards open/align/side → Task 2 (`SplitButtonMenu` props). ✓
- A11y: `role="group"` + `aria-label`, trigger `triggerLabel`, Radix wiring → Task 2, tested in Task 1. ✓
- All testing-section cases → Task 1 (10 tests). ✓
- Storybook stories (variants/sizes/destructive+separator/disabled/controlled) → Task 4. ✓
- Exports from `src/index.ts` → Task 3. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code. ✓

**Type consistency:** `SplitButtonVariant`/`SplitButtonSize`, `TRIGGER_SIZE`, `useSplitButtonContext`, and all prop type names are defined once in Task 2 and referenced consistently in the barrel (Task 3) and tests (Task 1). ✓
