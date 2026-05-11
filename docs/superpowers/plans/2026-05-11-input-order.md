# Input Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `InputOrderProvider` + `useInputOrder` — a hook + provider that lets consumers declare an explicit Tab/Shift+Tab/Enter sequence over any focusable controls, independent of DOM order.

**Architecture:** A React context holds a ref-based registry `Map<number, HTMLElement>`. The hook registers a field via a ref callback and returns a stable `{ ref, onKeyDown }` pair. On Tab/Shift+Tab/Enter, the handler asks the provider to step forward or backward through the sorted registry, skipping disabled fields. End-of-sequence behavior is configurable per provider (`submit` | `wrap` | `none`).

**Tech Stack:** React 19, TypeScript, Vitest (jsdom) + Testing Library + `@testing-library/user-event`, Storybook 10 + Playwright/chromium for play-tests.

**Spec:** `docs/superpowers/specs/2026-05-11-input-order-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `src/hooks/use-input-order.tsx` (new) | Public types, `InputOrderContext`, `InputOrderProvider`, `useInputOrder`. All co-located (matches `input.tsx` / `input.context.ts` co-location pattern). |
| `src/hooks/use-input-order.test.tsx` (new) | Vitest unit tests, jsdom env. |
| `src/hooks/use-input-order.stories.tsx` (new) | Storybook demos + play-tests for Default, WithSelect, WithDisabled, Wrap, EnterOverride. |
| `src/index.ts` (modify) | Add public exports. |

ESLint & TS are project-wide and already wired; no config changes.

---

## Task 1: Module skeleton + "must be used inside provider" guard

**Files:**
- Create: `src/hooks/use-input-order.tsx`
- Create: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/use-input-order.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInputOrder } from "./use-input-order";

describe("useInputOrder", () => {
  it("throws when used outside <InputOrderProvider>", () => {
    expect(() => renderHook(() => useInputOrder(1))).toThrow(
      /useInputOrder must be used inside <InputOrderProvider>/,
    );
  });
});
```

- [ ] **Step 2: Run test — expect failure (module not found)**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: FAIL — "Failed to resolve import './use-input-order'"

- [ ] **Step 3: Write the minimal module**

Create `src/hooks/use-input-order.tsx`:

```tsx
import * as React from "react";

type Direction = "next" | "prev";

type InputOrderContextValue = {
  register: (order: number, el: HTMLElement) => void;
  unregister: (order: number, el: HTMLElement) => void;
  step: (direction: Direction, fromOrder: number, event: React.KeyboardEvent) => void;
};

const InputOrderContext = React.createContext<InputOrderContextValue | null>(null);

export type InputOrderProviderProps = {
  onLastField?: "submit" | "wrap" | "none";
  onSubmit?: (event: React.SyntheticEvent) => void;
  children: React.ReactNode;
};

export function InputOrderProvider(_props: InputOrderProviderProps): React.ReactElement {
  throw new Error("InputOrderProvider not implemented yet");
}

export type UseInputOrderOptions = {
  onEnter?: (event: React.KeyboardEvent) => void;
};

export type UseInputOrderReturn = {
  ref: React.RefCallback<HTMLElement>;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function useInputOrder(
  _order: number,
  _options?: UseInputOrderOptions,
): UseInputOrderReturn {
  const ctx = React.useContext(InputOrderContext);
  if (!ctx) {
    throw new Error("useInputOrder must be used inside <InputOrderProvider>");
  }
  return {
    ref: () => {},
    onKeyDown: () => {},
  };
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-input-order.tsx src/hooks/use-input-order.test.tsx
git commit -m "feat(hooks): scaffold useInputOrder + InputOrderProvider"
```

---

## Task 2: Provider + Tab forward stepping (two fields)

**Files:**
- Modify: `src/hooks/use-input-order.tsx`
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing test for Tab-forward**

Append to `src/hooks/use-input-order.test.tsx` (after the existing `describe` block close, inside the same module — or wrap everything in one outer describe):

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputOrderProvider, useInputOrder } from "./use-input-order";

function FieldFixture({ order, label }: { order: number; label: string }) {
  const { ref, onKeyDown } = useInputOrder(order);
  return <input ref={ref} onKeyDown={onKeyDown} aria-label={label} />;
}

describe("InputOrderProvider — Tab forward", () => {
  it("Tab on first field focuses the second", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );

    const a = screen.getByLabelText("a");
    const b = screen.getByLabelText("b");
    a.focus();
    expect(a).toHaveFocus();

    await user.keyboard("{Tab}");
    expect(b).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: FAIL — `InputOrderProvider not implemented yet` (the provider throws on render).

- [ ] **Step 3: Implement provider + Tab-forward stepping**

Replace `src/hooks/use-input-order.tsx` with:

```tsx
import * as React from "react";

type Direction = "next" | "prev";

type Registry = Map<number, HTMLElement>;

type InputOrderContextValue = {
  register: (order: number, el: HTMLElement) => void;
  unregister: (order: number, el: HTMLElement) => void;
  step: (direction: Direction, fromOrder: number, event: React.KeyboardEvent) => void;
};

const InputOrderContext = React.createContext<InputOrderContextValue | null>(null);

export type InputOrderProviderProps = {
  onLastField?: "submit" | "wrap" | "none";
  onSubmit?: (event: React.SyntheticEvent) => void;
  children: React.ReactNode;
};

export function InputOrderProvider({
  onLastField = "submit",
  onSubmit,
  children,
}: InputOrderProviderProps) {
  const registryRef = React.useRef<Registry>(new Map());
  const onLastFieldRef = React.useRef(onLastField);
  const onSubmitRef = React.useRef(onSubmit);
  React.useEffect(() => {
    onLastFieldRef.current = onLastField;
    onSubmitRef.current = onSubmit;
  });

  const value = React.useMemo<InputOrderContextValue>(
    () => ({
      register(order, el) {
        registryRef.current.set(order, el);
      },
      unregister(order, el) {
        const reg = registryRef.current;
        if (reg.get(order) === el) reg.delete(order);
      },
      step(direction, fromOrder, event) {
        const sorted = [...registryRef.current.entries()].sort(
          ([a], [b]) => a - b,
        );
        const idx = sorted.findIndex(([o]) => o === fromOrder);
        if (idx === -1) return;
        const delta = direction === "next" ? 1 : -1;
        let cursor = idx + delta;
        while (cursor >= 0 && cursor < sorted.length) {
          const [, el] = sorted[cursor];
          event.preventDefault();
          el.focus();
          return;
        }
        // out-of-range handled in later tasks
      },
    }),
    [],
  );

  return (
    <InputOrderContext.Provider value={value}>{children}</InputOrderContext.Provider>
  );
}

export type UseInputOrderOptions = {
  onEnter?: (event: React.KeyboardEvent) => void;
};

export type UseInputOrderReturn = {
  ref: React.RefCallback<HTMLElement>;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function useInputOrder(
  order: number,
  _options?: UseInputOrderOptions,
): UseInputOrderReturn {
  const ctx = React.useContext(InputOrderContext);
  if (!ctx) {
    throw new Error("useInputOrder must be used inside <InputOrderProvider>");
  }

  const elRef = React.useRef<HTMLElement | null>(null);

  const ref = React.useCallback<React.RefCallback<HTMLElement>>(
    (el) => {
      if (el) {
        elRef.current = el;
        ctx.register(order, el);
      } else if (elRef.current) {
        ctx.unregister(order, elRef.current);
        elRef.current = null;
      }
    },
    [ctx, order],
  );

  const onKeyDown = React.useCallback<(e: React.KeyboardEvent) => void>(
    (event) => {
      if (event.defaultPrevented) return;
      if (event.key === "Tab" && !event.shiftKey) {
        ctx.step("next", order, event);
      }
    },
    [ctx, order],
  );

  return { ref, onKeyDown };
}
```

- [ ] **Step 4: Run — expect pass**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-input-order.tsx src/hooks/use-input-order.test.tsx
git commit -m "feat(hooks): Tab forward stepping in InputOrderProvider"
```

---

## Task 3: Shift+Tab backward, sorted order, holes

**Files:**
- Modify: `src/hooks/use-input-order.tsx`
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing tests**

Append inside the test file:

```tsx
describe("InputOrderProvider — Shift+Tab and sort order", () => {
  it("Shift+Tab on second field focuses the first", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("b").focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText("a")).toHaveFocus();
  });

  it("steps in sorted order even with gaps and DOM mis-order", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="none">
        {/* DOM order intentionally != logical order */}
        <FieldFixture order={10} label="last" />
        <FieldFixture order={1} label="first" />
        <FieldFixture order={5} label="middle" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("first").focus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("middle")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("last")).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: FAIL on "Shift+Tab" (handler ignores it) and likely on the sort test if first→middle works only by accident.

- [ ] **Step 3: Handle Shift+Tab in the hook's onKeyDown**

In `src/hooks/use-input-order.tsx`, replace the `onKeyDown` body:

```tsx
const onKeyDown = React.useCallback<(e: React.KeyboardEvent) => void>(
  (event) => {
    if (event.defaultPrevented) return;
    if (event.key === "Tab") {
      ctx.step(event.shiftKey ? "prev" : "next", order, event);
    }
  },
  [ctx, order],
);
```

- [ ] **Step 4: Run — expect pass**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-input-order.tsx src/hooks/use-input-order.test.tsx
git commit -m "feat(hooks): Shift+Tab backward stepping; sort by order"
```

---

## Task 4: Duplicate-order dev warning

**Files:**
- Modify: `src/hooks/use-input-order.tsx`
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing test**

Append inside the test file:

```tsx
describe("InputOrderProvider — duplicate orders", () => {
  it("warns once in dev when two fields share the same order", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={1} label="b" />
      </InputOrderProvider>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toMatch(/duplicate order/);
    warn.mockRestore();
  });
});
```

Make sure `vi` is imported at the top of the test file (`import { describe, expect, it, vi } from "vitest";`).

- [ ] **Step 2: Run — expect failure**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: FAIL — `expected "spy" to be called 1 times, but got 0`.

- [ ] **Step 3: Implement duplicate detection in `register`**

In `src/hooks/use-input-order.tsx`, replace the `InputOrderProvider` body's registry setup and `value` to include duplicate tracking:

```tsx
const registryRef = React.useRef<Registry>(new Map());
const seenDuplicates = React.useRef<Set<number>>(new Set());
const onLastFieldRef = React.useRef(onLastField);
const onSubmitRef = React.useRef(onSubmit);
React.useEffect(() => {
  onLastFieldRef.current = onLastField;
  onSubmitRef.current = onSubmit;
});

const value = React.useMemo<InputOrderContextValue>(
  () => ({
    register(order, el) {
      const reg = registryRef.current;
      const existing = reg.get(order);
      if (existing && existing !== el) {
        if (
          process.env.NODE_ENV !== "production" &&
          !seenDuplicates.current.has(order)
        ) {
          seenDuplicates.current.add(order);
          console.warn("[useInputOrder] duplicate order %d", order);
        }
      }
      reg.set(order, el);
    },
    unregister(order, el) {
      const reg = registryRef.current;
      if (reg.get(order) === el) reg.delete(order);
    },
    step(direction, fromOrder, event) {
      const sorted = [...registryRef.current.entries()].sort(
        ([a], [b]) => a - b,
      );
      const idx = sorted.findIndex(([o]) => o === fromOrder);
      if (idx === -1) return;
      const delta = direction === "next" ? 1 : -1;
      let cursor = idx + delta;
      while (cursor >= 0 && cursor < sorted.length) {
        const [, el] = sorted[cursor];
        event.preventDefault();
        el.focus();
        return;
      }
    },
  }),
  [],
);
```

- [ ] **Step 4: Run — expect pass**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-input-order.tsx src/hooks/use-input-order.test.tsx
git commit -m "feat(hooks): warn once on duplicate order registration"
```

---

## Task 5: Skip disabled / aria-disabled / tabIndex=-1

**Files:**
- Modify: `src/hooks/use-input-order.tsx`
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing tests**

Append:

```tsx
describe("InputOrderProvider — skipping", () => {
  it("skips disabled inputs", async () => {
    const user = userEvent.setup();
    function Disabled({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return <input ref={ref} onKeyDown={onKeyDown} aria-label={label} disabled />;
    }
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <Disabled order={2} label="b" />
        <FieldFixture order={3} label="c" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("c")).toHaveFocus();
  });

  it("skips elements with aria-disabled=true", async () => {
    const user = userEvent.setup();
    function AriaDisabled({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <input
          ref={ref}
          onKeyDown={onKeyDown}
          aria-label={label}
          aria-disabled="true"
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <AriaDisabled order={2} label="b" />
        <FieldFixture order={3} label="c" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("c")).toHaveFocus();
  });

  it("skips elements with tabIndex=-1", async () => {
    const user = userEvent.setup();
    function Untabbable({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <input ref={ref} onKeyDown={onKeyDown} aria-label={label} tabIndex={-1} />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <Untabbable order={2} label="b" />
        <FieldFixture order={3} label="c" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("c")).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: FAIL — disabled/aria-disabled/tabIndex=-1 fields are being focused.

- [ ] **Step 3: Add skip predicate**

In `src/hooks/use-input-order.tsx`, add a module-level helper above the provider:

```tsx
function isSkippable(el: HTMLElement): boolean {
  if ((el as HTMLInputElement).disabled) return true;
  if (el.getAttribute("aria-disabled") === "true") return true;
  if (el.tabIndex === -1) return true;
  return false;
}
```

Then update the `step` loop body to consult it:

```tsx
step(direction, fromOrder, event) {
  const sorted = [...registryRef.current.entries()].sort(([a], [b]) => a - b);
  const idx = sorted.findIndex(([o]) => o === fromOrder);
  if (idx === -1) return;
  const delta = direction === "next" ? 1 : -1;
  let cursor = idx + delta;
  while (cursor >= 0 && cursor < sorted.length) {
    const [, el] = sorted[cursor];
    if (!isSkippable(el)) {
      event.preventDefault();
      el.focus();
      return;
    }
    cursor += delta;
  }
},
```

- [ ] **Step 4: Run — expect pass**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-input-order.tsx src/hooks/use-input-order.test.tsx
git commit -m "feat(hooks): skip disabled/aria-disabled/tabindex=-1 when stepping"
```

---

## Task 6: Enter advances on plain inputs

**Files:**
- Modify: `src/hooks/use-input-order.tsx`
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing test**

Append:

```tsx
describe("InputOrderProvider — Enter to advance", () => {
  it("Enter on a plain input focuses the next field", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Enter}");
    expect(screen.getByLabelText("b")).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: FAIL — Enter is not handled.

- [ ] **Step 3: Add Enter handling to the hook**

Replace `onKeyDown` in `useInputOrder`:

```tsx
const onKeyDown = React.useCallback<(e: React.KeyboardEvent) => void>(
  (event) => {
    if (event.defaultPrevented) return;
    if (event.key === "Tab") {
      ctx.step(event.shiftKey ? "prev" : "next", order, event);
      return;
    }
    if (event.key === "Enter") {
      ctx.step("next", order, event);
    }
  },
  [ctx, order],
);
```

- [ ] **Step 4: Run — expect pass**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-input-order.tsx src/hooks/use-input-order.test.tsx
git commit -m "feat(hooks): Enter advances to next field"
```

---

## Task 7: Enter skip rules (textarea, button, aria-expanded, data attr)

**Files:**
- Modify: `src/hooks/use-input-order.tsx`
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing tests**

Append:

```tsx
describe("InputOrderProvider — Enter skip rules", () => {
  it("does not intercept Enter on a textarea (newlines must work)", async () => {
    const user = userEvent.setup();
    function TextareaField({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          onKeyDown={onKeyDown}
          aria-label={label}
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <TextareaField order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Enter}");
    expect(a).toHaveFocus();
  });

  it("does not intercept Enter on a button", async () => {
    const user = userEvent.setup();
    function ButtonField({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <button
          type="button"
          ref={ref as React.Ref<HTMLButtonElement>}
          onKeyDown={onKeyDown}
          aria-label={label}
        >
          go
        </button>
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <ButtonField order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Enter}");
    expect(a).toHaveFocus();
  });

  it("does not intercept Enter when target has aria-expanded=true", async () => {
    const user = userEvent.setup();
    function Combo({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <input
          ref={ref}
          onKeyDown={onKeyDown}
          aria-label={label}
          aria-expanded="true"
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <Combo order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Enter}");
    expect(a).toHaveFocus();
  });

  it("does not intercept Enter when target has data-input-order-enter=ignore", async () => {
    const user = userEvent.setup();
    function Escape({ order, label }: { order: number; label: string }) {
      const { ref, onKeyDown } = useInputOrder(order);
      return (
        <input
          ref={ref}
          onKeyDown={onKeyDown}
          aria-label={label}
          data-input-order-enter="ignore"
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <Escape order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Enter}");
    expect(a).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: FAIL on all four — Enter advances when it shouldn't.

- [ ] **Step 3: Add `shouldSkipEnter` and use it in the hook**

In `src/hooks/use-input-order.tsx`, add helper:

```tsx
function shouldSkipEnter(event: React.KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  if (target.tagName === "TEXTAREA") return true;
  if (target.tagName === "BUTTON") return true;
  if (target.getAttribute("aria-expanded") === "true") return true;
  if (target.getAttribute("data-input-order-enter") === "ignore") return true;
  return false;
}
```

Update the Enter branch in `onKeyDown`:

```tsx
if (event.key === "Enter") {
  if (shouldSkipEnter(event)) return;
  ctx.step("next", order, event);
}
```

- [ ] **Step 4: Run — expect pass**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (13 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-input-order.tsx src/hooks/use-input-order.test.tsx
git commit -m "feat(hooks): Enter skip rules (textarea, button, aria-expanded, data attr)"
```

---

## Task 8: Per-field `options.onEnter` override

**Files:**
- Modify: `src/hooks/use-input-order.tsx`
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing test**

Append:

```tsx
describe("useInputOrder — options.onEnter", () => {
  it("calls onEnter and prevents default instead of advancing", async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    function CustomEnter() {
      const { ref, onKeyDown } = useInputOrder(1, { onEnter });
      return <input ref={ref} onKeyDown={onKeyDown} aria-label="a" />;
    }
    render(
      <InputOrderProvider onLastField="none">
        <CustomEnter />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Enter}");
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(a).toHaveFocus(); // did not advance
  });

  it("still uses the latest onEnter closure after re-render", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    function Harness({ tag }: { tag: string }) {
      const onEnter = () => calls.push(tag);
      const { ref, onKeyDown } = useInputOrder(1, { onEnter });
      return <input ref={ref} onKeyDown={onKeyDown} aria-label="a" />;
    }
    const { rerender } = render(
      <InputOrderProvider onLastField="none">
        <Harness tag="first" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Enter}");
    rerender(
      <InputOrderProvider onLastField="none">
        <Harness tag="second" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Enter}");
    expect(calls).toEqual(["first", "second"]);
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: FAIL — `onEnter` is never called.

- [ ] **Step 3: Wire options ref + dispatch in hook**

In `src/hooks/use-input-order.tsx`, replace `useInputOrder` body:

```tsx
export function useInputOrder(
  order: number,
  options?: UseInputOrderOptions,
): UseInputOrderReturn {
  const ctx = React.useContext(InputOrderContext);
  if (!ctx) {
    throw new Error("useInputOrder must be used inside <InputOrderProvider>");
  }

  const elRef = React.useRef<HTMLElement | null>(null);
  const optionsRef = React.useRef(options);
  React.useEffect(() => {
    optionsRef.current = options;
  });

  const ref = React.useCallback<React.RefCallback<HTMLElement>>(
    (el) => {
      if (el) {
        elRef.current = el;
        ctx.register(order, el);
      } else if (elRef.current) {
        ctx.unregister(order, elRef.current);
        elRef.current = null;
      }
    },
    [ctx, order],
  );

  const onKeyDown = React.useCallback<(e: React.KeyboardEvent) => void>(
    (event) => {
      if (event.defaultPrevented) return;
      if (event.key === "Tab") {
        ctx.step(event.shiftKey ? "prev" : "next", order, event);
        return;
      }
      if (event.key === "Enter") {
        if (shouldSkipEnter(event)) return;
        const onEnter = optionsRef.current?.onEnter;
        if (onEnter) {
          event.preventDefault();
          onEnter(event);
          return;
        }
        ctx.step("next", order, event);
      }
    },
    [ctx, order],
  );

  return { ref, onKeyDown };
}
```

- [ ] **Step 4: Run — expect pass**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (15 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-input-order.tsx src/hooks/use-input-order.test.tsx
git commit -m "feat(hooks): per-field options.onEnter override"
```

---

## Task 9: End behavior — `onLastField="submit"`

**Files:**
- Modify: `src/hooks/use-input-order.tsx`
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing tests**

Append:

```tsx
describe("InputOrderProvider — onLastField=submit", () => {
  it("calls form.requestSubmit() when Tab past the last field inside a <form>", async () => {
    const user = userEvent.setup();
    const requestSubmit = vi.fn();
    function Harness() {
      return (
        <form
          aria-label="f"
          onSubmit={(e) => e.preventDefault()}
          ref={(el) => {
            if (el) el.requestSubmit = requestSubmit;
          }}
        >
          <InputOrderProvider onLastField="submit">
            <FieldFixture order={1} label="a" />
            <FieldFixture order={2} label="b" />
          </InputOrderProvider>
        </form>
      );
    }
    render(<Harness />);
    screen.getByLabelText("b").focus();
    await user.keyboard("{Tab}");
    expect(requestSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls provider.onSubmit when no <form> ancestor exists", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <InputOrderProvider onLastField="submit" onSubmit={onSubmit}>
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("b").focus();
    await user.keyboard("{Tab}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not submit when stepping backward past the first field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <InputOrderProvider onLastField="submit" onSubmit={onSubmit}>
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: FAIL — end behavior is a no-op currently.

- [ ] **Step 3: Implement end-behavior dispatch**

In `src/hooks/use-input-order.tsx`, add a module-level helper:

```tsx
function applyEndBehavior(
  direction: Direction,
  event: React.KeyboardEvent,
  mode: "submit" | "wrap" | "none",
  onSubmit: ((event: React.SyntheticEvent) => void) | undefined,
  sorted: ReadonlyArray<[number, HTMLElement]>,
) {
  if (mode === "none") return; // do not preventDefault
  if (mode === "wrap") {
    if (sorted.length === 0) return;
    event.preventDefault();
    const target = direction === "next" ? sorted[0]![1] : sorted[sorted.length - 1]![1];
    target.focus();
    return;
  }
  // mode === "submit"
  if (direction === "prev") return; // don't submit backward
  event.preventDefault();
  const active = event.currentTarget as HTMLElement;
  const form = active.closest("form");
  if (form) {
    form.requestSubmit();
  } else if (onSubmit) {
    onSubmit(event);
  }
}
```

Then update `step` to call it when the cursor runs off the end:

```tsx
step(direction, fromOrder, event) {
  const sorted = [...registryRef.current.entries()].sort(([a], [b]) => a - b);
  const idx = sorted.findIndex(([o]) => o === fromOrder);
  if (idx === -1) return;
  const delta = direction === "next" ? 1 : -1;
  let cursor = idx + delta;
  while (cursor >= 0 && cursor < sorted.length) {
    const [, el] = sorted[cursor];
    if (!isSkippable(el)) {
      event.preventDefault();
      el.focus();
      return;
    }
    cursor += delta;
  }
  applyEndBehavior(direction, event, onLastFieldRef.current, onSubmitRef.current, sorted);
},
```

- [ ] **Step 4: Run — expect pass**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (18 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-input-order.tsx src/hooks/use-input-order.test.tsx
git commit -m "feat(hooks): onLastField=submit calls form.requestSubmit or onSubmit"
```

---

## Task 10: End behavior — `onLastField="wrap"`

**Files:**
- Test: `src/hooks/use-input-order.test.tsx`

Wrap mode is already implemented in `applyEndBehavior`; just add coverage.

- [ ] **Step 1: Add failing tests**

Append:

```tsx
describe("InputOrderProvider — onLastField=wrap", () => {
  it("Tab on the last field focuses the first", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="wrap">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("b").focus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("a")).toHaveFocus();
  });

  it("Shift+Tab on the first field focuses the last", async () => {
    const user = userEvent.setup();
    render(
      <InputOrderProvider onLastField="wrap">
        <FieldFixture order={1} label="a" />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    screen.getByLabelText("a").focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText("b")).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run — expect pass (no impl change required)**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (20 tests). If a test fails, fix the wrap branch in `applyEndBehavior` to match — it should be a one-line correction.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-input-order.test.tsx
git commit -m "test(hooks): cover onLastField=wrap forward and backward"
```

---

## Task 11: End behavior — `onLastField="none"` falls through to native

**Files:**
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing test**

Append:

```tsx
describe("InputOrderProvider — onLastField=none", () => {
  it("does not preventDefault on Tab past the last field", () => {
    function Inline() {
      const { ref, onKeyDown } = useInputOrder(2);
      const last = React.useRef<HTMLInputElement>(null);
      React.useEffect(() => last.current?.focus(), []);
      return (
        <input
          ref={(el) => {
            ref(el);
            last.current = el;
          }}
          onKeyDown={onKeyDown}
          aria-label="last"
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <FieldFixture order={1} label="a" />
        <Inline />
      </InputOrderProvider>,
    );

    const last = screen.getByLabelText("last");
    last.focus();
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    last.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
```

Add `import * as React from "react";` at the top of the test file if not already present.

- [ ] **Step 2: Run — expect pass (already implemented)**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (21 tests).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-input-order.test.tsx
git commit -m "test(hooks): cover onLastField=none does not preventDefault"
```

---

## Task 12: Stability of `ref` and `onKeyDown` across re-renders

**Files:**
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing test**

Append:

```tsx
describe("useInputOrder — return stability", () => {
  it("ref and onKeyDown identities are stable across re-renders", () => {
    const captured: { ref?: unknown; onKeyDown?: unknown }[] = [];
    function Harness({ tick }: { tick: number }) {
      const v = useInputOrder(1, { onEnter: () => tick });
      captured.push({ ref: v.ref, onKeyDown: v.onKeyDown });
      return <input ref={v.ref} onKeyDown={v.onKeyDown} />;
    }
    const { rerender } = render(
      <InputOrderProvider onLastField="none">
        <Harness tick={0} />
      </InputOrderProvider>,
    );
    rerender(
      <InputOrderProvider onLastField="none">
        <Harness tick={1} />
      </InputOrderProvider>,
    );
    expect(captured[0]?.ref).toBe(captured.at(-1)?.ref);
    expect(captured[0]?.onKeyDown).toBe(captured.at(-1)?.onKeyDown);
  });
});
```

- [ ] **Step 2: Run — expect pass (the existing impl already uses `useCallback` + ref for options)**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (22 tests). If it fails, the cause is that `ctx` identity changed across re-renders (provider re-created its `value`). Verify the provider's `useMemo` deps are `[]`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-input-order.test.tsx
git commit -m "test(hooks): assert ref and onKeyDown identities are stable"
```

---

## Task 13: Handler composition — `defaultPrevented` short-circuits

**Files:**
- Test: `src/hooks/use-input-order.test.tsx`

- [ ] **Step 1: Add failing test**

Append:

```tsx
describe("useInputOrder — composition", () => {
  it("does not advance if consumer onKeyDown has called preventDefault", async () => {
    const user = userEvent.setup();
    function Composed() {
      const { ref, onKeyDown } = useInputOrder(1);
      return (
        <input
          ref={ref}
          aria-label="a"
          onKeyDown={(e) => {
            if (e.key === "Tab") e.preventDefault();
            onKeyDown(e);
          }}
        />
      );
    }
    render(
      <InputOrderProvider onLastField="none">
        <Composed />
        <FieldFixture order={2} label="b" />
      </InputOrderProvider>,
    );
    const a = screen.getByLabelText("a");
    a.focus();
    await user.keyboard("{Tab}");
    expect(a).toHaveFocus(); // didn't advance
  });
});
```

- [ ] **Step 2: Run — expect pass (already implemented via early return on `event.defaultPrevented`)**

Run: `bun run test src/hooks/use-input-order.test.tsx`
Expected: PASS (23 tests).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-input-order.test.tsx
git commit -m "test(hooks): consumer preventDefault short-circuits the hook"
```

---

## Task 14: Storybook stories + play-tests

**Files:**
- Create: `src/hooks/use-input-order.stories.tsx`

- [ ] **Step 1: Write the stories file**

Create `src/hooks/use-input-order.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "../components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import { InputOrderProvider, useInputOrder } from "./use-input-order";

function OrderedField({
  order,
  label,
  disabled,
}: {
  order: number;
  label: string;
  disabled?: boolean;
}) {
  const { ref, onKeyDown } = useInputOrder(order);
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <Input.Root disabled={disabled}>
        <Input.Field
          ref={ref}
          onKeyDown={onKeyDown}
          aria-label={label}
          disabled={disabled}
        />
      </Input.Root>
    </label>
  );
}

const meta: Meta = {
  title: "Hooks/useInputOrder",
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <InputOrderProvider onLastField="none">
      <div className="grid w-80 gap-3">
        {/* DOM order intentionally != logical order */}
        <OrderedField order={3} label="third" />
        <OrderedField order={1} label="first" />
        <OrderedField order={2} label="second" />
      </div>
    </InputOrderProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByLabelText("first");
    const second = canvas.getByLabelText("second");
    const third = canvas.getByLabelText("third");
    first.focus();
    await userEvent.keyboard("{Tab}");
    await expect(second).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(third).toHaveFocus();
  },
};

export const WithDisabled: Story = {
  render: () => (
    <InputOrderProvider onLastField="none">
      <div className="grid w-80 gap-3">
        <OrderedField order={1} label="a" />
        <OrderedField order={2} label="b" disabled />
        <OrderedField order={3} label="c" />
      </div>
    </InputOrderProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const a = canvas.getByLabelText("a");
    const c = canvas.getByLabelText("c");
    a.focus();
    await userEvent.keyboard("{Tab}");
    await expect(c).toHaveFocus();
  },
};

export const Wrap: Story = {
  render: () => (
    <InputOrderProvider onLastField="wrap">
      <div className="grid w-80 gap-3">
        <OrderedField order={1} label="a" />
        <OrderedField order={2} label="b" />
      </div>
    </InputOrderProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const a = canvas.getByLabelText("a");
    const b = canvas.getByLabelText("b");
    b.focus();
    await userEvent.keyboard("{Tab}");
    await expect(a).toHaveFocus();
  },
};

function OrderedSelect({ order, label }: { order: number; label: string }) {
  const { ref, onKeyDown } = useInputOrder(order);
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <Select>
        <SelectTrigger
          ref={ref}
          onKeyDown={onKeyDown}
          aria-label={label}
          className="w-full"
        >
          <SelectValue placeholder="Pick…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">X</SelectItem>
          <SelectItem value="y">Y</SelectItem>
        </SelectContent>
      </Select>
    </label>
  );
}

export const WithSelect: Story = {
  render: () => (
    <InputOrderProvider onLastField="none">
      <div className="grid w-80 gap-3">
        <OrderedField order={1} label="before" />
        <OrderedSelect order={2} label="pick" />
        <OrderedField order={3} label="after" />
      </div>
    </InputOrderProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const before = canvas.getByLabelText("before");
    const pick = canvas.getByLabelText("pick");
    const after = canvas.getByLabelText("after");

    // Tab from a plain input to the Select trigger.
    before.focus();
    await userEvent.keyboard("{Tab}");
    await expect(pick).toHaveFocus();

    // Tab from Select trigger to the next ordered field.
    await userEvent.keyboard("{Tab}");
    await expect(after).toHaveFocus();
  },
};

function CustomEnterField() {
  const { ref, onKeyDown } = useInputOrder(2, {
    onEnter: () => alert("custom action"),
  });
  return (
    <label className="grid gap-1 text-sm">
      <span>last (custom Enter)</span>
      <Input.Root>
        <Input.Field ref={ref} onKeyDown={onKeyDown} aria-label="last" />
      </Input.Root>
    </label>
  );
}

export const EnterOverride: Story = {
  render: () => (
    <InputOrderProvider onLastField="none">
      <div className="grid w-80 gap-3">
        <OrderedField order={1} label="first" />
        <CustomEnterField />
      </div>
    </InputOrderProvider>
  ),
};
```

- [ ] **Step 2: Run unit tests + Storybook tests**

Run: `bun run test`
Expected: All projects pass (unit + storybook play-tests). The Storybook project uses Playwright/chromium per `vitest.config.ts`.

- [ ] **Step 3: Visual smoke check**

Run: `bun run storybook`
Open <http://localhost:6006/?path=/story/hooks-useinputorder--default> and confirm Tab + Enter behavior. Then Ctrl+C the server.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/use-input-order.stories.tsx
git commit -m "docs(storybook): useInputOrder stories + play-tests"
```

---

## Task 15: Public exports + final verification

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add exports**

Open `src/index.ts` and append (placement at the bottom, near the `cn` export, is fine):

```ts
export { InputOrderProvider, useInputOrder } from "./hooks/use-input-order";
export type {
  InputOrderProviderProps,
  UseInputOrderOptions,
  UseInputOrderReturn,
} from "./hooks/use-input-order";
```

- [ ] **Step 2: Typecheck, lint, full test, build**

Run all four:

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

Expected: all clean. If `build` (tsup) errors on missing `"use client"` directives or similar, address per project convention — looking at the rest of `src/`, no other module uses `"use client"`, so it should not be needed.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: export InputOrderProvider and useInputOrder"
```

---

## Done

After Task 15:
- `useInputOrder(order)` + `<InputOrderProvider>` are publicly exported.
- 23 unit tests cover registration, Tab/Shift+Tab/Enter, skip rules, end behaviors, stability, and composition.
- 4 Storybook stories with play-tests cover Default, WithDisabled, Wrap, EnterOverride.

No version bump is included — coordinate that separately when publishing.
