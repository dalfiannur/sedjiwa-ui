import * as React from "react";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  fieldSurfaceVariants,
  type FieldSurfaceVariants,
} from "../../lib/field-surface.variants";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Calendar, type DateRange } from "../date-picker/calendar";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type DateRangeValue = {
  from: string | null;
  to: string | null;
};

const EMPTY_RANGE: DateRangeValue = { from: null, to: null };

function parseISO(s: string | null | undefined): Date | null {
  if (!s || !ISO_DATE_RE.test(s)) return null;
  const parts = s.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y === undefined || m === undefined || d === undefined) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatRangeLabel(
  from: Date | null,
  to: Date | null,
  locale: string | undefined,
  placeholder: string,
  pendingSuffix: string,
): string {
  if (!from && !to) return placeholder;
  if (from && !to) {
    const fmt = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${fmt.format(from)} ${pendingSuffix}`;
  }
  if (!from && to) {
    const fmt = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${pendingSuffix} ${fmt.format(to)}`;
  }
  // Both set.
  const a = from!;
  const b = to!;
  const sameYear = a.getFullYear() === b.getFullYear();
  const sameMonth = sameYear && a.getMonth() === b.getMonth();
  if (sameMonth) {
    const dayFmt = new Intl.DateTimeFormat(locale, { day: "numeric" });
    const monthYearFmt = new Intl.DateTimeFormat(locale, {
      month: "short",
      year: "numeric",
    });
    return `${dayFmt.format(a)} – ${dayFmt.format(b)} ${monthYearFmt.format(b)}`;
  }
  if (sameYear) {
    const dayMonthFmt = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
    });
    const yearFmt = new Intl.DateTimeFormat(locale, { year: "numeric" });
    return `${dayMonthFmt.format(a)} – ${dayMonthFmt.format(b)} ${yearFmt.format(b)}`;
  }
  const fullFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${fullFmt.format(a)} – ${fullFmt.format(b)}`;
}

export type DateRangePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  /** Controlled value. Both ends ISO "YYYY-MM-DD" or null. */
  value?: DateRangeValue;
  /** Uncontrolled initial value. */
  defaultValue?: DateRangeValue;
  /** Fires when the user picks a day (either end of the range). */
  onValueChange?: (value: DateRangeValue) => void;
  /** ISO date; disables days before this date in the calendar. */
  min?: string;
  /** ISO date; disables days after this date in the calendar. */
  max?: string;
  /** Placeholder text shown when no range is selected. */
  placeholder?: string;
  /** Suffix shown after the start while the user is choosing the end. Default "→ …". */
  pendingSuffix?: string;
  /** BCP-47 locale tag for date formatting. */
  locale?: string;
  /** Day the week starts on. 0 = Sunday, 1 = Monday (default). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Inclusive lower bound for the year dropdown. */
  fromYear?: number;
  /** Inclusive upper bound for the year dropdown. */
  toYear?: number;
  /** Number of calendar months to render side-by-side. Default 2. */
  numberOfMonths?: number;
  /** Custom formatter for the trigger label. */
  formatLabel?: (range: { from: Date | null; to: Date | null }) => string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  /**
   * Name for the hidden form inputs. Two inputs are rendered as
   * `${name}[from]` and `${name}[to]` so common form serializers see a
   * nested object.
   */
  name?: string;
  className?: string;
};

const DEFAULT_PLACEHOLDER = "Pick a date range";
const DEFAULT_PENDING_SUFFIX = "→ …";

export const DateRangePicker = React.forwardRef<
  HTMLButtonElement,
  DateRangePickerProps
>(function DateRangePicker(props, ref) {
  const {
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    placeholder = DEFAULT_PLACEHOLDER,
    pendingSuffix = DEFAULT_PENDING_SUFFIX,
    locale,
    weekStartsOn = 1,
    fromYear,
    toYear,
    numberOfMonths = 2,
    formatLabel,
    size = "default",
    state: stateProp,
    loading = false,
    disabled = false,
    name,
    className,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    onBlur,
    onFocus,
    ...buttonProps
  } = props;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<DateRangeValue>(
    defaultValue ?? EMPTY_RANGE,
  );
  const currentValue = isControlled ? value : internalValue;

  const [open, setOpen] = React.useState(false);

  const resolvedState: NonNullable<FieldSurfaceVariants["state"]> =
    stateProp ??
    (ariaInvalid === true || ariaInvalid === "true" ? "error" : "default");

  const fromDate = React.useMemo(
    () => parseISO(currentValue.from),
    [currentValue.from],
  );
  const toDate = React.useMemo(
    () => parseISO(currentValue.to),
    [currentValue.to],
  );
  const minDate = React.useMemo(() => parseISO(min) ?? undefined, [min]);
  const maxDate = React.useMemo(() => parseISO(max) ?? undefined, [max]);

  const calendarValue = React.useMemo<DateRange>(
    () => ({ from: fromDate, to: toDate }),
    [fromDate, toDate],
  );

  const displayLabel = formatLabel
    ? formatLabel({ from: fromDate, to: toDate })
    : formatRangeLabel(fromDate, toDate, locale, placeholder, pendingSuffix);

  const isPlaceholder = !fromDate && !toDate;
  const isDisabled = disabled || loading;

  const handleSelect = (next: DateRange) => {
    const nextValue: DateRangeValue = {
      from: next.from ? formatISO(next.from) : null,
      to: next.to ? formatISO(next.to) : null,
    };
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    // Close once the range is complete; stay open while the user is still
    // choosing the end date.
    if (nextValue.from && nextValue.to) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={isDisabled ? undefined : setOpen}>
      <PopoverTrigger
        ref={ref}
        id={id}
        type="button"
        disabled={isDisabled}
        aria-invalid={resolvedState === "error" ? true : ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading || undefined}
        aria-label={
          buttonProps["aria-label"] ??
          (isPlaceholder ? placeholder : undefined)
        }
        data-slot="date-range-picker-trigger"
        data-state={resolvedState}
        data-loading={loading || undefined}
        data-placeholder={isPlaceholder || undefined}
        onBlur={onBlur}
        onFocus={onFocus}
        className={cn(
          fieldSurfaceVariants({ size, state: resolvedState }),
          "items-center gap-2 px-3 text-left",
          isPlaceholder && "text-muted-foreground",
          loading && "opacity-90",
          className,
        )}
        {...buttonProps}
      >
        {loading ? (
          <Loader2
            aria-hidden="true"
            className="size-4 shrink-0 animate-spin text-muted-foreground"
          />
        ) : (
          <CalendarIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        )}
        <span className="flex-1 truncate text-sm">{displayLabel}</span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-3"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Calendar
          mode="range"
          value={calendarValue}
          onSelect={handleSelect}
          min={minDate}
          max={maxDate}
          locale={locale}
          weekStartsOn={weekStartsOn}
          fromYear={fromYear}
          toYear={toYear}
          numberOfMonths={numberOfMonths}
          autoFocus
        />
      </PopoverContent>
      {name ? (
        <>
          <input
            type="hidden"
            name={`${name}[from]`}
            value={currentValue.from ?? ""}
          />
          <input
            type="hidden"
            name={`${name}[to]`}
            value={currentValue.to ?? ""}
          />
        </>
      ) : null}
    </Popover>
  );
});
DateRangePicker.displayName = "DateRangePicker";
