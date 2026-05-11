# Input Order — Design Spec

**Date:** 2026-05-11
**Status:** Approved (brainstorm)
**Owner:** uray@qyubit.io

## Problem

Forms in the consuming apps often render fields in a visual order that does not match the order users want to type in. The browser's native Tab order follows DOM order, so authors are forced to restructure markup (or fight with `tabIndex`) just to fix keyboard flow. We also want a one-line affordance for "press Enter to go to the next field," which is common in data-entry UIs (POS, finance, admin).

We need a small, composable primitive that lets a form declare an explicit Tab/Enter sequence over any focusable controls, without coupling to a specific input component or to react-hook-form.

## Goals

- Declare an explicit field order with simple integers.
- Tab / Shift+Tab and Enter navigate by that order.
- Works on any focusable element: `Input.Field`, `Textarea`, `CurrencyInput`, Select trigger, Checkbox, RadioGroup, Switch, Button.
- Composes with existing `onKeyDown` handlers on the consumer's element.
- No new runtime dependencies. Pure React + TypeScript.
- Accessible: keeps DOM order intact; only intercepts keys, does not move nodes.

## Non-Goals

- Not a focus-trap (use Radix Dialog / `Modal` for that).
- Not a roving-tabindex implementation for composite widgets (toolbars, menus).
- No support for ArrowDown/ArrowUp navigation (conflicts with native Select/Radio/Date controls). Out of scope for v1.
- No automatic discovery of focusable children — every participating field must call `useInputOrder` itself.

## Public API

### `InputOrderProvider`

Defines the boundary of one ordered group. Must wrap any component using `useInputOrder`.

```tsx
import { InputOrderProvider } from "@qyubit/sedjiwa-ui";

<InputOrderProvider
  onLastField="submit"
  onSubmit={(event) => { /* … */ }}
>
  {/* fields */}
</InputOrderProvider>
```

**Props:**

| Prop          | Type                                  | Default      | Notes |
|---------------|---------------------------------------|--------------|-------|
| `onLastField` | `"submit" \| "wrap" \| "none"`        | `"submit"`   | Behavior when stepping past the last field forward, or past the first field backward (symmetric). |
| `onSubmit`    | `(event: React.SyntheticEvent) => void` | —          | Called when `onLastField="submit"` and no `<form>` ancestor is found. Ignored otherwise. |
| `children`    | `React.ReactNode`                     | —            | Required. |

### `useInputOrder`

Registers a single field at a position in the sequence.

```tsx
import { useInputOrder } from "@qyubit/sedjiwa-ui";

const first  = useInputOrder(1);
const second = useInputOrder(2);
const third  = useInputOrder(3, { onEnter: () => doSomething() });

<Input.Field ref={first.ref}  onKeyDown={first.onKeyDown}  />
<Input.Field ref={second.ref} onKeyDown={second.onKeyDown} />
<Button      ref={third.ref}  onKeyDown={third.onKeyDown}  />
```

**Signature:**

```ts
function useInputOrder(
  order: number,
  options?: UseInputOrderOptions,
): UseInputOrderReturn;

type UseInputOrderOptions = {
  onEnter?: (event: React.KeyboardEvent) => void;
};

type UseInputOrderReturn = {
  ref: React.RefCallback<HTMLElement>;
  onKeyDown: (event: React.KeyboardEvent) => void;
};
```

- `order` — sort key. Integers recommended; any numbers work. Duplicates allowed but warned in dev.
- `options.onEnter` — runs when Enter is pressed on this field instead of the default "advance" behavior. Use to wire Enter to a custom action without losing Tab navigation.
- The returned `ref` and `onKeyDown` are **stable** across re-renders. (Implementation: `options.onEnter` is stored in a ref so the returned `onKeyDown` does not need to be re-created when the caller's closure identity changes.)

Calling the hook outside `InputOrderProvider` throws: `useInputOrder must be used inside <InputOrderProvider>`.

## Behavior

### Key handling (fired from a field's `onKeyDown`)

| Key         | Action                                                                |
|-------------|-----------------------------------------------------------------------|
| `Tab`       | `preventDefault`, focus next registered field (sorted by `order`).    |
| `Shift+Tab` | `preventDefault`, focus previous.                                     |
| `Enter`     | `preventDefault`, focus next — subject to skip rules below.           |

The handler early-returns if `event.defaultPrevented` is already true.

**Composition with a consumer's existing `onKeyDown`:** only one `onKeyDown` can be passed to a DOM element, so the consumer composes:

```tsx
<Input.Field
  ref={first.ref}
  onKeyDown={(e) => {
    myHandler(e);          // consumer runs first
    if (e.defaultPrevented) return;
    first.onKeyDown(e);    // hook second; bails if consumer prevented
  }}
/>
```

The hook itself does not accept an `onKeyDown` option — keeping the API small. If this pattern repeats we can add a `composeEventHandlers` helper later.

### Enter skip rules

Enter is **not** intercepted when any of these are true on the event target:

- `tagName === "TEXTAREA"` — newlines must work.
- `tagName === "BUTTON"` — native submit/click.
- `aria-expanded="true"` — covers open Radix Select / DropdownMenu / Combobox triggers.
- `data-input-order-enter="ignore"` — explicit escape hatch on the consumer element.

Tab / Shift+Tab is intercepted in all cases. That is the entire point of the hook.

### Field skipping

When stepping, the hook skips elements that are:

- `element.disabled === true`, or
- `element.getAttribute("aria-disabled") === "true"`, or
- `element.tabIndex === -1`.

If every remaining field in the requested direction is skipped, behavior falls through to `onLastField`.

### End-of-sequence behavior

Driven by the provider's `onLastField` prop. Symmetric for backward navigation past the first field.

| `onLastField` | Tab past last                                                                                                | Shift+Tab past first              |
|---------------|--------------------------------------------------------------------------------------------------------------|-----------------------------------|
| `"submit"`    | Look up nearest `<form>` ancestor of the active element; call `form.requestSubmit()`. If no form: call `onSubmit` if provided; else no-op. | No-op. (Don't submit by going backward.) |
| `"wrap"`      | Focus the first registered field.                                                                            | Focus the last registered field.  |
| `"none"`      | Do not `preventDefault` — native Tab leaves the group.                                                       | Do not `preventDefault`.          |

### Focus mechanics

- Uses `element.focus()` with default options.
- Registered `ref` must point to the actual focusable DOM node. Consumers forward refs as they normally do (matches existing `<Input.Field ref={…}>` semantics). For composite components without ref forwarding to a focusable child, the hook can't help — that's a library-level fix for that component, not this hook's concern.

## Architecture

### File layout

New directory `src/hooks/` (does not yet exist in the project).

```
src/hooks/
  use-input-order.tsx         ← provider, context, hook (all co-located)
  use-input-order.test.tsx    ← Vitest unit tests
  use-input-order.stories.tsx ← Storybook demo + play-tests
```

**Rationale for `src/hooks/` vs alternatives:**

- Not `src/components/input-order/` — this is not a visual component, that path overpromises.
- Not `src/lib/` — `lib/` currently holds styling helpers (`cn`, `field-surface.variants`). Mixing hooks in muddies the boundary.
- A dedicated `src/hooks/` folder leaves room for future hooks (`useDisclosure`, `useClipboard`, etc.) without churn.

### Module structure inside `use-input-order.tsx`

1. **Types** — `InputOrderProviderProps`, `UseInputOrderOptions`, `UseInputOrderReturn`, internal `InputOrderContextValue`.
2. **Context** — `React.createContext<InputOrderContextValue | null>(null)`. Default `null` so consumer hook can throw on misuse.
3. **Provider** — owns the registry, exposes `register / unregister / step(direction, fromOrder, event)` via context.
4. **Hook** — `useInputOrder(order, options?)`. Returns stable `{ ref, onKeyDown }`.

### Internal data model

- Registry is a `React.useRef<Map<number, HTMLElement>>(new Map())`.
- Registration happens in the `ref` callback returned by `useInputOrder`:
  - On a non-null element: `registry.set(order, element)`.
  - On a `null` element (unmount): `registry.delete(order)` *only if* the stored element is the one we last registered (guards against StrictMode double-invocation churn).
- We deliberately do **not** use `useState` for the registry. Mount/unmount of fields must not cause the provider to re-render — for large forms this would cascade. Re-renders aren't needed: the next key event reads the up-to-date map directly.

### Stepping algorithm

```text
step(direction: "next" | "prev", fromOrder: number, event):
  sorted = [...registry.entries()].sort(([a], [b]) => a - b)
  idx = sorted.findIndex(([order]) => order === fromOrder)
  delta = direction === "next" ? +1 : -1
  cursor = idx + delta
  while cursor is in range:
    [_, el] = sorted[cursor]
    if !isSkippable(el): el.focus(); event.preventDefault(); return
    cursor += delta
  // ran off the end
  applyEndBehavior(direction, event)
```

### Dev warnings

- Duplicate `order` registered: `console.warn("[useInputOrder] duplicate order %d", order)`. Fires once per duplicate via a `Set` on the registry.
- Hook used outside provider: throws (not a warning — this is a bug, not a degradation).

## Public exports (`src/index.ts`)

```ts
export { InputOrderProvider, useInputOrder } from "./hooks/use-input-order";
export type {
  InputOrderProviderProps,
  UseInputOrderOptions,
  UseInputOrderReturn,
} from "./hooks/use-input-order";
```

## Testing

### Unit tests (`use-input-order.test.tsx`, jsdom)

1. **Registration**
   - Hook outside provider throws expected error.
   - Three fields with orders `[1, 2, 3]` — Tab on 1 focuses 2; Tab on 2 focuses 3.
   - Holes — `[1, 5, 10]` step in sorted sequence.
   - Duplicate orders — dev `console.warn` fires once; last-mounted element wins.

2. **Keys**
   - `Tab` advances; `Shift+Tab` retreats; both `preventDefault`.
   - `Enter` advances on plain `<input>`.
   - `Enter` is **not** intercepted on `<textarea>`, on `<button>`, on element with `data-input-order-enter="ignore"`, or when target has `aria-expanded="true"`.

3. **Skipping**
   - Field with `disabled` is skipped, forward and backward.
   - Field with `tabIndex={-1}` is skipped.
   - Field with `aria-disabled="true"` is skipped.
   - All remaining fields skippable → falls through to `onLastField`.

4. **End behavior**
   - `onLastField="submit"` inside a `<form>` calls `form.requestSubmit` (spy).
   - `onLastField="submit"` without a form calls provider's `onSubmit` if given.
   - `onLastField="wrap"` — Tab on last focuses first; Shift+Tab on first focuses last.
   - `onLastField="none"` — does not `preventDefault` on Tab at the last field.

5. **Unmount**
   - Unmounting a field removes it from the registry; stepping skips it cleanly.

6. **Handler composition**
   - Consumer-provided `onKeyDown` that calls `preventDefault` short-circuits the hook.

7. **Ref / handler stability**
   - `ref` and `onKeyDown` identities are stable across two renders (verified via `useRef` capture).

### Storybook stories (`use-input-order.stories.tsx`, Playwright/chromium)

- `Default` — 3 inputs, Tab and Enter both advance.
- `WithSelect` — Enter doesn't fire while Select listbox is open; Tab still advances.
- `WithDisabled` — disabled middle field is skipped.
- `Wrap` — last → first / first → last.
- `EnterOverride` — uses `options.onEnter` on the last field to trigger a custom save action.

### Accessibility

- Storybook `addon-a11y` runs over the stories — no missing labels, no `aria-disabled` misuse on the demos.
- Manual screen-reader smoke: VoiceOver / NVDA still announce fields in DOM order. The hook never reorders DOM nodes.

## Risks & open questions

- **Composite widgets (Radix Select, DropdownMenu):** the hook expects `ref` to land on the focusable trigger. Radix already forwards refs to the trigger, so this should "just work" — but verify in the `WithSelect` story.
- **React StrictMode double-invocation:** the ref callback may fire twice in dev. Guarded by checking element identity on unregister.
- **Multiple providers on a page:** intentional — each provider owns its own registry. Nested providers? Inner wins (nearest context). Documented but not specifically tested in v1.
- **Server rendering:** the hook does nothing during SSR (no event listeners attached); registration is client-only via the `ref` callback. No hydration issues expected.

## Out of scope (future work)

- ArrowDown/ArrowUp navigation mode.
- Roving-tabindex variant for composite widgets.
- Auto-discovery of focusable children inside a provider (would let consumers skip the per-field hook call). Trade-off: implicit, harder to reason about.
- A pre-built `<OrderedField order={n}>{children}</OrderedField>` wrapper. Easy to add later if patterns repeat.
