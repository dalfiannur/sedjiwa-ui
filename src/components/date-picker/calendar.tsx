import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { DEFAULT_LOCALE } from "../../lib/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

const WEEK_LENGTH = 7;
const GRID_ROWS = 6;
const GRID_CELLS = WEEK_LENGTH * GRID_ROWS;

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

type SingleModeProps = {
  mode?: "single";
  value?: Date | null;
  onSelect?: (value: Date) => void;
};

type RangeModeProps = {
  mode: "range";
  value?: DateRange | null;
  onSelect?: (value: DateRange) => void;
};

type MultipleModeProps = {
  mode: "multiple";
  value?: Date[];
  onSelect?: (value: Date[]) => void;
};

type SharedProps = {
  /** Disable days before this date (inclusive). */
  min?: Date;
  /** Disable days after this date (inclusive). */
  max?: Date;
  /** 0 = Sunday, 1 = Monday (default). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** BCP-47 locale tag for header / weekday labels. */
  locale?: string;
  /**
   * Inclusive bounds for the year dropdown. Defaults derive from `min`/`max`
   * when set, otherwise `today.year - 100` … `today.year + 50` (birthday-friendly).
   */
  fromYear?: number;
  toYear?: number;
  /** Number of month grids to render side-by-side. Default 1. */
  numberOfMonths?: number;
  /** Show days from adjacent months in each grid. Default: true when numberOfMonths === 1, false otherwise. */
  showOutsideDays?: boolean;
  className?: string;
  /** Auto-focus the first focusable day after mount (used when opening in a popover). */
  autoFocus?: boolean;
  /**
   * Header presentation. `"dropdowns"` (default) renders month and year
   * Selects for jumping directly to a month. `"label"` renders a static
   * "January 2028" label with only the prev/next arrows.
   */
  headerVariant?: "dropdowns" | "label";
  /** Day cell shape. `"rounded"` (default) or `"circle"`. */
  dayShape?: "rounded" | "circle";
  /** Weekday heading case. `"upper"` (default, SUN) or `"title"` (Sun). */
  weekdayCase?: "upper" | "title";
  /**
   * Where the prev/next month arrows sit. `"edges"` (default) pushes them to
   * either side of the header; `"grouped"` puts both together on the right.
   */
  navPlacement?: "edges" | "grouped";
};

export type CalendarProps = (SingleModeProps | RangeModeProps | MultipleModeProps) &
  SharedProps;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function addYears(d: Date, n: number): Date {
  return new Date(d.getFullYear() + n, d.getMonth(), 1);
}
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function inRange(d: Date, min?: Date, max?: Date): boolean {
  const day = startOfDay(d);
  if (min && day < startOfDay(min)) return false;
  if (max && day > startOfDay(max)) return false;
  return true;
}
function clampToRange(d: Date, min?: Date, max?: Date): Date {
  if (min && startOfDay(d) < startOfDay(min)) return startOfDay(min);
  if (max && startOfDay(d) > startOfDay(max)) return startOfDay(max);
  return d;
}
function clampViewMonth(y: number, m: number, min?: Date, max?: Date): Date {
  const candidate = new Date(y, m, 1);
  if (min) {
    const minMonth = startOfMonth(min);
    if (candidate < minMonth) return minMonth;
  }
  if (max) {
    const maxMonth = startOfMonth(max);
    if (candidate > maxMonth) return maxMonth;
  }
  return candidate;
}

function buildGrid(
  viewMonth: Date,
  weekStartsOn: number,
): { date: Date; outside: boolean }[] {
  const firstOfMonth = startOfMonth(viewMonth);
  const leadingOffset = (firstOfMonth.getDay() - weekStartsOn + WEEK_LENGTH) % WEEK_LENGTH;
  const gridStart = addDays(firstOfMonth, -leadingOffset);
  return Array.from({ length: GRID_CELLS }, (_, i) => {
    const date = addDays(gridStart, i);
    return { date, outside: !isSameMonth(date, viewMonth) };
  });
}

function getWeekdayLabels(
  weekStartsOn: number,
  locale: string | undefined,
): string[] {
  const sunday = new Date(1970, 0, 4); // known Sunday anchor
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: WEEK_LENGTH }, (_, i) =>
    fmt.format(addDays(sunday, (i + weekStartsOn) % WEEK_LENGTH)),
  );
}

function getInitialAnchor(props: CalendarProps): Date {
  if (props.mode === "range") {
    return props.value?.from ?? props.value?.to ?? new Date();
  }
  if (props.mode === "multiple") {
    const first = props.value?.length
      ? [...props.value].sort((a, b) => a.getTime() - b.getTime())[0]!
      : undefined;
    return first ?? new Date();
  }
  return props.value ?? new Date();
}

export function Calendar(props: CalendarProps) {
  const {
    min,
    max,
    weekStartsOn = 1,
    locale = DEFAULT_LOCALE,
    fromYear,
    toYear,
    numberOfMonths = 1,
    showOutsideDays: showOutsideDaysProp,
    className,
    autoFocus = false,
    headerVariant = "dropdowns",
    dayShape = "rounded",
    weekdayCase = "upper",
    navPlacement = "edges",
  } = props;
  const mode = props.mode ?? "single";
  const showOutsideDays = showOutsideDaysProp ?? numberOfMonths === 1;

  const today = React.useMemo(() => startOfDay(new Date()), []);
  const initialAnchor = React.useMemo(
    () => startOfDay(getInitialAnchor(props)),
    // intentional: only the initial render matters for anchoring; later
    // value changes flow through the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [viewMonth, setViewMonth] = React.useState<Date>(() =>
    startOfMonth(initialAnchor),
  );
  const [focusedDate, setFocusedDate] = React.useState<Date>(() =>
    clampToRange(initialAnchor, min, max),
  );
  // Label-mode month/year chooser. The label header has no year control of its
  // own, so without this a mouse user can only reach another year by clicking
  // the month arrow twelve times. `pickerYear` is the year being browsed,
  // which is not yet the selected one.
  const [monthPickerOpen, setMonthPickerOpen] = React.useState(false);
  const [pickerYear, setPickerYear] = React.useState<number>(() =>
    startOfMonth(initialAnchor).getFullYear(),
  );
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);
  // Anchor for Shift-click range selection in multiple mode: the last plain
  // (non-Shift) click. Stays fixed so the user can re-extend from the same day.
  const multiAnchorRef = React.useRef<Date | null>(null);
  // The day currently hovered while Shift is held in multiple mode, used to
  // preview the span before committing.
  const [shiftHover, setShiftHover] = React.useState<Date | null>(null);

  // Follow external value changes (controlled mode).
  const singleValue = mode === "single" ? (props as SingleModeProps).value : undefined;
  const prevSingleRef = React.useRef<Date | null | undefined>(singleValue);
  React.useEffect(() => {
    if (mode !== "single") return;
    if (singleValue && singleValue !== prevSingleRef.current) {
      setViewMonth(startOfMonth(singleValue));
      setFocusedDate(singleValue);
    }
    prevSingleRef.current = singleValue;
  }, [mode, singleValue]);

  const rangeFrom =
    mode === "range" ? (props as RangeModeProps).value?.from ?? null : null;
  const prevRangeFromRef = React.useRef<Date | null>(rangeFrom);
  React.useEffect(() => {
    if (mode !== "range") return;
    if (rangeFrom && rangeFrom !== prevRangeFromRef.current) {
      setViewMonth(startOfMonth(rangeFrom));
      setFocusedDate(rangeFrom);
    }
    prevRangeFromRef.current = rangeFrom;
  }, [mode, rangeFrom]);

  const multiValue =
    mode === "multiple" ? (props as MultipleModeProps).value : undefined;
  const prevMultiCountRef = React.useRef<number>(multiValue?.length ?? 0);
  React.useEffect(() => {
    if (mode !== "multiple") return;
    const count = multiValue?.length ?? 0;
    if (count > 0 && prevMultiCountRef.current === 0) {
      const first = [...multiValue!].sort((a, b) => a.getTime() - b.getTime())[0]!;
      setViewMonth(startOfMonth(first));
      setFocusedDate(first);
    }
    prevMultiCountRef.current = count;
  }, [mode, multiValue]);

  const calendarRef = React.useRef<HTMLDivElement | null>(null);
  const shouldFocusRef = React.useRef(autoFocus);
  const keyboardActiveRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const root = calendarRef.current;
    if (!root) return;
    const shouldFocus =
      shouldFocusRef.current ||
      (keyboardActiveRef.current && root.contains(document.activeElement));
    if (!shouldFocus) return;
    const target = root.querySelector<HTMLButtonElement>(
      'button[data-focused="true"]',
    );
    if (target && target !== document.activeElement) target.focus();
    shouldFocusRef.current = false;
    keyboardActiveRef.current = false;
  }, [focusedDate, viewMonth]);

  const moveFocus = (next: Date) => {
    const clamped = clampToRange(next, min, max);
    keyboardActiveRef.current = true;
    setFocusedDate(clamped);
    if (
      clamped < viewMonth ||
      clamped >= addMonths(viewMonth, numberOfMonths)
    ) {
      setViewMonth(startOfMonth(clamped));
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    let next: Date | null = null;
    switch (e.key) {
      case "ArrowLeft":
        next = addDays(focusedDate, -1);
        break;
      case "ArrowRight":
        next = addDays(focusedDate, 1);
        break;
      case "ArrowUp":
        next = addDays(focusedDate, -WEEK_LENGTH);
        break;
      case "ArrowDown":
        next = addDays(focusedDate, WEEK_LENGTH);
        break;
      case "Home":
        next = addDays(
          focusedDate,
          -((focusedDate.getDay() - weekStartsOn + WEEK_LENGTH) % WEEK_LENGTH),
        );
        break;
      case "End": {
        const dow = (focusedDate.getDay() - weekStartsOn + WEEK_LENGTH) % WEEK_LENGTH;
        next = addDays(focusedDate, WEEK_LENGTH - 1 - dow);
        break;
      }
      case "PageUp":
        next = e.shiftKey
          ? addYears(focusedDate, -1)
          : addMonths(focusedDate, -1);
        break;
      case "PageDown":
        next = e.shiftKey
          ? addYears(focusedDate, 1)
          : addMonths(focusedDate, 1);
        break;
      default:
        return;
    }
    e.preventDefault();
    moveFocus(next);
  };

  const handleDayClick = (date: Date, shiftKey = false) => {
    setFocusedDate(date);
    if (
      date < viewMonth ||
      date >= addMonths(viewMonth, numberOfMonths)
    ) {
      setViewMonth(startOfMonth(date));
    }
    if (mode === "multiple") {
      const cur = (props as MultipleModeProps).value ?? [];
      const anchor = multiAnchorRef.current;
      if (shiftKey && anchor) {
        // Union the current selection with every in-range day between the
        // anchor and the Shift-clicked day (inclusive). Anchor is left in
        // place so the user can Shift-click again to re-extend the span.
        const lo = startOfDay(anchor <= date ? anchor : date);
        const hi = startOfDay(anchor <= date ? date : anchor);
        const merged = [...cur];
        for (let d = lo; d.getTime() <= hi.getTime(); d = addDays(d, 1)) {
          if (inRange(d, min, max) && !merged.some((x) => isSameDay(x, d))) {
            merged.push(startOfDay(d));
          }
        }
        merged.sort((a, b) => a.getTime() - b.getTime());
        setShiftHover(null);
        (props as MultipleModeProps).onSelect?.(merged);
      } else {
        const exists = cur.some((d) => isSameDay(d, date));
        const next = exists
          ? cur.filter((d) => !isSameDay(d, date))
          : [...cur, date].sort((a, b) => a.getTime() - b.getTime());
        multiAnchorRef.current = date;
        setShiftHover(null);
        (props as MultipleModeProps).onSelect?.(next);
      }
    } else if (mode === "range") {
      const cur = (props as RangeModeProps).value ?? { from: null, to: null };
      let next: DateRange;
      if (cur.from && !cur.to) {
        next = date < cur.from
          ? { from: date, to: cur.from }
          : { from: cur.from, to: date };
      } else {
        next = { from: date, to: null };
      }
      setHoveredDate(null);
      (props as RangeModeProps).onSelect?.(next);
    } else {
      (props as SingleModeProps).onSelect?.(date);
    }
  };

  const weekdayLabels = React.useMemo(
    () => getWeekdayLabels(weekStartsOn, locale),
    [weekStartsOn, locale],
  );

  const monthNames = React.useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2000, i, 1)));
  }, [locale]);

  const yearFromResolved =
    fromYear ?? min?.getFullYear() ?? today.getFullYear() - 100;
  const yearToResolved =
    toYear ?? max?.getFullYear() ?? today.getFullYear() + 50;
  const yearLo = Math.min(yearFromResolved, yearToResolved);
  const yearHi = Math.max(yearFromResolved, yearToResolved);
  const years = React.useMemo(
    () => Array.from({ length: yearHi - yearLo + 1 }, (_, i) => yearLo + i),
    [yearLo, yearHi],
  );

  // Computes day-cell state for range mode.
  const rangeValue =
    mode === "range" ? (props as RangeModeProps).value ?? null : null;
  const rangeStart = rangeValue?.from ?? null;
  const rangeEnd = rangeValue?.to ?? null;
  const previewEnd =
    mode === "range" && rangeStart && !rangeEnd && hoveredDate && hoveredDate > rangeStart
      ? hoveredDate
      : null;

  function getDayState(date: Date): {
    selected: boolean;
    isStart: boolean;
    isEnd: boolean;
    isInRange: boolean;
    isPreview: boolean;
  } {
    if (mode === "multiple") {
      const v = (props as MultipleModeProps).value ?? [];
      const selected = v.some((d) => isSameDay(d, date));
      const anchor = multiAnchorRef.current;
      if (shiftHover && anchor) {
        const lo = startOfDay(anchor <= shiftHover ? anchor : shiftHover).getTime();
        const hi = startOfDay(anchor <= shiftHover ? shiftHover : anchor).getTime();
        const dayTs = startOfDay(date).getTime();
        if (dayTs >= lo && dayTs <= hi) {
          return {
            selected,
            isStart: dayTs === lo,
            isEnd: dayTs === hi,
            isInRange: dayTs > lo && dayTs < hi,
            isPreview: !selected,
          };
        }
      }
      return {
        selected,
        isStart: selected,
        isEnd: selected,
        isInRange: false,
        isPreview: false,
      };
    }
    if (mode === "single") {
      const v = (props as SingleModeProps).value ?? null;
      const selected = v ? isSameDay(date, v) : false;
      return {
        selected,
        isStart: selected,
        isEnd: selected,
        isInRange: false,
        isPreview: false,
      };
    }
    const dayTs = startOfDay(date).getTime();
    const isStart = rangeStart ? isSameDay(date, rangeStart) : false;
    const isEnd = rangeEnd ? isSameDay(date, rangeEnd) : false;
    const isInRange =
      rangeStart != null && rangeEnd != null
        ? dayTs > startOfDay(rangeStart).getTime() &&
          dayTs < startOfDay(rangeEnd).getTime()
        : false;
    const isPreview =
      rangeStart != null && previewEnd != null && rangeEnd == null
        ? dayTs > startOfDay(rangeStart).getTime() &&
          dayTs <= startOfDay(previewEnd).getTime()
        : false;
    return {
      selected: isStart || isEnd,
      isStart,
      isEnd,
      isInRange,
      isPreview,
    };
  }

  function renderMonth(offset: number) {
    const monthAtOffset = addMonths(viewMonth, offset);
    const monthYear = monthAtOffset.getFullYear();
    const monthIdx = monthAtOffset.getMonth();
    const days = buildGrid(monthAtOffset, weekStartsOn);
    const headerLabel = new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(monthAtOffset);

    const isLeft = offset === 0;
    const isRight = offset === numberOfMonths - 1;

    const isMonthDisabled = (m: number): boolean => {
      const firstDay = new Date(monthYear, m, 1);
      const lastDay = new Date(monthYear, m + 1, 0);
      if (min && lastDay < startOfDay(min)) return true;
      if (max && firstDay > startOfDay(max)) return true;
      return false;
    };

    const prevDisabled = !inRange(
      addDays(startOfMonth(viewMonth), -1),
      min,
      max,
    );
    const nextDisabled = !inRange(
      addMonths(viewMonth, numberOfMonths),
      min,
      max,
    );

    return (
      <div key={offset} className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-1">
          {isLeft ? (
            <button
              type="button"
              data-slot="calendar-prev"
              aria-label="Previous month"
              disabled={prevDisabled}
              onClick={() => setViewMonth((m) => addMonths(m, -1))}
              className={cn(
                "inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
                navPlacement === "grouped" && "order-2",
              )}
            >
              <ChevronLeft />
            </button>
          ) : (
            <span aria-hidden className="size-7 shrink-0" />
          )}
          <div
            className={cn(
              "flex flex-1 items-center justify-center gap-1",
              navPlacement === "grouped" && "order-1 justify-center",
            )}
            data-slot="calendar-label"
          >
            <span className="sr-only" aria-live="polite">
              {headerLabel}
            </span>
            {headerVariant === "label" ? (
              <button
                type="button"
                data-slot="calendar-label-trigger"
                aria-expanded={monthPickerOpen}
                onClick={() => {
                  setPickerYear(monthAtOffset.getFullYear());
                  setMonthPickerOpen((o) => !o);
                }}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium capitalize transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] [&_svg]:size-4"
              >
                {headerLabel}
                <ChevronDown aria-hidden />
              </button>
            ) : (
              <>
                <Select
                  value={String(monthIdx)}
                  onValueChange={(v) => {
                    const desired = new Date(monthYear, Number(v), 1);
                    setViewMonth(
                      clampViewMonth(
                        desired.getFullYear(),
                        desired.getMonth() - offset,
                        min,
                        max,
                      ),
                    );
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    data-slot="calendar-month-select"
                    aria-label={
                      numberOfMonths > 1
                        ? offset === 0
                          ? "Start month"
                          : "End month"
                        : "Month"
                    }
                    className="h-7 w-[7.5rem] gap-1 px-2 text-xs capitalize"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {monthNames.map((name, i) => (
                      <SelectItem
                        key={i}
                        value={String(i)}
                        disabled={isMonthDisabled(i)}
                        className="capitalize"
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(monthYear)}
                  onValueChange={(v) =>
                    setViewMonth(
                      clampViewMonth(Number(v), monthIdx - offset, min, max),
                    )
                  }
                >
                  <SelectTrigger
                    size="sm"
                    data-slot="calendar-year-select"
                    aria-label={
                      numberOfMonths > 1
                        ? offset === 0
                          ? "Start year"
                          : "End year"
                        : "Year"
                    }
                    className="h-7 w-[4.5rem] gap-1 px-2 text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          {isRight ? (
            <button
              type="button"
              data-slot="calendar-next"
              aria-label="Next month"
              disabled={nextDisabled}
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className={cn(
                "inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
                navPlacement === "grouped" && "order-3",
              )}
            >
              <ChevronRight />
            </button>
          ) : (
            <span aria-hidden className="size-7 shrink-0" />
          )}
        </div>

        {monthPickerOpen ? (
          <div data-slot="calendar-month-picker" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous year"
                disabled={pickerYear <= yearLo}
                onClick={() => setPickerYear((y) => y - 1)}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4"
              >
                <ChevronLeft />
              </button>
              <span aria-live="polite" className="text-sm font-medium">
                {pickerYear}
              </span>
              <button
                type="button"
                aria-label="Next year"
                disabled={pickerYear >= yearHi}
                onClick={() => setPickerYear((y) => y + 1)}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4"
              >
                <ChevronRight />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {monthNames.map((name, i) => {
                // A month is reachable if any part of it falls inside min/max.
                const monthEnd = addDays(startOfMonth(new Date(pickerYear, i + 1, 1)), -1);
                const outOfRange =
                  (min && monthEnd < startOfMonth(min)) ||
                  (max && new Date(pickerYear, i, 1) > max);
                return (
                  <button
                    key={name}
                    type="button"
                    data-slot="calendar-month-option"
                    data-selected={
                      (i === monthIdx && pickerYear === monthYear) || undefined
                    }
                    disabled={outOfRange || undefined}
                    onClick={() => {
                      setViewMonth(clampViewMonth(pickerYear, i - offset, min, max));
                      setMonthPickerOpen(false);
                    }}
                    className="rounded-md px-2 py-2 text-sm capitalize transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] data-[selected]:bg-primary data-[selected]:text-primary-foreground disabled:pointer-events-none disabled:opacity-30"
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
        <div
          role="grid"
          aria-label={headerLabel}
          aria-multiselectable={mode === "multiple" ? true : undefined}
          data-slot="calendar-grid"
          onKeyDown={handleKeyDown}
          className="grid grid-cols-7 gap-y-1"
        >
          {/* `contents` keeps the row out of the layout so the parent's
              grid-cols-7 still lays out the cells directly, while ARIA still
              sees the grid > row > cell structure it requires. Without these
              rows axe reports aria-required-children on the grid and
              aria-required-parent on every cell. */}
          <div role="row" className="contents">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                role="columnheader"
                className={cn(
                  "text-center text-[0.7rem] font-medium text-muted-foreground",
                  weekdayCase === "upper" && "uppercase",
                )}
              >
                {label}
              </div>
            ))}
          </div>
          {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
            <div role="row" className="contents" key={weekIndex}>
              {days.slice(weekIndex * 7, weekIndex * 7 + 7).map(({ date, outside }) => {
            const disabled = !inRange(date, min, max);
            const isToday = isSameDay(date, today);
            const isFocused = isSameDay(date, focusedDate);
            const dayState = getDayState(date);
            const hidden = outside && !showOutsideDays;

            if (hidden) {
              return (
                <div
                  role="gridcell"
                  key={date.toISOString()}
                  aria-hidden="true"
                  className="size-8"
                />
              );
            }

            return (
              <div
                role="gridcell"
                key={date.toISOString()}
                // aria-selected belongs here, not on the inner button — it is
                // not an allowed attribute on role=button.
                aria-selected={dayState.selected || undefined}
                className={cn(
                  "relative text-center",
                  // The cell background is the connecting band between the ends
                  // of a range. Single mode has no band — it reports
                  // isStart/isEnd on the one selected day purely so the range
                  // styling hooks stay consistent — and painting it there puts
                  // a second, differently-shaped background behind the day
                  // button. Invisible while both were rounded-md; obvious the
                  // moment the button became a circle.
                  mode !== "single" && [
                    (dayState.isInRange || dayState.isPreview) &&
                      "bg-accent first:rounded-l-md last:rounded-r-md",
                    dayState.isStart && "rounded-l-md bg-accent",
                    dayState.isEnd && "rounded-r-md bg-accent",
                    dayState.isPreview && !dayState.isInRange && "bg-accent/60",
                  ],
                )}
              >
                <button
                  type="button"
                  data-slot="calendar-day"
                  data-outside={outside || undefined}
                  data-selected={dayState.selected || undefined}
                  data-today={isToday || undefined}
                  data-focused={isFocused || undefined}
                  data-in-range={dayState.isInRange || undefined}
                  data-range-start={dayState.isStart || undefined}
                  data-range-end={dayState.isEnd || undefined}
                  data-preview={dayState.isPreview || undefined}
                  aria-current={isToday ? "date" : undefined}
                  disabled={disabled}
                  tabIndex={isFocused ? 0 : -1}
                  onClick={(e) => {
                    if (disabled) return;
                    handleDayClick(date, e.shiftKey);
                  }}
                  onMouseEnter={
                    mode === "range"
                      ? () => setHoveredDate(date)
                      : mode === "multiple"
                        ? (e) =>
                            setShiftHover(
                              e.shiftKey && multiAnchorRef.current
                                ? date
                                : null,
                            )
                        : undefined
                  }
                  onFocus={
                    mode === "range" ? () => setHoveredDate(date) : undefined
                  }
                  className={cn(
                    "inline-flex size-8 items-center justify-center text-sm font-normal transition-colors",
                    dayShape === "circle" ? "rounded-full" : "rounded-md",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    // Not muted-foreground/50: outside days remain clickable,
                    // so they are interactive text at 4.5:1, and no alpha that
                    // still reads as "dimmed" clears that. See --calendar-outside.
                    "data-[outside]:text-calendar-outside",
                    "data-[today]:underline data-[today]:underline-offset-4",
                    "data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground",
                    "disabled:pointer-events-none disabled:opacity-30 disabled:line-through",
                  )}
                >
                  {date.getDate()}
                </button>
              </div>
            );
              })}
            </div>
          ))}
        </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={calendarRef}
      data-slot="calendar"
      data-mode={mode}
      className={cn(
        "select-none",
        numberOfMonths > 1
          ? "flex flex-col gap-4 sm:flex-row sm:gap-6"
          : "flex flex-col gap-3",
        className,
      )}
      onMouseLeave={
        mode === "range"
          ? () => setHoveredDate(null)
          : mode === "multiple"
            ? () => setShiftHover(null)
            : undefined
      }
    >
      {Array.from({ length: numberOfMonths }, (_, i) => renderMonth(i))}
    </div>
  );
}
Calendar.displayName = "Calendar";
