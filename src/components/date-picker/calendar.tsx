import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
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
};

export type CalendarProps = (SingleModeProps | RangeModeProps) & SharedProps;

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
  return props.value ?? new Date();
}

export function Calendar(props: CalendarProps) {
  const {
    min,
    max,
    weekStartsOn = 1,
    locale,
    fromYear,
    toYear,
    numberOfMonths = 1,
    showOutsideDays: showOutsideDaysProp,
    className,
    autoFocus = false,
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
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

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

  const handleDayClick = (date: Date) => {
    setFocusedDate(date);
    if (
      date < viewMonth ||
      date >= addMonths(viewMonth, numberOfMonths)
    ) {
      setViewMonth(startOfMonth(date));
    }
    if (mode === "range") {
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
  const years = React.useMemo(() => {
    const lo = Math.min(yearFromResolved, yearToResolved);
    const hi = Math.max(yearFromResolved, yearToResolved);
    return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  }, [yearFromResolved, yearToResolved]);

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
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4"
            >
              <ChevronLeft />
            </button>
          ) : (
            <span aria-hidden className="size-7 shrink-0" />
          )}
          <div
            className="flex flex-1 items-center justify-center gap-1"
            data-slot="calendar-label"
          >
            <span className="sr-only" aria-live="polite">
              {headerLabel}
            </span>
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
          </div>
          {isRight ? (
            <button
              type="button"
              data-slot="calendar-next"
              aria-label="Next month"
              disabled={nextDisabled}
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4"
            >
              <ChevronRight />
            </button>
          ) : (
            <span aria-hidden className="size-7 shrink-0" />
          )}
        </div>

        <div
          role="grid"
          aria-label={headerLabel}
          data-slot="calendar-grid"
          onKeyDown={handleKeyDown}
          className="grid grid-cols-7 gap-y-1"
        >
          {weekdayLabels.map((label) => (
            <div
              key={label}
              role="columnheader"
              className="text-center text-[0.7rem] font-medium text-muted-foreground uppercase"
            >
              {label}
            </div>
          ))}
          {days.map(({ date, outside }) => {
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
                className={cn(
                  "relative text-center",
                  (dayState.isInRange || dayState.isPreview) &&
                    "bg-accent first:rounded-l-md last:rounded-r-md",
                  dayState.isStart && "rounded-l-md bg-accent",
                  dayState.isEnd && "rounded-r-md bg-accent",
                  dayState.isPreview &&
                    !dayState.isInRange &&
                    "bg-accent/60",
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
                  aria-selected={dayState.selected || undefined}
                  aria-current={isToday ? "date" : undefined}
                  disabled={disabled}
                  tabIndex={isFocused ? 0 : -1}
                  onClick={() => {
                    if (disabled) return;
                    handleDayClick(date);
                  }}
                  onMouseEnter={
                    mode === "range" ? () => setHoveredDate(date) : undefined
                  }
                  onFocus={
                    mode === "range" ? () => setHoveredDate(date) : undefined
                  }
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-md text-sm font-normal transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "data-[outside]:text-muted-foreground/50",
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
      onMouseLeave={mode === "range" ? () => setHoveredDate(null) : undefined}
    >
      {Array.from({ length: numberOfMonths }, (_, i) => renderMonth(i))}
    </div>
  );
}
Calendar.displayName = "Calendar";
