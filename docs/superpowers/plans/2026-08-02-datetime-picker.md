# DateTimePicker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `DateTimePicker` to sedjiwa-ui — a modal that picks a date *and* a time and commits both atomically on Apply.

**Architecture:** Composition, not reimplementation. The existing 723-line `Calendar` already handles the grid, weekday header, adjacent-month dimming, bounds and month navigation; `Modal` already provides the titled shell with a close button and a footer slot. `DateTimePicker` adds draft state, a time `Select`, a Today shortcut, and the Apply commit. `Calendar` gains one additive prop so its header can render as a static label.

**Tech Stack:** React 19, TypeScript, Tailwind v4, cva, Radix, Vitest, Storybook, bun.

---

## Design decisions (settled with the user — do not revisit)

| Decision | Choice |
|---|---|
| Colour | **`--primary`**, not the mockup's orange. No new tokens; inherits contrast already gated. |
| Interaction | **Modal with Apply.** Date+time commit together so a half-set filter never fires. |
| Time control | **Fixed interval presets** in a `Select`, `timeStep` prop, default 30 min. |
| Location | **sedjiwa-ui**, beside Calendar/DatePicker/DateRangePicker. Ships as 0.31.0. |
| Header | **New `headerVariant` on Calendar**: `"dropdowns"` (current, stays default) and `"label"` (the mockup's static month label). |

The reference mockup: titled modal with close X · `Today` shortcut left, month label centre, prev/next arrows right · Sun–Sat grid with adjacent days dimmed · selected day as a filled circle · a `Time` row with a dropdown · a full-width Apply button with a check icon.

## Repo rules

Read `CLAUDE.md`. The ones that matter here:

- **bun only.** CLI binaries are NOT on `$PATH` — `bun run <script>` / `bunx <bin>`.
- **`bun run test` (unfiltered) ABORTS** on a missing Playwright chromium build — pre-existing environment issue. Run specific files: `bunx vitest run <name>.test`.
- **Do NOT run `bun run storybook`** — long-lived server, it will hang you.
- Component folders hold `<name>.tsx`, `<name>.variants.ts` (only if there are cva variants), `<name>.test.tsx`, `<name>.stories.tsx`, `index.ts`. Export from `src/index.ts`.
- `cn` from `../../lib/cn`. Stories import from `@storybook/react-vite`.
- **Colour comes from tokens only.** No hex, no palette utilities. `--<tone>-text` for coloured text, `--<tone>` for fills — see `docs/theming.md`.

---

## File Structure

**Created:** `src/components/date-time-picker/{date-time-picker.tsx,date-time-picker.test.tsx,date-time-picker.stories.tsx,index.ts}`
**Modified:** `src/components/date-picker/calendar.tsx`, `src/components/date-picker/calendar.test.tsx`, `src/index.ts`

---

### Task 1: Calendar `headerVariant`

Additive only. `DatePicker` and `DateRangePicker` must render byte-identically afterwards.

- [ ] **Step 1: Write the failing test**

Append to `src/components/date-picker/calendar.test.tsx`:

```tsx
  it("renders month and year dropdowns by default", () => {
    const { container } = render(<Calendar mode="single" value={new Date(2028, 0, 10)} />);
    expect(container.querySelectorAll('[data-slot="select-trigger"]').length).toBeGreaterThan(0);
  });

  it("renders a static label instead of dropdowns when headerVariant is label", () => {
    const { container } = render(
      <Calendar mode="single" value={new Date(2028, 0, 10)} headerVariant="label" />
    );
    expect(container.querySelectorAll('[data-slot="select-trigger"]').length).toBe(0);
    expect(container.querySelector('[data-slot="calendar-label"]')).toHaveTextContent("January 2028");
  });

  it("keeps month navigation in label mode", () => {
    render(<Calendar mode="single" value={new Date(2028, 0, 10)} headerVariant="label" />);
    expect(screen.getByLabelText("Previous month")).toBeInTheDocument();
    expect(screen.getByLabelText("Next month")).toBeInTheDocument();
  });
```

Run `bunx vitest run calendar.test`. The first should pass, the other two fail.

- [ ] **Step 2: Implement**

Add to `SharedProps` in `calendar.tsx`:

```ts
  /**
   * Header presentation. `"dropdowns"` (default) renders month and year
   * Selects for jumping directly to a month. `"label"` renders a static
   * "January 2028" label with only the prev/next arrows.
   */
  headerVariant?: "dropdowns" | "label";
```

Default it to `"dropdowns"` where props are destructured. Inside the `[data-slot="calendar-label"]` container, branch: when `"label"`, render the existing `headerLabel` as visible text instead of the two `Select`s. **Keep the `sr-only` `aria-live` element in both branches** — it is what announces month changes to screen readers.

Do not touch the prev/next buttons, the grid, or any other behaviour.

- [ ] **Step 3: Verify no regression for existing consumers**

```bash
cd /home/qyubit/Workspace/qyubit/sedjiwa-portal/ui
bunx vitest run calendar.test date-picker.test date-range-picker.test
bun run typecheck && bun run lint
```

All must pass. `DatePicker`/`DateRangePicker` pass no `headerVariant`, so they keep dropdowns.

- [ ] **Step 4: Commit**

```
feat(calendar): add headerVariant for a static month label

DateTimePicker wants the label form; dropdowns stay the default so
DatePicker and DateRangePicker are unaffected.
```

---

### Task 2: The DateTimePicker component

- [ ] **Step 1: Create `src/components/date-time-picker/date-time-picker.tsx`**

```tsx
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button";
import { Calendar } from "../date-picker";
import { Modal } from "../modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

export type DateTimePickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Controlled starting value, local ISO `"YYYY-MM-DDTHH:mm"`, or null for none. */
  value?: string | null;
  /** Fires with local ISO `"YYYY-MM-DDTHH:mm"` when Apply is pressed. */
  onApply: (value: string) => void;
  title?: React.ReactNode;
  /** Minutes between time options. Default 30. */
  timeStep?: number;
  /** ISO date `"YYYY-MM-DD"`; days before this are disabled. */
  min?: string;
  /** ISO date `"YYYY-MM-DD"`; days after this are disabled. */
  max?: string;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  applyLabel?: React.ReactNode;
  todayLabel?: React.ReactNode;
  timeLabel?: React.ReactNode;
  className?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Minutes since midnight -> `"HH:mm"`. */
const toHm = (mins: number) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

/** Parses `"YYYY-MM-DDTHH:mm"`; returns null when absent or malformed. */
function parseValue(value: string | null | undefined) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  return {
    date: new Date(Number(y), Number(mo) - 1, Number(d)),
    minutes: Number(h) * 60 + Number(mi),
  };
}

/** Rounds to the nearest option so a value off the grid still selects something. */
function snap(minutes: number, step: number) {
  return Math.min(Math.round(minutes / step) * step, Math.floor((24 * 60 - 1) / step) * step);
}

export function DateTimePicker({
  open,
  onOpenChange,
  value,
  onApply,
  title = "Select date & time",
  timeStep = 30,
  min,
  max,
  locale,
  weekStartsOn = 0,
  applyLabel = "Apply",
  todayLabel = "Today",
  timeLabel = "Time",
  className,
}: DateTimePickerProps) {
  const parsed = parseValue(value);
  const [draftDate, setDraftDate] = React.useState<Date>(() => parsed?.date ?? new Date());
  const [draftMinutes, setDraftMinutes] = React.useState<number>(() =>
    snap(parsed?.minutes ?? 9 * 60, timeStep),
  );

  // Re-seed the draft each time the modal opens so a cancelled edit is discarded.
  React.useEffect(() => {
    if (!open) return;
    const next = parseValue(value);
    setDraftDate(next?.date ?? new Date());
    setDraftMinutes(snap(next?.minutes ?? 9 * 60, timeStep));
  }, [open, value, timeStep]);

  const options = React.useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" });
    const out: { minutes: number; label: string }[] = [];
    for (let m = 0; m < 24 * 60; m += timeStep) {
      const d = new Date(2000, 0, 1, Math.floor(m / 60), m % 60);
      out.push({ minutes: m, label: fmt.format(d) });
    }
    return out;
  }, [locale, timeStep]);

  const commit = () => {
    onApply(`${toIsoDate(draftDate)}T${toHm(draftMinutes)}`);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="md"
      footer={
        <Button className="w-full" onClick={commit} data-slot="date-time-picker-apply">
          {applyLabel}
          <Check />
        </Button>
      }
    >
      <div className={cn("flex flex-col gap-4", className)} data-slot="date-time-picker">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDraftDate(new Date())}
            data-slot="date-time-picker-today"
          >
            {todayLabel}
          </Button>
        </div>

        <Calendar
          mode="single"
          headerVariant="label"
          value={draftDate}
          onSelect={setDraftDate}
          min={min ? new Date(`${min}T00:00`) : undefined}
          max={max ? new Date(`${max}T00:00`) : undefined}
          locale={locale}
          weekStartsOn={weekStartsOn}
        />

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <span className="text-foreground text-sm font-medium">{timeLabel}</span>
          <Select
            value={String(draftMinutes)}
            onValueChange={(v) => setDraftMinutes(Number(v))}
          >
            <SelectTrigger className="w-[9rem]" data-slot="date-time-picker-time">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.minutes} value={String(o.minutes)}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Modal>
  );
}

DateTimePicker.displayName = "DateTimePicker";
```

Notes on choices made here, so they are not "corrected" later:

- **Draft state re-seeds on open**, so closing without Apply discards edits. That is the whole point of the Apply model.
- **`snap()`** rounds an off-grid incoming value (e.g. the mockup's `09:41` with a 30-minute step) to the nearest option, so the Select always has a matching item rather than rendering blank.
- **Labels are English defaults with props to override.** The library is locale-agnostic; the app passes Indonesian.
- **No `.variants.ts`** — there are no cva variants here, so per repo convention the file is not created.
- **Colour comes entirely from `Button`, `Calendar` and `Select`.** There is not one colour class in this file, which is why the mockup's orange does not appear.

- [ ] **Step 2: Barrel and export**

`src/components/date-time-picker/index.ts`:

```ts
export { DateTimePicker, type DateTimePickerProps } from "./date-time-picker";
```

Add to `src/index.ts` alongside the other date exports:

```ts
export { DateTimePicker } from "./components/date-time-picker";
export type { DateTimePickerProps } from "./components/date-time-picker";
```

Match the existing export style in that file — check whether it uses combined or separate value/type exports and follow it.

- [ ] **Step 3: Verify it compiles**

```bash
bun run typecheck && bun run lint && bun run build
```

If `Calendar` is not exported from `../date-picker`'s barrel, import it from wherever that folder does export it — check `src/components/date-picker/index.ts` rather than guessing.

---

### Task 3: Tests

- [ ] **Step 1: Create `src/components/date-time-picker/date-time-picker.test.tsx`**

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateTimePicker } from "./date-time-picker";

const noop = () => {};

describe("<DateTimePicker />", () => {
  it("renders nothing when closed", () => {
    render(<DateTimePicker open={false} onOpenChange={noop} onApply={noop} />);
    expect(screen.queryByText("Apply")).toBeNull();
  });

  it("shows the title, today shortcut and time control when open", () => {
    render(<DateTimePicker open onOpenChange={noop} onApply={noop} title="Filter Activity Date" />);
    expect(screen.getByText("Filter Activity Date")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
  });

  it("commits date and time together as local ISO on Apply", async () => {
    const onApply = vi.fn();
    render(
      <DateTimePicker open onOpenChange={noop} onApply={onApply} value="2028-01-10T09:30" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T09:30");
  });

  it("closes after Apply", async () => {
    const onOpenChange = vi.fn();
    render(
      <DateTimePicker open onOpenChange={onOpenChange} onApply={noop} value="2028-01-10T09:30" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("snaps an off-grid incoming time to the nearest step", async () => {
    const onApply = vi.fn();
    // 09:41 with the default 30-minute step rounds to 09:30
    render(
      <DateTimePicker open onOpenChange={noop} onApply={onApply} value="2028-01-10T09:41" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onApply).toHaveBeenCalledWith("2028-01-10T09:30");
  });

  it("does not fire onApply merely from opening", () => {
    const onApply = vi.fn();
    render(<DateTimePicker open onOpenChange={noop} onApply={onApply} value="2028-01-10T09:30" />);
    expect(onApply).not.toHaveBeenCalled();
  });

  it("accepts overridden labels", () => {
    render(
      <DateTimePicker
        open
        onOpenChange={noop}
        onApply={noop}
        applyLabel="Terapkan"
        todayLabel="Hari ini"
        timeLabel="Waktu"
      />,
    );
    expect(screen.getByText("Terapkan")).toBeInTheDocument();
    expect(screen.getByText("Hari ini")).toBeInTheDocument();
    expect(screen.getByText("Waktu")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run**

```bash
bunx vitest run date-time-picker.test
```

All must pass. If `userEvent` is not already a dependency, check how other interactive tests in this repo drive clicks (`grep -rn "userEvent\|fireEvent" src/components --include="*.test.tsx" | head`) and follow that pattern instead of adding a dependency.

The `snap` test is the important one — it is the behaviour that stops the Select rendering blank for a value like the mockup's 09:41.

---

### Task 4: Storybook

- [ ] **Step 1: Create `src/components/date-time-picker/date-time-picker.stories.tsx`**

Stories to include, each with local `useState` for `open` and `value`:

- **Default** — closed initially with a Button to open it, mirroring real usage.
- **AsDrawn** — `title="Filter Activity Date"`, `value="2028-01-10T09:30"`, open by default. This is the mockup.
- **Indonesian** — `applyLabel="Terapkan"`, `todayLabel="Hari ini"`, `timeLabel="Waktu"`, `locale="id-ID"`, showing the labels and 24-hour formatting.
- **FifteenMinuteSteps** — `timeStep={15}`.
- **Bounded** — `min`/`max` a few days either side of the value, showing disabled days.

Follow the existing story conventions: `Meta`/`StoryObj` from `@storybook/react-vite`, `tags: ["autodocs"]`, `parameters: { layout: "centered" }`.

- [ ] **Step 2: Verify it compiles**

```bash
bun run typecheck && bun run lint && bun run build
```

Do **not** run `bun run storybook`.

- [ ] **Step 3: Commit**

```
feat(date-time-picker): modal date+time picker committing atomically on Apply

Composes the existing Calendar and Modal rather than reimplementing a grid.
Time is a Select of fixed-interval presets (timeStep, default 30 min); an
off-grid incoming value snaps to the nearest option. Colour comes entirely
from Button/Calendar/Select, so there is no colour class in the component.
```

---

### Task 5: Release 0.31.0

- [ ] **Step 1: Full gates**

```bash
bun run contrast && bun run lint && bun run typecheck && bun run build
```

Then the unit project via a temporary jsdom-only vitest config inside the repo (see Phase 0's plan for the config). Report passed/failed counts — expect the same 22 pre-existing `app-shell` failures and no new ones.

- [ ] **Step 2: Bump, commit, tag locally**

`package.json` 0.30.0 → 0.31.0.

```
chore(release): 0.31.0

Adds DateTimePicker, a modal that picks a date and a time and commits both
atomically on Apply. Composes the existing Calendar and Modal.

Calendar gains an additive headerVariant prop ("dropdowns" default,
"label" new). DatePicker and DateRangePicker are unaffected.
```

```bash
git tag v0.31.0
```

**Do not push the tag and do not publish.** CI has a publish job gated on `refs/tags/v*` whose runner cannot be verified from the clone. Creating the tag is inert; pushing may publish. Leave both to the user.

---

## Definition of done

- [ ] `Calendar` accepts `headerVariant`; `DatePicker`/`DateRangePicker` render unchanged and their tests pass
- [ ] `DateTimePicker` renders the mockup's composition: title + close, Today shortcut, month label with arrows, day grid, Time select, full-width Apply with a check
- [ ] Apply commits `"YYYY-MM-DDTHH:mm"` and closes; closing without Apply discards the draft
- [ ] An off-grid time snaps to the nearest step rather than rendering an empty Select
- [ ] Zero colour classes in `date-time-picker.tsx` — everything inherits from Button/Calendar/Select
- [ ] Exported from `src/index.ts`; tests and stories exist per repo convention
- [ ] `contrast`, `lint`, `typecheck`, `build` clean; no new unit-test failures
- [ ] 0.31.0 committed and tagged locally, **not pushed, not published**
