# Button States Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `@qyubit/sedjiwa-ui`'s `Button` to full state coverage (active/pressed, loading, selected/toggled) with a documented `data-state` + ARIA vocabulary.

**Architecture:** Two new boolean props on `Button` — `loading` and `pressed` — drive `aria-busy`, `aria-pressed`, `aria-disabled`, and `data-state`. CVA gains rows for `active:`, `data-[state=on]:`, and `data-[state=loading]:`. A spinner (`Loader2` from `lucide-react`, already a peer dep) renders as the first child when `loading=true`; children stay mounted.

**Tech Stack:** React 19, TypeScript, Tailwind v4, `class-variance-authority`, `@radix-ui/react-slot`, `lucide-react`, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-05-07-button-states-design.md`

---

## File map

- **Modify** `src/components/button/button.variants.ts` — add active/pressed/loading rows per variant; add `disabled:cursor-not-allowed`; pin transition to `duration-150`.
- **Modify** `src/components/button/button.tsx` — add `loading?` and `pressed?` props; render spinner; emit `aria-busy` / `aria-pressed` / `aria-disabled` / `data-state`; ensure `asChild` works.
- **Modify** `src/components/button/button.test.tsx` — new tests for `pressed`, `loading`, precedence, `asChild` propagation, click suppression.
- **Modify** `README.md` — document new props + the shared interactive-state vocabulary table.
- **Modify** `playground/src/playground.tsx` — add `loading` and `pressed` examples to the Buttons tab.

No new files. No new dependencies.

---

## Task 1: Add `pressed` prop (TDD)

**Files:**
- Modify: `src/components/button/button.test.tsx`
- Modify: `src/components/button/button.tsx`
- Modify: `src/components/button/button.variants.ts`

- [ ] **Step 1: Write failing tests for `pressed`**

Append to `src/components/button/button.test.tsx` (inside the existing `describe("<Button />", ...)` block, before the closing `});`):

```tsx
  it("emits aria-pressed=true and data-state=on when pressed=true", () => {
    render(<Button pressed>Toggle</Button>);
    const btn = screen.getByRole("button", { name: "Toggle" });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-state", "on");
  });

  it("emits aria-pressed=false and data-state=off when pressed=false", () => {
    render(<Button pressed={false}>Toggle</Button>);
    const btn = screen.getByRole("button", { name: "Toggle" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("data-state", "off");
  });

  it("emits neither aria-pressed nor data-state when pressed is undefined", () => {
    render(<Button>Toggle</Button>);
    const btn = screen.getByRole("button", { name: "Toggle" });
    expect(btn).not.toHaveAttribute("aria-pressed");
    expect(btn).not.toHaveAttribute("data-state");
  });
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `bun run test -- button.test`
Expected: the three new tests FAIL (no `aria-pressed` / `data-state` rendered yet). Existing tests still pass.

- [ ] **Step 3: Implement `pressed` in `button.tsx`**

Replace the entire contents of `src/components/button/button.tsx` with:

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { buttonVariants, type ButtonVariants } from "./button.variants";

export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    asChild?: boolean;
    pressed?: boolean;
  };

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  pressed,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  const stateAttrs: Record<string, string> = {};
  if (pressed !== undefined) {
    stateAttrs["aria-pressed"] = pressed ? "true" : "false";
    stateAttrs["data-state"] = pressed ? "on" : "off";
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...stateAttrs}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Add `data-[state=on]` visual rows to CVA**

Replace the entire contents of `src/components/button/button.variants.ts` with:

```ts
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98] data-[state=on]:bg-primary/85",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 active:scale-[0.98] data-[state=on]:bg-destructive/85 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent active:border-accent-foreground/20 active:scale-[0.98] data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 active:scale-[0.98] data-[state=on]:bg-secondary/70",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground active:scale-[0.98] data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline active:translate-y-[1px] data-[state=on]:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun run test -- button.test`
Expected: all tests PASS, including the three new `pressed` tests.

- [ ] **Step 6: Run typecheck**

Run: `bun run typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/button/button.tsx src/components/button/button.variants.ts src/components/button/button.test.tsx
git commit -m "feat(button): add pressed prop with aria-pressed and data-state"
```

---

## Task 2: Add `loading` prop (TDD)

**Files:**
- Modify: `src/components/button/button.test.tsx`
- Modify: `src/components/button/button.tsx`
- Modify: `src/components/button/button.variants.ts`

- [ ] **Step 1: Write failing tests for `loading`**

Append to `src/components/button/button.test.tsx` (inside the same `describe` block, before the closing `});`):

```tsx
  it("emits aria-busy, aria-disabled, and data-state=loading when loading=true", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button", { name: /save/i });
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).toHaveAttribute("data-state", "loading");
  });

  it("does not set the native disabled attribute when loading=true", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button", { name: /save/i });
    expect(btn).not.toBeDisabled();
  });

  it("renders a spinner with aria-hidden when loading=true", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button", { name: /save/i });
    const spinner = btn.querySelector('[data-slot="loader"]');
    expect(spinner).not.toBeNull();
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(spinner).toHaveClass("animate-spin");
  });

  it("keeps children rendered when loading=true", () => {
    render(<Button loading>Save changes</Button>);
    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toHaveTextContent("Save changes");
  });

  it("does not render a spinner when loading is undefined or false", () => {
    const { rerender } = render(<Button>Save</Button>);
    expect(
      screen.getByRole("button").querySelector('[data-slot="loader"]')
    ).toBeNull();
    rerender(<Button loading={false}>Save</Button>);
    expect(
      screen.getByRole("button").querySelector('[data-slot="loader"]')
    ).toBeNull();
  });

  it("suppresses onClick when loading=true", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading wins over pressed: data-state is loading, not on", () => {
    render(
      <Button loading pressed>
        Toggle
      </Button>
    );
    const btn = screen.getByRole("button", { name: /toggle/i });
    expect(btn).toHaveAttribute("data-state", "loading");
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("propagates aria-busy to slotted child when asChild + loading", () => {
    render(
      <Button asChild loading>
        <a href="/save">Save</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: /save/i });
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("data-state", "loading");
  });
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `bun run test -- button.test`
Expected: the new `loading` tests FAIL (prop not implemented). Existing tests still pass.

- [ ] **Step 3: Implement `loading` in `button.tsx`**

Replace the entire contents of `src/components/button/button.tsx` with:

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { buttonVariants, type ButtonVariants } from "./button.variants";

export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    asChild?: boolean;
    loading?: boolean;
    pressed?: boolean;
  };

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  pressed,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  const stateAttrs: Record<string, string> = {};
  if (loading) {
    stateAttrs["aria-busy"] = "true";
    stateAttrs["aria-disabled"] = "true";
    stateAttrs["data-state"] = "loading";
  } else if (pressed !== undefined) {
    stateAttrs["data-state"] = pressed ? "on" : "off";
  }
  if (pressed !== undefined) {
    stateAttrs["aria-pressed"] = pressed ? "true" : "false";
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...stateAttrs}
      {...props}
    >
      {loading ? (
        <Loader2
          data-slot="loader"
          aria-hidden="true"
          className="animate-spin size-4 shrink-0"
        />
      ) : null}
      {children}
    </Comp>
  );
}
```

Notes for the implementer:
- `onClick` is destructured and wrapped so we can suppress it when `loading` — this is what the test asserts. We do NOT use the native `disabled` attribute (focus must remain).
- `Slot` from Radix merges children correctly: when `asChild` is set and we pass spinner + children, Slot expects a single React element. To handle this, see Step 4 below — we render the spinner *inside* the slotted child via `Slot.Children`-style wrapping. Test "asChild + loading" asserts `aria-busy` reaches the link, not that the spinner appears inside the anchor.
- The `...stateAttrs` spread comes BEFORE `...props` so consumer-supplied props win for the `asChild` case where they may already set `data-state` (e.g. Radix Tabs). For our own state work this ordering is fine.

- [ ] **Step 4: Adjust spinner rendering for `asChild` compatibility**

The naive implementation above passes multiple children to `Slot`, which Radix `Slot` does not support — it requires a single React element. Fix by only injecting the spinner in the non-`asChild` path. The `asChild` consumer is responsible for their own spinner if they want one inside the slotted child; what we guarantee is that `aria-busy` / `data-state="loading"` reach the slotted element.

Replace the JSX return in `button.tsx` with:

```tsx
  if (asChild) {
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
        {...stateAttrs}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...stateAttrs}
      {...(props as React.ComponentProps<"button">)}
    >
      {loading ? (
        <Loader2
          data-slot="loader"
          aria-hidden="true"
          className="animate-spin size-4 shrink-0"
        />
      ) : null}
      {children}
    </button>
  );
```

The full file after this step looks like:

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { buttonVariants, type ButtonVariants } from "./button.variants";

export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    asChild?: boolean;
    loading?: boolean;
    pressed?: boolean;
  };

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  pressed,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const stateAttrs: Record<string, string> = {};
  if (loading) {
    stateAttrs["aria-busy"] = "true";
    stateAttrs["aria-disabled"] = "true";
    stateAttrs["data-state"] = "loading";
  } else if (pressed !== undefined) {
    stateAttrs["data-state"] = pressed ? "on" : "off";
  }
  if (pressed !== undefined) {
    stateAttrs["aria-pressed"] = pressed ? "true" : "false";
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  if (asChild) {
    return (
      <Slot
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
        {...stateAttrs}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...stateAttrs}
      {...(props as React.ComponentProps<"button">)}
    >
      {loading ? (
        <Loader2
          data-slot="loader"
          aria-hidden="true"
          className="animate-spin size-4 shrink-0"
        />
      ) : null}
      {children}
    </button>
  );
}
```

- [ ] **Step 5: Add `data-[state=loading]` visual row to CVA base**

In `src/components/button/button.variants.ts`, replace the base classes string (the first argument to `cva`) with:

```
"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=loading]:pointer-events-none data-[state=loading]:opacity-90 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
```

The full file after this step:

```ts
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=loading]:pointer-events-none data-[state=loading]:opacity-90 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98] data-[state=on]:bg-primary/85",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 active:scale-[0.98] data-[state=on]:bg-destructive/85 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent active:border-accent-foreground/20 active:scale-[0.98] data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 active:scale-[0.98] data-[state=on]:bg-secondary/70",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground active:scale-[0.98] data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline active:translate-y-[1px] data-[state=on]:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `bun run test -- button.test`
Expected: ALL tests PASS — the original 9 tests plus the 3 `pressed` tests from Task 1 plus the 8 new `loading` tests.

- [ ] **Step 7: Run typecheck and lint**

Run: `bun run typecheck && bun run lint`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/button/button.tsx src/components/button/button.variants.ts src/components/button/button.test.tsx
git commit -m "feat(button): add loading prop with spinner and aria-busy"
```

---

## Task 3: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a Button section to README under "Components"**

Open `README.md`. Find the line `### Atomic primitives (v0.1.0)` and the "Display" bullet that lists `Button`. After the existing `### Atomic primitives (v0.1.0)` section block (i.e., immediately before `### Composed primitives (v0.2.0)`), insert a new subsection:

```markdown
#### `<Button />`

Standard variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and sizes (`sm`, `default`, `lg`, `icon`, `icon-sm`, `icon-lg`), plus two interactive-state props:

- `loading?: boolean` — renders a spinner before the children, sets `aria-busy="true"`, `aria-disabled="true"`, `data-state="loading"`, and suppresses `onClick`. Children stay mounted (no width jitter). The native `disabled` attribute is **not** set, so focus is preserved for screen readers.
- `pressed?: boolean` — controlled toggle state. Sets `aria-pressed` and `data-state="on" | "off"`. When `loading` is also true, `loading` wins visually (`data-state="loading"`).

```tsx
import { Button } from "@qyubit/sedjiwa-ui";

<Button loading>Saving…</Button>
<Button pressed={isOn} onClick={() => setIsOn((v) => !v)}>Toggle</Button>
```

##### Interactive-state vocabulary

All stateful interactive components in this library expose state through a shared contract:

| Concept | DOM signal | ARIA |
|---|---|---|
| toggled on | `data-state="on"` | `aria-pressed="true"` (toggle) or `aria-selected="true"` (option) |
| busy / processing | `data-state="loading"` | `aria-busy="true"` |
| open / expanded | `data-state="open"` | `aria-expanded="true"` (Radix-driven) |
| disabled by app logic | `data-disabled="true"` | `aria-disabled="true"` |

This is a documentation contract, not a shared abstraction — Tabs, Dropdown, and Dialog already conform via Radix. Future components (Toggle, Switch) should adopt the same vocabulary.
```

- [ ] **Step 2: Verify README renders correctly**

Run: `cat README.md | head -80`
Visually confirm the new section is present between `### Atomic primitives (v0.1.0)` and `### Composed primitives (v0.2.0)`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(button): document loading/pressed props and state vocabulary"
```

---

## Task 4: Add playground showcase

**Files:**
- Modify: `playground/src/playground.tsx`

- [ ] **Step 1: Read current playground Buttons section**

Run: `sed -n '49,57p' playground/src/playground.tsx`
Expected output:
```
        <TabsContent value="buttons" className="space-y-6 pt-4">
          <section>
            <h2 className="text-lg font-medium mb-3">Button variants</h2>
            <div className="flex flex-wrap gap-3">
              {buttonVariants.map((v) => (
                <Button key={v} variant={v}>{v}</Button>
              ))}
            </div>
          </section>
```

Note the existing pattern: each section uses `<section>` with an `<h2 className="text-lg font-medium mb-3">` heading and a flex-wrap container.

- [ ] **Step 2: Add `useState` import if not already present**

Open `playground/src/playground.tsx`. At the top of the file, ensure React's `useState` is imported. Run: `head -5 playground/src/playground.tsx` to check. If `useState` is not imported, add it to the existing React import at the top of the file (or add `import { useState } from "react";` if there's no React import).

- [ ] **Step 3: Insert the new Button states section**

In `playground/src/playground.tsx`, find the closing `</section>` of the existing "Button variants" section (line ~57) and insert the following two new `<section>` blocks immediately after it (before the next existing section, "Badge variants"):

```tsx
          <section>
            <h2 className="text-lg font-medium mb-3">Button — loading state</h2>
            <div className="flex flex-wrap gap-3">
              <Button loading>Saving…</Button>
              <Button variant="destructive" loading>Deleting…</Button>
              <Button variant="outline" loading>Loading</Button>
              <Button variant="secondary" loading>Loading</Button>
              <Button variant="ghost" loading>Loading</Button>
            </div>
          </section>
          <section>
            <h2 className="text-lg font-medium mb-3">Button — pressed (toggle) state</h2>
            <ToggleButtonRow />
          </section>
```

- [ ] **Step 4: Add the `ToggleButtonRow` helper component**

At the bottom of `playground/src/playground.tsx`, before the file's final default export (or after the main `Playground` function — match whichever pattern the file already uses), add:

```tsx
function ToggleButtonRow() {
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const variants = ["default", "outline", "secondary", "ghost", "link"] as const;
  return (
    <div className="flex flex-wrap gap-3">
      {variants.map((v) => (
        <Button
          key={v}
          variant={v}
          pressed={!!pressed[v]}
          onClick={() => setPressed((p) => ({ ...p, [v]: !p[v] }))}
        >
          {v} {pressed[v] ? "(on)" : "(off)"}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Start the dev server and verify visually**

Run: `bun run dev` (in a separate terminal)
Open the playground in a browser, navigate to the Buttons tab, and verify:
- "Button — loading state" row shows a spinner inside each variant; clicking does nothing.
- "Button — pressed (toggle) state" row toggles the visual on click; the toggled-on visual is clearly distinguishable from default and from hover.
- Press-and-hold on any variant briefly applies a subtle scale-down; `link` translates 1px down instead.
- Disabled buttons (if any in the showcase) show `cursor-not-allowed`.

If the visual is correct, stop the dev server (`Ctrl-C`).

- [ ] **Step 6: Commit**

```bash
git add playground/src/playground.tsx
git commit -m "chore(playground): showcase button loading and pressed states"
```

---

## Task 5: Final verification

- [ ] **Step 1: Run the full test suite**

Run: `bun run test`
Expected: all tests PASS, including the 11 new Button tests (3 pressed + 8 loading).

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: no errors.

- [ ] **Step 3: Run lint**

Run: `bun run lint`
Expected: no errors.

- [ ] **Step 4: Build the library**

Run: `bun run build`
Expected: `dist/` is produced without errors. `dist/index.js` and `dist/index.d.ts` reflect the new `loading` and `pressed` props on `ButtonProps`.

- [ ] **Step 5: Confirm public types**

Run: `grep -A 6 "ButtonProps" dist/index.d.ts | head -15`
Expected: `loading?: boolean` and `pressed?: boolean` appear in the exported `ButtonProps`.

- [ ] **Step 6: Final summary commit (if anything is uncommitted)**

Run: `git status`
If clean, you are done. If anything is uncommitted from cleanup, commit it with a focused message.

---

## Self-review notes (already applied)

- Spec coverage: §3 state matrix → Tasks 1 & 2 CVA changes. §4 API → Tasks 1 & 2 component code. §5 vocabulary → Task 3 README. §6 a11y → Tasks 1 & 2 (aria-busy, aria-pressed, aria-disabled, focus-visible kept). §7 testing → all 11 listed cases included.
- Type consistency: `pressed` and `loading` typed identically across `ButtonProps`, destructure, and stateAttrs in both Task 1 and Task 2 implementations.
- Placeholders: none. Every step shows the code or command in full.
- The Task 2 final state replaces the Task 1 component file rather than diffing — this is intentional so a worker reading Task 2 in isolation has the complete file.
