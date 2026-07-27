# Calendar: Shift-click range selection for `mode="multiple"`

**Date:** 2026-07-28
**Package:** `@qyubit/sedjiwa-ui` — `src/components/date-picker/calendar.tsx`

## Problem

In `mode="multiple"`, users pick allowance days one click at a time. Selecting a
long contiguous span (e.g. a two-week assignment) means many individual clicks.
Users want to click a start day, then Shift-click an end day and have every day
in between selected automatically.

## Scope

Change is confined to `calendar.tsx`. Consumers using `<Calendar mode="multiple">`
(notably `uang-harian`'s `AssignmentForm.tsx`) need **no** code change — the
`value: Date[]` / `onSelect: (Date[]) => void` contract is unchanged, and
non-Shift clicks behave exactly as before. Backward compatible for all modes.

## Behavior

- **Plain click** — toggles the day (existing behavior) and records it as the
  **anchor**.
- **Shift-click with an anchor set** — emits the **union** of the current
  selection and *every calendar day* between anchor and the clicked day
  (inclusive), sorted ascending. Weekends are included. Days outside `min`/`max`
  are excluded.
- **Shift-click with no anchor** (e.g. first interaction on an edit form seeded
  with existing dates) — falls back to a plain toggle and sets the anchor.
- The anchor stays fixed at the last plain click, so a user can Shift-click a
  different end day to re-extend the span. Union semantics mean the span can grow
  but a smaller Shift-click never removes days.

## Hover preview

While Shift is held and the pointer is over a day in multiple mode, highlight the
anchor→hovered span using the same `bg-accent` styling `mode="range"` already
uses. `onMouseEnter` carries `e.shiftKey`, so no global key listener is needed.

## Implementation notes

1. `handleDayClick(date, shiftKey = false)`; day button
   `onClick={(e) => handleDayClick(date, e.shiftKey)}`.
2. `multiAnchorRef = useRef<Date | null>(null)` holds the anchor.
3. Multiple-mode branch: if `shiftKey && anchor`, build inclusive day range via
   `addDays`, filter by `inRange(min, max)`, union with current (dedupe by
   `isSameDay`), sort; else toggle as today and set anchor to `date`.
4. Extend `getDayState` for multiple mode to compute `isInRange`/`isPreview`
   between anchor and `hoveredDate` when a Shift-drag preview is active; wire
   `onMouseEnter`/`onFocus`/`onMouseLeave` for multiple mode like range mode.

## Tests (`calendar.test.tsx`)

- Plain click then Shift-click selects the inclusive span.
- Union preserves prior non-contiguous selected days.
- Reverse direction (Shift-click an earlier day) selects the span.
- Days outside `min`/`max` are excluded from the span.
- Shift-click with no prior anchor behaves as a plain toggle.

## Shipping to uang-harian

`ui` source is `0.15.0`; `uang-harian` depends on `0.14.0`. Build `ui`, bump
version, `bun publish`, then bump `uang-harian`'s dependency and install. A local
`bun link` can be used for a pre-publish smoke test. Publish/bump step confirmed
with the user before running.
