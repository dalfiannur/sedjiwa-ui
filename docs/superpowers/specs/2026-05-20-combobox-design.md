# Combobox — design

**Target version:** v0.10.0
**Date:** 2026-05-20
**Author:** sedjiwa-ui

## Purpose

A searchable, optionally-multiple, optionally-async select primitive. Covers the cases the existing `Select` (thin Radix Select wrapper) cannot:

- typing to filter a long list,
- fetching options from a server in response to the query,
- loading more options as the listbox is scrolled,
- picking more than one value.

`Select` stays as-is for short, fixed lists with no search — it's still the right primitive there.

## Non-goals (v0.10.0)

- **Free-text / "create new" entries.** All selections come from the provided `options` array. A `creatable` mode is plausible later but adds enough complexity (dedupe, value-shape coupling) to deserve its own pass.
- **Async option-by-value resolution.** If `value` references an id that isn't in the currently-loaded `options`, the chip / label falls back to the raw value string. Consumers doing server search are expected to seed `options` with the currently-selected items.
- **Grouped options / headers.** Flat list only in v1. Easy to add later via an optional `getOptionGroup` accessor.
- **Virtualized listbox.** With infinite scroll + a reasonable page size, plain DOM rendering is fine for the foreseeable scale. Revisit if a real consumer hits a wall.
- **`<form>` submission with native multi-value semantics.** When `multiple` + `name` are both set, one hidden input per selected value is rendered (same `name`); single mode renders one input as in `DatePicker`.

## Architecture

Follows the `DatePicker` precedent: a composite primitive that pairs the existing `Popover` with a custom inner UI, with no new third-party logic deps (Radix + Tailwind + lucide only).

Three internal pieces:

1. **`Combobox`** (exported) — composes a `Popover` whose trigger is a field-surface-styled `<button>` and whose content is the `ComboboxListbox`. Owns the value state (controlled or uncontrolled), the open state, and the search-query state.
2. **`ComboboxListbox`** (internal) — search input + scrollable option list + sentinel + empty/loading states. Owns the active-descendant (keyboard) index. Pure: given options + state, renders. All callbacks bubble up.
3. **`ComboboxTrigger`** (internal) — the button that shows placeholder / single label / multi chips. Internal because its rendering is tightly coupled to the `multiple` discriminator; consumers customize via `placeholder`, `renderValue`, `maxChips`.

### Why custom listbox over `cmdk` or `downshift`

Same rationale as the calendar in `DatePicker`: this library has held a "Radix + Tailwind + lucide only" runtime story and a custom listbox (~250 lines incl. keyboard nav and IO sentinel) keeps that intact. `cmdk` is excellent but introduces its own filter / keyboard model that would need to be themed and bent to support server mode and pagination anyway.

### Why not extend Radix Select

Radix Select is portal-aware and accessible, but it has no text-input filter slot, no async/loading affordance, no multi-select, and no scroll sentinel. Bending it would mean fighting it; rebuilding the listbox on `Popover` is cleaner and matches the calendar pattern.

## Public API

```ts
type ComboboxProps<T> = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  // Options + accessors (generic, like DataTable<T>)
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  /** Optional disabled-state predicate per option. */
  isOptionDisabled?: (option: T) => boolean;
  /** Customize each row inside the listbox. */
  renderOption?: (
    option: T,
    state: { selected: boolean; active: boolean },
  ) => React.ReactNode;
  /** Customize the trigger label. Receives the selected option(s) or null. */
  renderValue?: (
    selected: T | T[] | null,
  ) => React.ReactNode;

  // Value (discriminated by `multiple` — see "Value typing" below)
  multiple?: boolean;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onValueChange?: (value: string | string[] | null) => void;

  // Search
  /** Show the search input inside the listbox. Default true. */
  searchable?: boolean;
  /** Controlled search query. */
  searchValue?: string;
  /** Uncontrolled initial search query. */
  defaultSearchValue?: string;
  /**
   * Presence of this callback switches the component into *server mode*:
   * internal filtering is disabled and the consumer is expected to supply
   * the already-filtered `options`. Debounced by `searchDebounceMs`.
   */
  onSearchChange?: (query: string) => void;
  /** Override the default local filter (case-insensitive substring on label). */
  filterFn?: (option: T, query: string) => boolean;
  /** Debounce for `onSearchChange`. Default 300ms. */
  searchDebounceMs?: number;

  // Pagination (infinite scroll)
  /** Fires when the bottom sentinel is intersected and !loading && hasMore. */
  onLoadMore?: () => void;
  hasMore?: boolean;
  /** Shows a spinner row at the bottom of the listbox and disables onLoadMore. */
  loading?: boolean;

  // UI
  placeholder?: string;                 // default "Select…"
  searchPlaceholder?: string;           // default "Search…"
  emptyMessage?: React.ReactNode;       // default "No results"
  loadingMessage?: React.ReactNode;     // default "Loading…"
  /** Max chips before collapsing into "+N more". Default 3. Only used when `multiple`. */
  maxChips?: number;
  /** Allow clearing the entire selection from the trigger (× button). Default false. */
  clearable?: boolean;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  disabled?: boolean;
  name?: string;
  className?: string;
};
```

### Value typing

The runtime API uses one set of props with a `multiple` boolean. The exported type is a discriminated union so TypeScript narrows `value` / `defaultValue` / `onValueChange` correctly:

```ts
export type ComboboxProps<T> =
  | (ComboboxBaseProps<T> & {
      multiple?: false;
      value?: string | null;
      defaultValue?: string | null;
      onValueChange?: (value: string | null) => void;
    })
  | (ComboboxBaseProps<T> & {
      multiple: true;
      value?: string[];
      defaultValue?: string[];
      onValueChange?: (value: string[]) => void;
    });
```

`ComboboxBaseProps<T>` holds everything except the four `multiple` / `value` / `defaultValue` / `onValueChange` fields.

### Wire format

- Single: `string | null`. `null` means "no selection".
- Multi: `string[]`. Empty array means "no selection". Order = order added by the user.

The component never stores option objects — only their string values, resolved through `getOptionValue`. Trigger labels and chips look up the option object on each render. If a selected value isn't present in `options`, the label falls back to the value string itself (so server-search consumers can still render a chip while the option isn't loaded — they should seed `options` with the selected items).

### Form submission

When `name` is set:
- Single mode: one `<input type="hidden" name={name} value={value ?? ""} />`.
- Multi mode: zero or more hidden inputs, all with the same `name`, one per selected value. Native form parsing yields them as repeated entries (FormData) or arrays (most server frameworks).

### Search modes

Mode is determined by the *presence* of `onSearchChange`, not by a separate enum prop. This makes misuse harder — server mode without a callback is impossible to express.

| Mode | Triggered by | Library does | Consumer does |
|---|---|---|---|
| **Local** | `onSearchChange` undefined | Filters `options` with `filterFn` (or default substring match on label) | Provides full options array; can override `filterFn` |
| **Server** | `onSearchChange` defined | Debounces input by `searchDebounceMs`, emits raw query, renders `options` as-is | Receives query, refetches, swaps `options`. Sets `loading` while fetching. |

`searchable={false}` hides the input entirely and disables both modes (the listbox is a static picker).

### Pagination

The listbox renders a sentinel `<div>` after the last option. An `IntersectionObserver` (relative to the listbox scroll container) watches it. When it intersects and `hasMore === true` and `loading !== true`, `onLoadMore()` fires.

Why IntersectionObserver vs. scroll-event math:
- No event throttling required.
- Survives variable row heights (necessary for `renderOption` flexibility).
- Stays correct when the listbox re-mounts as the popover opens/closes — the observer is created on listbox mount.

The sentinel is intentionally a few pixels above the very bottom so `onLoadMore` fires while the user is still scrolling, not at the exact end.

Pagination is orthogonal to mode: a local-mode consumer can also paginate (e.g., to avoid mounting 5000 rows up-front). The library does not assume anything about whether more options exist — that's `hasMore`'s job.

## Trigger rendering

```
Single, empty:       [ placeholder text                          ▾ ]
Single, value:       [ Selected label                            ▾ ]
Single, clearable:   [ Selected label                          × ▾ ]
Multi, empty:        [ placeholder text                          ▾ ]
Multi, 1–maxChips:   [ [Apple ×] [Banana ×]                      ▾ ]
Multi, overflow:     [ [Apple ×] [Banana ×] [Cherry ×] +2 more   ▾ ]
```

Chips:
- Rendered as small `Badge`-style spans inside the trigger.
- The `×` icon is a `<button>` (not a clickable div); clicking it removes that value without opening the popover (`onPointerDown` calls `e.stopPropagation()` and `e.preventDefault()`).
- "+N more" is plain text, not a button.

Sizing: the trigger uses `min-h` of the field-surface size, not `h`, so it grows to accommodate chips. Single mode is single-line via `h-` to match `Input` exactly.

`clearable` adds an `×` button on the right (before the chevron) for the entire selection. Clicking clears to `null` (single) or `[]` (multi).

## Listbox rendering

```
┌──────────────────────────────────────┐
│ 🔍 [ search input                  ] │  ← omitted when searchable={false}
├──────────────────────────────────────┤
│ ✓ Apple                              │  ← selected mark in single + multi
│   Banana                             │
│   Cherry                       (focus) │  ← active descendant: bg-accent
│   Date                               │
│   ...                                │
│   ▒▒ loading row ▒▒                  │  ← when loading
│   <sentinel>                         │
└──────────────────────────────────────┘
```

States:
- **Empty (no query):** "No options".
- **Empty (with query):** `emptyMessage` (default "No results").
- **Loading (server mode, initial fetch):** `loadingMessage` replaces option rows.
- **Loading (additional pages):** spinner row at the bottom; existing options stay visible.

Selection marker:
- Single mode: a check icon on the right of the selected row (matches existing `SelectItem`).
- Multi mode: a checkbox icon on the left of each row; toggles on select.

## Keyboard

| Key | Effect |
|---|---|
| **Trigger focused** |
| Space / Enter / ArrowDown | Open popover, focus search input (or first option if not searchable) |
| **Popover open, search input focused** |
| ArrowDown / ArrowUp | Move active descendant in listbox (focus stays in input) |
| Enter | Select active descendant (single: also closes; multi: stays open) |
| Esc | Close popover; restore focus to trigger |
| Backspace on empty query (multi) | Remove last selected chip |
| Tab | Close popover, move focus to next focusable element |
| Home / End | First / last option |

Active descendant is tracked by `aria-activedescendant` on the search input pointing at the focused option's `id`. Physical focus stays in the input so typing works seamlessly.

## ARIA

- Trigger: `role="combobox"`, `aria-expanded`, `aria-controls={listboxId}`, `aria-haspopup="listbox"`.
- Search input (inside popover): `role="combobox"` (per ARIA 1.2 combobox-with-listbox-popup pattern), `aria-controls={listboxId}`, `aria-activedescendant={activeOptionId}`.
- Listbox: `role="listbox"`, `aria-multiselectable={multiple}`, `aria-label` mirrored from the trigger's `aria-label` if any.
- Option: `role="option"`, `aria-selected`, `aria-disabled` when applicable.
- Loading row: `role="status"`, `aria-live="polite"`.

## File layout

```
src/components/combobox/
  combobox.tsx                // Combobox (exported), trigger, popover wiring, value/search state
  combobox-listbox.tsx        // internal — search input, options, sentinel, ARIA
  combobox.stories.tsx
  combobox.test.tsx
  index.ts
```

Public exports (added to `src/index.ts`):

```ts
export { Combobox } from "./components/combobox";
export type { ComboboxProps } from "./components/combobox";
```

## Testing

Test surface (Vitest + RTL, plus Storybook play-tests for keyboard / a11y where useful):

- **Trigger**
  - Placeholder shown when no value.
  - Single label shown when value matches an option.
  - Single label falls back to the raw value when option not in list.
  - Multi chips render for each selected value; clicking `×` removes only that value.
  - Multi overflow collapses to "+N more" past `maxChips`.
  - `clearable` shows an `×` button that resets selection.
  - `disabled` blocks opening.
  - `state="error"` sets `aria-invalid` on the trigger.
- **Popover open/close**
  - Click trigger opens; click outside / Esc closes.
  - Focus moves into search input on open.
  - Focus returns to trigger on close.
- **Local search**
  - Typing filters by case-insensitive substring on label.
  - Custom `filterFn` overrides default.
  - Empty results show `emptyMessage`.
- **Server search**
  - Typing fires `onSearchChange` after debounce.
  - `loading` shows the loading message in place of options.
  - Internal filter is bypassed (component renders the provided `options` verbatim).
- **Pagination**
  - Scrolling to the bottom of the listbox calls `onLoadMore` once.
  - Does not fire when `loading` is true.
  - Does not fire when `hasMore` is false.
  - Fires again after a re-render with new options + `loading=false`.
- **Multiple select**
  - Selecting toggles a value in / out of the array.
  - Popover stays open after a multi-select.
  - Backspace on empty search removes the last chip.
  - Disabled options can't be selected (via `isOptionDisabled`).
- **Keyboard**
  - ArrowDown / ArrowUp move active descendant.
  - Enter selects the active option.
  - Esc closes.
- **Ref / a11y / RHF**
  - Trigger forwards `ref`.
  - `FormControl` Slot-cloning lands `id` / `aria-describedby` / `aria-invalid` on the trigger.
  - RHF Controller round-trip works for both single and multi modes.
- **Form submission**
  - `name` in single mode renders one hidden input.
  - `name` in multi mode renders one hidden input per selected value, all with the same `name`.

## Stories

`Default`, `WithValue`, `Searchable`, `NotSearchable`, `Sizes`, `States`, `Multiple`, `MultipleWithChips`, `Clearable`, `ServerSearch` (with mocked fetch), `InfiniteScroll` (with mocked paged dataset), `ServerSearchPlusInfiniteScroll`, `CustomRenderOption`, `CustomRenderValue`, `Disabled`, `WithDisabledOptions`, `InRHFForm`.

## Trade-offs accepted

- **No virtualization.** Acceptable while consumer lists are bounded; revisit when a real consumer needs 10k+ unfiltered rows in the popover.
- **No "create new" mode.** Lots of edge cases (dedupe semantics, value shape) and no concrete consumer yet.
- **Selected-but-not-loaded options show raw values.** Server-search consumers must seed `options` with currently-selected items. This is documented in the prop JSDoc on `value`.
- **Listbox re-creates the IntersectionObserver on each open.** Cheap and avoids stale-observer bugs.

## Out of scope (future)

- `creatable` mode for free-text entries.
- Async value-to-option resolver (e.g. `getOptionByValue: (value) => Promise<T>`).
- Grouped options (`getOptionGroup`).
- Virtualized listbox.
- Tag-input style multi-select where the trigger itself is the input (no popover).
