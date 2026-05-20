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

export type CalendarProps = {
  /** Currently selected day, or null for none. */
  value?: Date | null;
  /** Fires when the user picks a day. */
  onSelect?: (value: Date) => void;
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
  className?: string;
  /** Auto-focus the first focusable day after mount (used when opening in a popover). */
  autoFocus?: boolean;
};

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
  // Pick any known Sunday as the anchor (1970-01-04 is a Sunday).
  const sunday = new Date(1970, 0, 4);
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: WEEK_LENGTH }, (_, i) =>
    fmt.format(addDays(sunday, (i + weekStartsOn) % WEEK_LENGTH)),
  );
}

export function Calendar({
  value,
  onSelect,
  min,
  max,
  weekStartsOn = 1,
  locale,
  fromYear,
  toYear,
  className,
  autoFocus = false,
}: CalendarProps) {
  const today = React.useMemo(() => startOfDay(new Date()), []);
  const initialAnchor = value ?? today;
  const [viewMonth, setViewMonth] = React.useState<Date>(() =>
    startOfMonth(initialAnchor),
  );
  const [focusedDate, setFocusedDate] = React.useState<Date>(() =>
    clampToRange(initialAnchor, min, max),
  );

  // When `value` changes externally to a different month, follow it.
  const prevValueRef = React.useRef(value);
  React.useEffect(() => {
    if (value && value !== prevValueRef.current) {
      setViewMonth(startOfMonth(value));
      setFocusedDate(value);
    }
    prevValueRef.current = value;
  }, [value]);

  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const shouldFocusRef = React.useRef(autoFocus);
  const keyboardActiveRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    // Auto-focus on mount when requested (popover open).
    // Re-focus when keyboard navigation moved the roving target.
    const shouldFocus =
      shouldFocusRef.current ||
      (keyboardActiveRef.current && grid.contains(document.activeElement));
    if (!shouldFocus) return;
    const target = grid.querySelector<HTMLButtonElement>(
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
    if (!isSameMonth(clamped, viewMonth)) {
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
        next = addDays(focusedDate, -(focusedDate.getDay() - weekStartsOn + WEEK_LENGTH) % WEEK_LENGTH);
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

  const grid = React.useMemo(
    () => buildGrid(viewMonth, weekStartsOn),
    [viewMonth, weekStartsOn],
  );
  const weekdayLabels = React.useMemo(
    () => getWeekdayLabels(weekStartsOn, locale),
    [weekStartsOn, locale],
  );
  const headerLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(viewMonth),
    [viewMonth, locale],
  );

  const monthNames = React.useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2000, i, 1)));
  }, [locale]);

  const yearFrom = fromYear ?? min?.getFullYear() ?? today.getFullYear() - 100;
  const yearTo = toYear ?? max?.getFullYear() ?? today.getFullYear() + 50;
  const years = React.useMemo(() => {
    const lo = Math.min(yearFrom, yearTo);
    const hi = Math.max(yearFrom, yearTo);
    return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  }, [yearFrom, yearTo]);

  const viewYear = viewMonth.getFullYear();
  const viewMonthIdx = viewMonth.getMonth();

  // A month index is "disabled" only if every day in (viewYear, m) lies outside [min, max].
  const isMonthDisabled = (m: number): boolean => {
    const firstDay = new Date(viewYear, m, 1);
    const lastDay = new Date(viewYear, m + 1, 0);
    if (min && lastDay < startOfDay(min)) return true;
    if (max && firstDay > startOfDay(max)) return true;
    return false;
  };

  const prevDisabled = !inRange(
    addDays(startOfMonth(viewMonth), -1),
    min,
    max,
  );
  const nextDisabled = !inRange(addMonths(viewMonth, 1), min, max);

  return (
    <div
      data-slot="calendar"
      className={cn("flex flex-col gap-3 select-none", className)}
    >
      <div className="flex items-center justify-between gap-1">
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
        <div
          className="flex flex-1 items-center justify-center gap-1"
          data-slot="calendar-label"
        >
          <span className="sr-only" aria-live="polite">
            {headerLabel}
          </span>
          <Select
            value={String(viewMonthIdx)}
            onValueChange={(v) =>
              setViewMonth(clampViewMonth(viewYear, Number(v), min, max))
            }
          >
            <SelectTrigger
              size="sm"
              data-slot="calendar-month-select"
              aria-label="Month"
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
            value={String(viewYear)}
            onValueChange={(v) =>
              setViewMonth(
                clampViewMonth(Number(v), viewMonthIdx, min, max),
              )
            }
          >
            <SelectTrigger
              size="sm"
              data-slot="calendar-year-select"
              aria-label="Year"
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
      </div>

      <div
        ref={gridRef}
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
        {grid.map(({ date, outside }) => {
          const disabled = !inRange(date, min, max);
          const selected = value ? isSameDay(date, value) : false;
          const isToday = isSameDay(date, today);
          const isFocused = isSameDay(date, focusedDate);
          return (
            <div role="gridcell" key={date.toISOString()} className="text-center">
              <button
                type="button"
                role="button"
                data-slot="calendar-day"
                data-outside={outside || undefined}
                data-selected={selected || undefined}
                data-today={isToday || undefined}
                data-focused={isFocused || undefined}
                aria-selected={selected || undefined}
                aria-current={isToday ? "date" : undefined}
                disabled={disabled}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => {
                  if (disabled) return;
                  setFocusedDate(date);
                  if (outside) setViewMonth(startOfMonth(date));
                  onSelect?.(date);
                }}
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
Calendar.displayName = "Calendar";
