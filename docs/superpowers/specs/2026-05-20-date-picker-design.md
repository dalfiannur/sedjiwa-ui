# DatePicker — design

**Target version:** v0.8.0
**Date:** 2026-05-20
**Author:** sedjiwa-ui

## Purpose

Provide a date-input primitive that pairs the native `<input type="date">` control with the library's `Input.Root` surface, so consumers get the project's visual language, validation/state vocabulary, loading/disabled handling, and RHF integration with zero new runtime dependencies.

## Non-goals

- **Custom popover calendar.** The library currently ships no Popover primitive and no calendar/date utility deps. A bespoke calendar is a much larger surface (keyboard a11y, month/year navigation, locale rendering, range selection) than this iteration justifies.
- **Date range selection.** Single-date only. A future `DateRangePicker` can compose two `DatePicker`s or build on a future `Calendar` primitive.
- **Time-of-day.** `type="datetime-local"` is out of scope for v0.8.0.
- **Locale-formatted display string.** The value is exchanged in ISO format only. The browser renders the visible text in the user's locale; the wire value stays canonical.

## Architecture

DatePicker is a thin wrapper that:

1. Renders `<Input.Root>` carrying `size`, `state`, `loading`, `disabled`, `readOnly`, plus the FormControl-cloned `id` / `aria-describedby` / `aria-invalid`.
2. Renders `<Input.Field type="date">` inside, forwarding the rest of the consumer's input props.
3. Renders an `<Input.Action>` with a `Calendar` icon (lucide) that calls `inputRef.current.showPicker()` on click — providing a clean, library-styled trigger that opens the browser's native calendar UI.
4. Hides the browser's default calendar-picker indicator via CSS (`::-webkit-calendar-picker-indicator`) to avoid double icons.
5. Accepts a `children` escape hatch for additional trailing slots (e.g., a custom clear `Input.Action`) — matching `CurrencyInput`'s shape.

This is the same architecture as `CurrencyInput`, so the file layout and prop-routing conventions are familiar.

## Public API

```ts
type DatePickerProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  /** Controlled value. ISO "YYYY-MM-DD" or null. */
  value?: string | null;
  /** Uncontrolled initial value. ISO "YYYY-MM-DD" or null. */
  defaultValue?: string | null;
  /** Fires with the ISO string (or null on empty). */
  onValueChange?: (value: string | null) => void;
  /** ISO date; forwarded to native min attribute. */
  min?: string;
  /** ISO date; forwarded to native max attribute. */
  max?: string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  /** Suppress the auto calendar Input.Action trigger. */
  hideTrigger?: boolean;
  className?: string;       // Input.Root
  inputClassName?: string;  // Input.Field
  /** Appended inside Input.Root *after* the field (e.g., custom clear action). */
  children?: React.ReactNode;
};
```

### Wire format: ISO `"YYYY-MM-DD"` strings

- Matches the native `input.value` of `type="date"` directly — no marshalling.
- Locale-agnostic and JSON-safe (RHF-friendly).
- Avoids `Date` object timezone hazards. A `Date` constructed from `"2026-05-20"` is parsed as UTC; rendered in a non-UTC timezone it can shift to 2026-05-19. Strings stay literal.
- `null` represents "empty".

### State / loading / disabled

Inherited from `Input.Root` — the same vocabulary as `Input` and `CurrencyInput`:

- `state="error"` → red surface + auto trailing `AlertCircle` icon (replaced by our calendar trigger position, see edge cases) + `aria-invalid=true` on the inner input.
- `state="success" | "warning"` → corresponding surface + icon.
- `loading` → spinner trailing icon, `aria-busy=true`, change/click/keydown suppressed on the inner input.
- `disabled`, `readOnly` → forwarded to the inner input.

### FormControl integration

Like `CurrencyInput`, the props `id`, `aria-describedby`, `aria-invalid`, `onBlur`, `onFocus`, and `ref` are extracted from the rest spread and routed appropriately:

- `id` / `aria-describedby` / `aria-invalid` → `Input.Root` (which forwards them via `InputContext` to the inner `<input>`).
- `ref` → merged with internal ref on the inner `<input>` so consumers (and RHF Controllers) get a real `HTMLInputElement`.
- `onBlur` / `onFocus` → passed through to the inner input alongside any internal handlers.

## Edge cases & behaviors

1. **Auto state icon vs. our trigger.** `Input.Root` injects an auto trailing icon for `state="error" | "success" | "warning"`. Our calendar trigger is an `Input.Action`, which sits in the same slot. `Input.Root`'s render logic already inserts the auto-icon *before* the first `Input.Action`, so visually we get: `[field][state-icon][calendar-trigger]`. This is correct — the user sees the state hint AND can still open the picker.

2. **`hideTrigger`.** Some consumers want a bare date input with no extra icon (e.g., in dense table cells). `hideTrigger` suppresses the auto `Input.Action`. The browser's native indicator stays hidden via CSS, but consumers can click into the field and type, or hit Space/Enter, to open the picker.

3. **`showPicker()` browser support.** Chromium, Safari ≥16.4, Firefox ≥101. If unsupported, `showPicker()` will throw — we wrap in try/catch and fall back to focusing the input, which on most browsers still opens the picker via the native indicator (still rendered but visually clipped).

4. **Loading state.** `Input.Root`'s `readOnly` is set when loading (matching `CurrencyInput`) to suppress React's warning about a controlled `value` without `onChange`. The trigger button is auto-disabled by `Input.Action` when context `loading=true`.

5. **`min`/`max` validation.** Forwarded as native attributes only. The browser enforces them on the calendar UI and form validation. We do NOT clamp programmatically — this is consistent with how the library treats native validation elsewhere (`required`, `pattern`).

6. **Hiding the native indicator.** Tailwind has no built-in for `::-webkit-calendar-picker-indicator`. We add the class on the inner field:
   ```
   [&::-webkit-calendar-picker-indicator]:appearance-none
   [&::-webkit-calendar-picker-indicator]:opacity-0
   [&::-webkit-calendar-picker-indicator]:pointer-events-none
   ```
   `appearance-none` removes the icon entirely in Chromium; Firefox doesn't render one. On Safari we keep `opacity-0`.

7. **Empty string `""` ↔ `null` mapping.** The native input emits `""` for "empty". We normalize empty/whitespace to `null` in `onValueChange` so consumers can lean on a single sentinel. Controlled `value === null` renders as `""`.

## File layout

```
src/components/date-picker/
  date-picker.tsx
  date-picker.stories.tsx
  date-picker.test.tsx
  index.ts
```

Public exports (added to `src/index.ts`):

```ts
export { DatePicker } from "./components/date-picker";
export type { DatePickerProps } from "./components/date-picker";
```

## Testing

Following `currency-input.test.tsx`'s shape:

- **Rendering / variants:** size, state→aria-invalid propagation, disabled, readOnly, loading.
- **Controlled / uncontrolled:** value/defaultValue round-tripping, empty → null.
- **Trigger:** `hideTrigger` suppresses the button; clicking the button calls `showPicker()` (mock on `HTMLInputElement.prototype`).
- **Forwarding:** ref lands on the inner `<input>`, `name` lands on the inner input.
- **Min/max:** attributes appear on the inner input.
- **Composition:** consumer-provided `Input.Action` in `children` is appended after the trigger.
- **RHF:** FormControl Slot-cloning lands `id` / `aria-describedby` / `aria-invalid` on the inner input, not the wrapper.

## Stories

Mirror the CurrencyInput story set:

- `Default` — empty field.
- `Sizes` — sm/default/lg.
- `States` — default / error / success / warning / disabled / loading.
- `WithMinMax` — bounded date range.
- `WithoutTrigger` — `hideTrigger` variant.
- `WithClearAction` — controlled, custom clear `Input.Action`.
- `InRHFForm` — `useForm` + `FormField` integration showing validation.

## Out of scope (future work)

- `Calendar` primitive (custom-rendered, accessible month grid) + `Popover` primitive.
- `DateRangePicker`.
- Locale-formatted text input (e.g., "20/05/2026" with masking).
- `DateTimePicker` (compose with a Time primitive).
