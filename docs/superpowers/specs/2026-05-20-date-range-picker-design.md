# DateRangePicker — design

**Target version:** v0.9.0
**Date:** 2026-05-20
**Author:** sedjiwa-ui

## Purpose

A picker for selecting a `{from, to}` date pair. Same field-surface trigger and popover affordance as `DatePicker`; same custom Calendar primitive — but the Calendar runs in `mode="range"` with two months side-by-side and a hover-preview range.

## Non-goals (v0.9.0)

- **Multiple disjoint ranges.** One contiguous range only.
- **Time-of-day on either end.** ISO date strings only.
- **Presets sidebar** ("Last 7 days", "This month", …). Easy to add later as `children` slot.
- **Year/decade jump views inside calendar.** Same as DatePicker; covered by the month/year selects in the header.

## Architecture

The Calendar primitive was already 95% of the work. This work refactors it once to support both modes, then layers a thin DateRangePicker on top — the same shape DatePicker has.

**Calendar refactor:**

- `mode?: "single" | "range"` discriminator (default `"single"`).
- Discriminated `value` / `onSelect`:
  - single: `value?: Date | null`, `onSelect?: (Date) => void` (unchanged)
  - range: `value?: DateRange | null`, `onSelect?: (DateRange) => void` where `DateRange = { from: Date | null; to: Date | null }`
- `numberOfMonths?: number` — renders that many month grids side-by-side, sharing one `viewMonth` anchor. Prev button on the leftmost month, next button on the rightmost. Each month's header has its own month/year select pair, but selecting a month/year at offset N translates to setting `viewMonth = (selected − N)` so the picked month/year ends up where the user clicked it.
- `showOutsideDays?: boolean` — defaults to `numberOfMonths === 1`. Hides days from adjacent months in multi-month view to keep each calendar date represented exactly once (otherwise keyboard nav and `[data-focused]` queries break).
- Range-selection state machine inside Calendar:
  - 1st click → `{from: clicked, to: null}`
  - 2nd click → if before from, swap; otherwise extend
  - 3rd click (range already complete) → reset to `{from: clicked, to: null}`
- Hover preview: `hoveredDate` state, only active when `from` is set and `to` is null and the hovered day is after `from`. Day cells get `data-preview` for the lighter accent treatment.

**DateRangePicker:** structurally identical to DatePicker — Popover, field-surface trigger button, hidden inputs, RHF-friendly ref forwarding, FormControl-cloned `id`/`aria-*` on the trigger.

### Why not split off CalendarRange

Two files would have ~80% duplicated header/grid/keyboard code. Centralizing in one Calendar with a discriminator keeps fixes singular and total size smaller. The discriminator pays for itself the first time a bug needs fixing in both.

## Public API

```ts
type DateRangeValue = { from: string | null; to: string | null };

type DateRangePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onValueChange?: (value: DateRangeValue) => void;
  min?: string;     // ISO date
  max?: string;     // ISO date
  placeholder?: string;
  pendingSuffix?: string;  // shown after the start while choosing the end
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  fromYear?: number;
  toYear?: number;
  numberOfMonths?: number;  // default 2
  formatLabel?: (range: { from: Date | null; to: Date | null }) => string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  /** Hidden inputs are emitted as `${name}[from]` and `${name}[to]`. */
  name?: string;
};
```

### Wire format

`{ from: string | null; to: string | null }`. Both ISO strings or both `null`; intermediate "from set, to null" states are valid (they're what `onValueChange` fires after the first click).

### Trigger label formatting

Three branches, all using `Intl.DateTimeFormat`:

| State | Example |
|---|---|
| Empty | "Pick a date range" |
| `from` only (mid-selection) | "May 1, 2026 → …" |
| Both, same month | "1 – 31 May 2026" |
| Both, same year | "May 1 – Jun 5 2026" |
| Both, different years | "Dec 15, 2026 – Jan 5, 2027" |

Override via `formatLabel`.

### Popover open/close timing

- 1st click: fires `onValueChange({from, to: null})`, popover stays open (user is still choosing).
- 2nd click: fires `onValueChange({from, to})`, popover **closes**.
- 3rd click (on an already-complete range): treated as a 1st click — popover stays open.

### Form submission

When `name` is provided, two hidden inputs are rendered:

```html
<input type="hidden" name="vacation[from]" value="2026-05-10" />
<input type="hidden" name="vacation[to]" value="2026-05-20" />
```

This nests cleanly under standard form serializers (qs, URLSearchParams via custom parser, most form libraries).

## File layout

```
src/components/date-picker/
  calendar.tsx              // now supports mode="single" | "range" + numberOfMonths
src/components/date-range-picker/
  date-range-picker.tsx
  date-range-picker.stories.tsx
  date-range-picker.test.tsx
  index.ts
```

Public exports (`src/index.ts`):

```ts
export { DateRangePicker } from "./components/date-range-picker";
export type {
  DateRangePickerProps,
  DateRangeValue,
} from "./components/date-range-picker";
```

`DateRange` (the Date-based shape used internally by Calendar) stays exported from the `date-picker` folder; only the string-based `DateRangeValue` is part of the public DateRangePicker API.

## Testing

- Trigger label formatting across same-month / same-year / cross-year / mid-selection / empty states.
- Disabled / loading / state=error.
- Popover opens to two month grids labelled correctly.
- Click sequence: 1st sets `from`, 2nd sets `to` and closes, swap when 2nd is before 1st, 3rd resets.
- Ref forwarding to the trigger button.
- Hidden form inputs for `${name}[from]` and `${name}[to]`.
- RHF Controller wires `field.onChange` to `onValueChange`; FormControl Slot-cloning lands aria props on the trigger.
- `min`/`max` disable out-of-range days.

## Trade-offs accepted

- The Calendar file grew from ~280 → ~400 lines. Worth it to keep the single source of truth.
- No keyboard shortcut to clear a partially-selected `from`. Users press Escape to close the popover (preserves the partial state) and re-click the trigger / pick a different day. If this proves friction, add a footer "Clear" / "Reset" button in a follow-up.
- The hover preview is mouse-only. Roving focus doesn't trigger it. A `focus`-driven preview is simple to add but adds visual noise during keyboard nav, so left out for now.

## Out of scope (future)

- Range with presets sidebar.
- `mode="multiple"` (set of independent days).
- Range with min-length / max-length constraints (e.g., "between 3 and 14 days").
- `DateTimeRangePicker`.
