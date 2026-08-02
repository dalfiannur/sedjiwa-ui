# DateTimePicker inline mode + DateTimeRangePicker

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let every date/time field in a consuming app use one component family. `DateTimePicker` gains an inline trigger+popover mode for form fields, and a new `DateTimeRangePicker` covers start/end pairs.

**Architecture:** The hour/minute/period control is extracted once and shared. `DateTimePicker` becomes a discriminated union on `mode` (`"modal"` default, `"inline"`), mirroring how `Calendar` discriminates on its own `mode`. `DateTimeRangePicker` is inline-only and mirrors the existing `DateRangePicker` trigger, with `Calendar mode="range"` plus a time control per end.

**Tech Stack:** React 19, TypeScript, Tailwind v4, cva, Radix, Vitest, Storybook, bun.

---

## Why

The consuming app has five `datetime-local` inputs. Three sit **inside dialogs**, where the current modal picker would open a modal on top of a modal — two stacked overlays and two commit buttons. Leaving those native was rejected: two different date UIs in one app is worse than either alone, and native `datetime-local` renders differently per browser.

Target integration (a separate plan):

| Site | Component | Mode |
|---|---|---|
| `AvailabilityPage` Dari/Sampai | `DateTimeRangePicker` | inline |
| `BookingCreateDialog` Mulai/Selesai | `DateTimeRangePicker` | inline |
| `UsageDialog` time | `DateTimePicker` | inline |

## Repo rules

Read `CLAUDE.md`. The ones that bite here:

- **bun only.** CLI binaries are NOT on `$PATH` — `bun run <script>` / `bunx <bin>`.
- **`bun run test` (unfiltered) ABORTS** on a missing Playwright chromium build. Pre-existing, not yours. Run specific files: `bunx vitest run <name>.test`.
- **Do NOT run `bun run storybook`** — long-lived server, it will hang you.
- Component folders: `<name>.tsx`, `<name>.variants.ts` *(only when there are cva variants)*, `<name>.test.tsx`, `<name>.stories.tsx`, `index.ts`. Export from `src/index.ts`.
- **Colour from tokens only.** Use `--<tone>-text` for coloured text, never a solid tone. See `docs/theming.md`.
- This repo's lint bans synchronous `setState` in an effect **and** ref access during render. For derived-on-open state, follow the `useState` previous-value pattern already used in `combobox.tsx` and `date-time-picker.tsx`.

## Existing pieces to mirror, not reinvent

- `src/components/date-range-picker/date-range-picker.tsx` (293 lines) — the trigger+popover shape, `FieldSurfaceVariants` field styling, `placeholder`, `formatLabel`, hidden form inputs via `name`. **Read it first**; the two new inline surfaces should feel identical to it.
- `src/components/date-picker/date-picker.tsx` — the single-value equivalent.
- `Calendar` supports `mode="range"`, and now also `headerVariant`, `dayShape`, `weekdayCase`, `navPlacement`.

---

## File Structure

**Created:**
- `src/components/date-time-picker/time-select.tsx` — the shared hour/minute/period control
- `src/components/date-time-range-picker/{date-time-range-picker.tsx,date-time-range-picker.test.tsx,date-time-range-picker.stories.tsx,index.ts}`

**Modified:**
- `src/components/date-time-picker/date-time-picker.tsx` — extract the time control, add inline mode
- `src/components/date-time-picker/date-time-picker.test.tsx`, `.stories.tsx`
- `src/index.ts`

---

### Task 1: Extract the shared time control

Both components need the same locale-aware hour/minute/period logic. Duplicating it would guarantee drift.

- [ ] **Step 1: Create `src/components/date-time-picker/time-select.tsx`**

Move out of `date-time-picker.tsx`, unchanged in behaviour: `pad`, `minuteStep`, `snap`, the `Intl` hour-cycle detection, the option builders, and the group of two-or-three `Select`s.

Suggested surface (internal — do **not** export from `src/index.ts`):

```tsx
export type TimeSelectProps = {
  /** Minutes since midnight. */
  value: number;
  onValueChange: (minutes: number) => void;
  timeStep?: number;
  locale?: string;
  /** id of the visible label; the group is labelled by it. */
  labelledBy?: string;
  hourLabel?: string;
  minuteLabel?: string;
  periodLabel?: string;
  className?: string;
};
```

It renders the `role="group"` with the two or three comboboxes, each with its own `aria-label`. Also export `snap` and `minuteStep` so both pickers share the rounding.

- [ ] **Step 2: Rewire `DateTimePicker` to use it**

Delete the inlined copies; import from `./time-select`. **No behaviour may change** — the existing 20 tests must pass untouched. If any needs editing, stop and report: that means the extraction altered behaviour.

- [ ] **Step 3: Verify**

```bash
cd /home/qyubit/Workspace/qyubit/sedjiwa-portal/ui
bunx vitest run date-time-picker.test
bun run typecheck && bun run lint
```
All 20 must pass with **no test edits**.

- [ ] **Step 4: Commit**

```
refactor(date-time-picker): extract the shared time control

DateTimeRangePicker needs the same locale-aware hour/minute/period logic;
duplicating it would guarantee drift.
```

---

### Task 2: DateTimePicker inline mode

- [ ] **Step 1: Split the props into a discriminated union**

Mirror how `Calendar` discriminates. Shared members stay shared:

```tsx
type DateTimePickerSharedProps = {
  value?: string | null;          // "YYYY-MM-DDTHH:mm"
  timeStep?: number;
  min?: string;                   // "YYYY-MM-DD"
  max?: string;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  todayLabel?: React.ReactNode;
  timeLabel?: React.ReactNode;
  hourLabel?: string;
  minuteLabel?: string;
  periodLabel?: string;
  className?: string;
};

type DateTimePickerModalProps = DateTimePickerSharedProps & {
  mode?: "modal";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires with local ISO when Apply is pressed. */
  onApply: (value: string) => void;
  title?: React.ReactNode;
  applyLabel?: React.ReactNode;
};

type DateTimePickerInlineProps = DateTimePickerSharedProps & {
  mode: "inline";
  /** Fires on every change — no Apply step, matching DatePicker. */
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  formatLabel?: (d: Date) => string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  name?: string;
};

export type DateTimePickerProps =
  | DateTimePickerModalProps
  | DateTimePickerInlineProps;
```

`mode` defaults to `"modal"`, so **every existing call site keeps working unchanged**. Verify that: the existing tests pass no `mode` and must not need editing.

- [ ] **Step 2: Implement the inline branch**

A trigger button styled with `FieldSurfaceVariants` exactly as `DatePicker`'s is, showing the formatted value or the placeholder, opening a `Popover` containing the same Calendar + time control the modal uses.

**No Apply button in inline mode** — every change calls `onValueChange` immediately, like `DatePicker`. There is no draft state to discard, so the open/close re-seed logic does not apply to this branch.

Read `date-picker.tsx` and copy its trigger structure, field styling, hidden-input handling and `formatLabel` default rather than inventing a parallel look.

- [ ] **Step 3: Tests**

Keep every existing modal test passing untouched. Add for inline:

- renders a trigger with the placeholder when there is no value
- renders the formatted value when there is one
- opens a popover on click, showing the calendar and the time group
- picking a day fires `onValueChange` with `"YYYY-MM-DDTHH:mm"`
- changing the hour fires `onValueChange` — the whole value, not just the date
- **no Apply button is rendered in inline mode** (guards against the modal footer leaking in)
- **the modal branch still renders Apply** (guards the reverse)

- [ ] **Step 4: Stories, verify, commit**

Add `Inline` and `InlineWithValue` stories. Run `bun run typecheck && bun run lint && bunx vitest run date-time-picker.test`.

---

### Task 3: DateTimeRangePicker

- [ ] **Step 1: Read `date-range-picker.tsx` end to end first**

The new component should be recognisably its sibling: same trigger, same field variants, same `placeholder`/`pendingSuffix`/`formatLabel` ideas, same hidden-input naming (`${name}[from]`, `${name}[to]`).

- [ ] **Step 2: Create the component**

```tsx
export type DateTimeRangeValue = { from: string | null; to: string | null }; // "YYYY-MM-DDTHH:mm"

export type DateTimeRangePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  value?: DateTimeRangeValue;
  onValueChange?: (value: DateTimeRangeValue) => void;
  timeStep?: number;
  min?: string;
  max?: string;
  placeholder?: string;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  numberOfMonths?: number;      // default 1 here; the panel is taller than DateRangePicker's
  startTimeLabel?: React.ReactNode;   // default "Start"
  endTimeLabel?: React.ReactNode;     // default "End"
  hourLabel?: string;
  minuteLabel?: string;
  periodLabel?: string;
  formatLabel?: (range: { from: Date | null; to: Date | null }) => string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  name?: string;
  className?: string;
};
```

Panel contents: `Calendar mode="range"`, then **two** time rows — one per end — each a `TimeSelect` from Task 1.

Behaviour to get right, and to test:

- Picking days drives `Calendar mode="range"`'s own from/to logic. Do not reimplement it.
- Each end keeps its own time. Picking a new `from` **preserves the existing from-time** rather than resetting it; same for `to`.
- A newly picked end with no prior time defaults to `09:00`, snapped to `timeStep`.
- The end time control is **disabled until `to` exists** — there is nothing to attach a time to.
- `onValueChange` fires on every change, date or time.
- If the result would be inverted (`to` earlier than `from` on the same day once times are applied), still emit it — validation is the caller's job, exactly as the app's existing "Waktu selesai harus setelah waktu mulai" message does. Do **not** silently clamp; a silent correction is worse than a visible error.

- [ ] **Step 3: Tests**

- trigger shows placeholder when empty, and a formatted range when set
- picking two days emits both ends with default times
- changing the start time preserves the start date and the whole end
- the end time control is disabled until an end date exists
- an inverted range is still emitted rather than swallowed
- hidden inputs are named `${name}[from]` / `${name}[to]` when `name` is given

- [ ] **Step 4: Barrel, export, stories**

`index.ts`, then `src/index.ts` following the existing export style. Stories: `Default`, `WithValue`, `Indonesian` (`locale="id-ID"`, 24-hour, Indonesian labels), `FifteenMinuteSteps`, `Bounded`.

- [ ] **Step 5: Verify and commit**

```bash
bun run typecheck && bun run lint && bun run build
bunx vitest run date-time-range-picker.test date-time-picker.test
```

---

### Task 4: Accessibility check

The a11y addon caught four critical violations last time, including one of ours. Do not skip this.

- [ ] Run `bun run storybook` **yourself is not allowed** — instead ask the coordinator to do the browser pass, or if you have browser tooling, check the Accessibility panel on the new `DateTimeRangePicker` stories and `DateTimePicker → Inline`.
- [ ] Expected: **0 violations**. Both new surfaces have multiple comboboxes, so every one needs its own accessible name, and each time group needs labelling — that is exactly what failed before.

---

### Task 5: Release 0.32.0

- [ ] `bun run contrast && bun run lint && bun run typecheck && bun run build`
- [ ] Unit project via a temporary jsdom-only vitest config inside the repo; expect the same 22 pre-existing `app-shell` failures and no new ones.
- [ ] Bump 0.31.0 → 0.32.0, commit, `git tag v0.32.0`.
- [ ] **Do not push the tag and do not publish** — CI has a publish job gated on `refs/tags/v*`. Creating the tag is inert; pushing may publish. Leave both to the user.

---

## Definition of done

- [ ] `TimeSelect` is shared; `DateTimePicker`'s 20 existing tests pass with **no edits**
- [ ] `DateTimePicker` defaults to modal, so no existing call site changes
- [ ] Inline mode renders a `DatePicker`-style field, no Apply, commits on change
- [ ] `DateTimeRangePicker` mirrors `DateRangePicker`'s trigger, keeps a time per end, disables the end time until an end exists, and does not silently clamp inverted ranges
- [ ] Both new surfaces: 0 accessibility violations
- [ ] `contrast`, `lint`, `typecheck`, `build` clean; no new unit-test failures
- [ ] 0.32.0 committed and tagged locally, **not pushed, not published**
