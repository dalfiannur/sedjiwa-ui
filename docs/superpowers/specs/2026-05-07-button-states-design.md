# Button States — Design & Principles

**Date:** 2026-05-07
**Status:** Draft (pending implementation plan)
**Source:** Adapted from [Figma Resource Library — Button States](https://www.figma.com/resource-library/button-states/), tailored to `@qyubit/sedjiwa-ui`.
**Scope:** `Button` component implementation + a shared interactive-state vocabulary documented for reuse across the library.

---

## 1. Goal

Bring `Button` to full state coverage (default, hover, active, focus, disabled, loading, selected) and establish a small, documented contract — `data-state` + matching ARIA — that other interactive components (Tabs, Toggle, MenuItem, future Switch) already partially follow via Radix. The contract is documentation, not code: there is no shared abstraction to maintain.

Out of scope: `success` / `error` button-level states (those belong to confirmation flows and form validation), uncontrolled `pressed`, and migrating other components.

---

## 2. Principles

These apply to every interactive component in `sedjiwa-ui`, not just `Button`.

1. **Every interactive element has at minimum the 5 core states:** default, hover, active/pressed, focus, disabled.
2. **State is communicated by more than color.** Pair color with shadow, transform, border weight, icon, or underline (WCAG 2.2, colorblind-safe).
3. **Keyboard-first focus.** Always `:focus-visible` (never `:focus`), 3px ring with offset, never suppressed without an alternative.
4. **Tactile press feedback.** Active = `scale-[0.98]` (or a 1px translate for inline `link`). 150ms transition.
5. **Disabled is informational.** Reduced opacity + `cursor-not-allowed` + `aria-disabled`. Pair with a tooltip when the reason isn't obvious.
6. **Loading is a busy-state, not a disabled-state.** `aria-busy="true"` + visible spinner + suppressed pointer events. Children stay rendered to prevent width jitter.
7. **Selected/toggled persists.** `aria-pressed` (toggle) or `aria-selected` (option in a set). Visual must be a clear inversion of default, not a hover lookalike.
8. **State vocabulary is shared.** All interactive components expose state via `data-state` + matching ARIA. This contract — not shared code — is what keeps the library coherent.
9. **Touch targets ≥ 44×44px** on coarse pointers. Library does not auto-grow; consumers pick larger sizes on touch surfaces.
10. **Transitions: 150ms.** One value, used everywhere.

---

## 3. State Matrix

### 3.1 Universal formulas (added once to base CVA classes)

- **active:** `active:scale-[0.98]` (or `active:translate-y-[1px]` for `link`)
- **focus-visible:** existing `focus-visible:ring-ring/50 focus-visible:ring-[3px]` (kept)
- **disabled:** existing `disabled:opacity-50 disabled:pointer-events-none` + add `disabled:cursor-not-allowed`
- **loading** (`data-[state=loading]`): `pointer-events-none` + `data-[state=loading]:opacity-90` (subtle dim — spinner is the primary signal) + spinner rendered before children; children remain mounted
- **pressed** (`data-[state=on]` / `aria-pressed=true`): per-variant treatment in 3.2
- Existing `transition-all` retained, narrowed to `duration-150`

### 3.2 Per-variant deltas

Existing default/hover/focus rows are unchanged. New rows:

| variant | active (press) | pressed (toggled-on) |
|---|---|---|
| `default` | `active:bg-primary/80` | `data-[state=on]:bg-primary/85` |
| `destructive` | `active:bg-destructive/80` | `data-[state=on]:bg-destructive/85` |
| `outline` | `active:bg-accent active:border-accent-foreground/20` | `data-[state=on]:bg-accent data-[state=on]:text-accent-foreground` |
| `secondary` | `active:bg-secondary/70` | `data-[state=on]:bg-secondary/70` |
| `ghost` | `active:bg-accent active:text-accent-foreground` | `data-[state=on]:bg-accent data-[state=on]:text-accent-foreground` |
| `link` | `active:translate-y-[1px]` | `data-[state=on]:underline` (persistent) |

Notes:
- `default` / `destructive` rarely act as toggles, but get a defined `pressed` so the library has no undefined corners.
- Dark-mode variants don't need separate state rows — opacity modifiers compose with existing `dark:` rules.

---

## 4. API

### 4.1 Button props

```ts
export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    asChild?: boolean;
    loading?: boolean;   // NEW
    pressed?: boolean;   // NEW (controlled toggle state)
  };
```

### 4.2 Behavior contract

| prop | DOM attrs set | Visual | Pointer/keys |
|---|---|---|---|
| `loading=true` | `aria-busy="true"`, `data-state="loading"`, `aria-disabled="true"` | spinner before children, children stay rendered, opacity-90 | `pointer-events-none` (class-based) |
| `pressed=true` | `aria-pressed="true"`, `data-state="on"` | per Section 3.2 | normal |
| `pressed=false` | `aria-pressed="false"`, `data-state="off"` | default visual | normal |
| `pressed=undefined` | neither attr emitted | default visual | normal |

Rules:
- `loading` wins over `pressed` visually (`data-state="loading"` is set instead of `"on"`).
- `loading` does **not** set the native `disabled` attribute — focus is preserved so screen readers can still announce the button. Pointer suppression is class-based (`pointer-events-none`).
- `asChild` works unchanged: Radix `Slot` merges `aria-busy` / `aria-pressed` / `data-state` onto the slotted child. `<Button asChild loading><Link>…</Link></Button>` correctly marks the link busy.
- `pressed` is **controlled only**. No internal toggle state — matches the Radix philosophy already in use.

### 4.3 Spinner slot

- Renders as `<Loader2 data-slot="loader" aria-hidden="true" className="animate-spin size-4 shrink-0" />` (`lucide-react`, already a peer dep).
- Always rendered as the first child. Currently icons are passed as plain children, so the spinner simply precedes them. The base CVA `gap-2` absorbs the spinner width visually.
- Children text/labels are never unmounted.

---

## 5. Shared interactive-state vocabulary

Documentation contract for all interactive components in the library. No shared code.

| Concept | DOM signal | ARIA |
|---|---|---|
| idle / no special state | `data-state="off"` or absent | — |
| toggled on | `data-state="on"` | `aria-pressed="true"` (toggle) or `aria-selected="true"` (option) |
| busy / processing | `data-state="loading"` | `aria-busy="true"` |
| open / expanded | `data-state="open"` | `aria-expanded="true"` (Radix already conforms) |
| disabled by app logic | `data-disabled="true"` | `aria-disabled="true"` |

Tabs, Dropdown, and Dialog already emit `data-state="open"` via Radix; this spec just documents the convention so future components (Toggle, Switch, MenuItem) adopt it consistently.

---

## 6. Accessibility

- Contrast ≥ 4.5:1 verified per variant × state in light and dark, manually, before merge.
- `aria-busy` carries the loading announcement; spinner is `aria-hidden="true"`.
- `aria-pressed` follows the WAI-ARIA toggle button pattern.
- Touch targets: `default`/`lg`/`icon`/`icon-lg` already meet 44×44; `sm`/`icon-sm` (32px) are documented as consumer responsibility on coarse-pointer surfaces — the library does not auto-grow.
- `:focus-visible` retained; native focus ring never suppressed.

---

## 7. Testing

Additions to `src/components/button/button.test.tsx`:

- `loading=true` renders spinner, sets `aria-busy="true"`, sets `data-state="loading"`, suppresses click handler.
- `loading=true` keeps children rendered (assert text still present in DOM).
- `pressed=true` → `aria-pressed="true"` + `data-state="on"`.
- `pressed=false` → `aria-pressed="false"` + `data-state="off"`.
- `pressed` undefined → neither attribute emitted.
- `loading=true` + `pressed=true` → `data-state="loading"` wins (assert `"on"` is not set).
- `asChild` + `loading` propagates `aria-busy` to slotted child element.
- Existing variant/size tests untouched.

---

## 8. Out of scope (explicit)

- `success` / `error` button-level states (belong to confirmation flows and form validation).
- Uncontrolled `pressed` (internal toggle state management).
- Migrating Tabs / Toggle / MenuItem to the documented vocabulary — they already conform via Radix; no rewrite.
- Alternative loading visuals (progress bar, skeleton) — single spinner is sufficient for v0.x.
- A new `Toggle` component — separate spec if needed.

---

## 9. Risks & considerations

- **Width jitter on loading entry.** Mitigated by keeping children mounted and inserting the spinner alongside (not in place of) text. The `gap-2` already in base CVA absorbs the spinner width visually.
- **`pressed` on `default`/`destructive` looks subtle.** Acceptable: those variants are rarely toggles. If real-world use surfaces a need, revisit with a stronger inversion (e.g., inset shadow or ring).
- **`active:scale-[0.98]` on a button containing an icon-only child** — the transform applies to the whole button, not the icon, so the icon stays crisp. No special handling needed.
- **`asChild` with a non-button element** (e.g., `<a>`) doesn't naturally support `disabled`. The class-based pointer suppression and `aria-disabled` make the loading behavior work uniformly across rendered elements.

---

## 10. Implementation summary (handoff to writing-plans)

Files to touch:
- `src/components/button/button.variants.ts` — add active/pressed/loading rows; tighten transition duration.
- `src/components/button/button.tsx` — add `loading`, `pressed` props; render spinner; emit `aria-busy` / `aria-pressed` / `data-state`; ensure `asChild` propagation.
- `src/components/button/button.test.tsx` — add the cases listed in §7.
- `README.md` — document new props + the shared vocabulary table from §5.
- `playground/` — extend the Button showcase with loading and toggled examples (existing pattern).

No new dependencies. `lucide-react` is already a peer dep.
