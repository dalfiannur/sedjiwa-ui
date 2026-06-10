# SplitButton — design

**Target version:** v0.14.0
**Date:** 2026-06-02
**Author:** sedjiwa-ui

## Purpose

A **split button**: a primary "default command" merged with a dropdown trigger
that opens an overlay of additional, related commands. The classic use is a
button whose main action is the common case (e.g. *Save*) while less-frequent
variants of that action (*Save as…*, *Save all*) live one click away in a menu.

It composes two existing shadcn-derived primitives — `Button` and
`DropdownMenu` — into a single, accessible, visually-merged control. No new
third-party dependency.

## Non-goals (v0.14.0)

- **Selectable default.** The default command is *fixed* (the `SplitButtonAction`);
  selecting a menu item does **not** promote it to become the new primary
  action. A "remembers last choice" mode is plausible later but adds state and
  value-coupling that deserve their own pass. (YAGNI)
- **Data-driven `items` array API.** The API is compositional only (matches
  `DropdownMenu`/`Dialog` in this repo). A data-driven convenience wrapper could
  be layered on later without breaking the compositional core.
- **Icon-only sizes.** `icon`/`icon-sm`/`icon-lg` are excluded for the action
  half — a split button needs a visible label. (The trigger half *internally*
  uses an icon size to render the chevron.)
- **Built-in checkbox/radio menu items.** The overlay holds plain command items
  (and separators). If a consumer needs checkbox/radio items they can drop the
  underlying `DropdownMenu*` parts in directly.

## Architecture

A compositional set of parts under `src/components/split-button/`, built purely
on the repo's `Button` + `DropdownMenu` (Radix + Tailwind + lucide only). A tiny
React context carries shared `variant` / `size` / `disabled` down so both halves
of the control stay in visual and behavioral sync.

### Parts

| Component | Renders | Role |
|---|---|---|
| `SplitButton` | `<div role="group">` + `SplitButtonContext.Provider` | Flex container; owns shared `variant`, `size`, `disabled`; exposes `aria-label` |
| `SplitButtonAction` | repo `Button` | The default command (left half), forced `rounded-r-none`. Forwards all `ButtonProps` (incl. `loading`, `asChild`, `onClick`). Inherits `variant`/`size`/`disabled` from context unless locally overridden |
| `SplitButtonMenu` | `DropdownMenu` → `DropdownMenuTrigger asChild`(icon `Button`) + `DropdownMenuContent` | Right half: the chevron trigger (`rounded-l-none -ml-px`, `ChevronDownIcon`) **and** the overlay containing its children. Forwards `open`/`defaultOpen`/`onOpenChange`, `align` (default `"end"`), `side` |
| `SplitButtonItem` | `DropdownMenuItem` | A command in the overlay; forwards `onSelect`, `disabled`, `variant="destructive"`, icons/children |
| `SplitButtonSeparator` | `DropdownMenuSeparator` | Optional grouping line within the overlay |

`SplitButton`, `SplitButtonAction`, `SplitButtonMenu`, `SplitButtonItem`,
`SplitButtonSeparator` (and their prop types) are exported from `src/index.ts`.

### Context

```ts
type SplitButtonContextValue = {
  variant: ButtonVariants["variant"];
  size: Extract<ButtonVariants["size"], "sm" | "default" | "lg">;
  disabled?: boolean;
};
```

`SplitButtonAction` and `SplitButtonMenu` read this. A local `variant`/`size`/
`disabled` on a child overrides the context value for that child only (rare, but
keeps the parts usable). Consuming the context outside a `SplitButton` throws a
clear error.

### Visual treatment (merged + divider)

- `SplitButtonAction` → `rounded-r-none`.
- Trigger `Button` → `rounded-l-none -ml-px` so the two borders collapse into a
  single outline.
- A hairline divider sits between the halves. For variants with a border
  (`outline`, `secondary` in dark, etc.) the overlapping `-ml-px` border *is* the
  divider. For solid-fill variants (`default`, `destructive`) the trigger adds a
  subtle left edge (`before:` pseudo-element, `bg-*-foreground/20`) so the seam
  reads as one control with a divider rather than two stacked buttons.
- Outer corners keep the normal Button radius; only the inner (touching) corners
  are squared.

No new `cva`/`*.variants.ts` file — the parts reuse `buttonVariants` and apply
the seam classes via `cn(...)` overrides (same approach as `dropdown-menu`,
which ships no variants file).

### Size → trigger icon-size mapping

| `SplitButton` size | Action Button size | Trigger Button size |
|---|---|---|
| `sm` | `sm` | `icon-sm` |
| `default` | `default` | `icon` |
| `lg` | `lg` | `icon-lg` |

Chevron is lucide `ChevronDownIcon`; the Button base styles size it to `size-4`.

## Behavior

- **Default command fixed** — clicking the action runs its `onClick`; the menu
  holds the other commands.
- **Overlay** — opening is controlled by `DropdownMenu` (uncontrolled by
  default, or controlled via `open`/`onOpenChange` on `SplitButtonMenu`). Default
  `align="end"` so the overlay aligns to the trigger's right edge.
- **Disabled** — `disabled` on `SplitButton` disables both halves; either half
  can also be disabled individually (action via `disabled`, trigger by passing
  `disabled` to `SplitButtonMenu`). `SplitButtonAction` also supports `Button`'s
  `loading` state.

## Accessibility

- `SplitButton` renders `role="group"` and requires/accepts an `aria-label`
  describing the command group.
- The trigger `Button` needs an accessible name: `SplitButtonMenu` takes a
  `triggerLabel` prop (default `"More commands"`) applied as `aria-label`.
- Radix `DropdownMenu` wires `aria-haspopup` / `aria-expanded` on the trigger and
  provides arrow-key navigation, type-ahead, Esc-to-close, and focus return.
- The action and trigger are two separate focusable buttons; Tab moves between
  them, matching native split-button expectations.

## Testing (`split-button.test.tsx`, Vitest + Testing Library)

1. Clicking `SplitButtonAction` fires its `onClick`.
2. Clicking the trigger opens the overlay; items render.
3. Selecting a `SplitButtonItem` fires its `onSelect` and closes the overlay.
4. `disabled` on `SplitButton` disables both the action and the trigger.
5. A locally `disabled` action does not disable the trigger (independent).
6. `variant` and `size` set on the root propagate to both halves
   (assert via `data-variant` / `data-size` on the rendered buttons).
7. The trigger exposes an accessible name (default and custom `triggerLabel`).
8. `SplitButtonAction` `loading` shows the spinner and blocks the click.

## Storybook (`split-button.stories.tsx`)

- Default (Save / Save as… / Save all).
- All variants gallery.
- All sizes (sm / default / lg).
- With destructive item and a separator.
- Disabled (whole group) and loading action.
- Controlled-open example.
