# DatePicker — design

**Target version:** v0.8.0
**Date:** 2026-05-20
**Author:** sedjiwa-ui
**Revision:** 2 — switched to custom popover + calendar (rejected native `<input type="date">` per consumer feedback)

## Purpose

Provide a date-input primitive whose UI is fully controlled by the library — same calendar grid in every browser, themable, locale-aware, and consistent with the rest of the field-surface family (`Input`, `CurrencyInput`, `Select`).

## Non-goals

- **Date range selection.** Single-date only. A future `DateRangePicker` can compose two `DatePicker`s and a range-aware `Calendar` variant.
- **Time-of-day.** Out of scope for v0.8.0.
- **Year/decade nav views.** Header label is read-only; users navigate one month at a time (PageUp/PageDown + Shift for ±1 year).
- **Locale-formatted text input.** No typing into the trigger; selection happens in the calendar grid.

## Architecture

DatePicker is a composed primitive built on three pieces:

1. **`Popover`** — a new internal/exported primitive wrapping `@radix-ui/react-popover` with the project's styling. Adds `@radix-ui/react-popover` as a peer dep (and devDep).
2. **`Calendar`** — a custom month-grid component (private to the `date-picker/` folder for now). Renders header (prev / month-year label / next), weekday row, and a 6×7 grid of day buttons. Implements full keyboard nav (arrows, Home/End, PgUp/PgDn, Shift+PgUp/PgDn).
3. **`DatePicker`** — composes a Popover whose trigger is a field-surface-styled `<button>` showing the formatted date (or a placeholder), and whose content is the Calendar. Maintains the ISO `"YYYY-MM-DD"` wire contract.

The trigger button uses the shared `fieldSurfaceVariants` so it lines up visually with `Input` / `CurrencyInput` / `Select` in mixed forms.

### Why a custom calendar over react-day-picker

`react-day-picker` would be smaller in code but adds a new third-party logic dep. The library so far is exclusively Radix + Tailwind + lucide — no date-fns, no dayjs. A custom calendar:
- Stays inside that constraint.
- Avoids carrying date-fns or moment for keyboard nav math (~5 helper functions cover everything).
- Lets us own theming end-to-end (no `.rdp-*` class overrides).

### Why Radix Popover over hand-rolled

Floating-element positioning, focus trap, outside-click dismiss, and `aria-expanded` wiring are all already solved by Radix. Reimplementing them is not where the value of this component lives.

## Public API

```ts
type DatePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  /** Controlled value. ISO "YYYY-MM-DD" or null. */
  value?: string | null;
  /** Uncontrolled initial value. */
  defaultValue?: string | null;
  /** Fires when the user picks a day. */
  onValueChange?: (value: string | null) => void;
  /** ISO date; disables days before this date in the calendar. */
  min?: string;
  /** ISO date; disables days after this date in the calendar. */
  max?: string;
  /** Placeholder shown when no value is selected. Default "Pick a date". */
  placeholder?: string;
  /** BCP-47 locale for header / weekday / display formatting. */
  locale?: string;
  /** Day the week starts on. 0 = Sunday, 1 = Monday (default). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Custom formatter for the trigger label. Default: Intl.DateTimeFormat({ day:'numeric', month:'long', year:'numeric' }). */
  formatLabel?: (d: Date) => string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  /** Name for the hidden form input (omit if you don't need form submission via name). */
  name?: string;
};
```

The trigger button forwards `ref` (so RHF Controllers can focus it on validation errors) and `id` / `aria-describedby` / `aria-invalid` (so `FormControl` Slot-cloning lands on the focusable element).

### Wire format: ISO `"YYYY-MM-DD"` strings

Locale-agnostic, JSON-safe, RHF-friendly, no timezone drift. The parser constructs `new Date(y, m-1, d)` for local-time semantics; the formatter rebuilds the string from the local-time `getFullYear/Month/Date`. Round-trip is identity.

### Form submission

When `name` is provided, an `<input type="hidden" name={name} value={value ?? ""} />` is rendered alongside the popover so native form submission picks up the value without consumer wiring.

## Calendar component (internal)

```ts
type CalendarProps = {
  value?: Date | null;
  onSelect?: (value: Date) => void;
  min?: Date;
  max?: Date;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: string;
  autoFocus?: boolean;
  className?: string;
};
```

State (kept internal):
- `viewMonth: Date` — first-of-month of the currently displayed grid.
- `focusedDate: Date` — the day currently focusable via roving `tabIndex`. Clamped into `[min, max]`.

Layout:
- Header: prev-month button — `Month YYYY` label (aria-live="polite") — next-month button. Prev/next disabled when stepping outside `[min, max]`.
- Weekday header row, locale-formatted.
- 6×7 day grid. Out-of-month days dimmed; today underlined; selected filled with `primary`; out-of-range disabled.

Keyboard:
| Key | Effect |
|---|---|
| ←/→ | -/+ 1 day |
| ↑/↓ | -/+ 7 days |
| Home/End | start/end of week |
| PgUp/PgDn | -/+ 1 month |
| Shift+PgUp/PgDn | -/+ 1 year |
| Enter/Space | select focused day (native `<button>` activation) |

Moving focus across a month boundary shifts `viewMonth` automatically and re-focuses the matching button on the next frame.

## File layout

```
src/components/popover/
  popover.tsx
  index.ts
src/components/date-picker/
  calendar.tsx              // internal — not exported from the package
  date-picker.tsx
  date-picker.stories.tsx
  date-picker.test.tsx
  index.ts
```

Public exports (`src/index.ts`):

```ts
export { DatePicker } from "./components/date-picker";
export type { DatePickerProps } from "./components/date-picker";

export {
  Popover, PopoverAnchor, PopoverContent, PopoverTrigger,
} from "./components/popover";
```

## Testing

- Trigger: default placeholder, custom placeholder, formatted-date label, disabled-blocks-open, loading shows spinner + aria-busy, state=error sets aria-invalid.
- Popover + calendar: opens on click; month header matches value; click day → ISO emitted + popover closes; controlled mode respects parent ownership.
- Month nav: prev / next buttons cycle months.
- Min/max: out-of-range days disabled.
- Keyboard: ArrowRight moves roving focus; Enter selects.
- Ref forwarding: trigger button receives `ref`.
- Hidden form input: rendered when `name` provided; value mirrors current selection.
- RHF integration: Controller wires `field.onChange` to `onValueChange`; `FormControl` Slot-cloning lands `id` / `aria-describedby` / `aria-invalid` on the trigger button.

## Stories

`Default`, `WithValue`, `Sizes`, `States`, `WithMinMax`, `IndonesianLocale`, `SundayWeekStart`, `ControlledExample`, `InRHFForm`.

## Trade-offs accepted

- We own the calendar bug surface (no upstream maintenance). Mitigated by the small implementation size (~200 lines incl. all keyboard nav).
- One additional peer dep (`@radix-ui/react-popover`). Consistent with the library's "Radix-everywhere" runtime story.
- No year/decade jump view. Stepping with Shift+PgDn moves a year at a time — adequate for the dates this library is likely to see (birthdays, deadlines).

## Out of scope (future)

- `DateRangePicker` (compose two pickers or extend `Calendar` with `mode="range"`).
- `DateTimePicker` (compose with a Time primitive).
- Year/decade picker views inside Calendar.
- `Calendar` as a public export (extract when a second consumer appears).
