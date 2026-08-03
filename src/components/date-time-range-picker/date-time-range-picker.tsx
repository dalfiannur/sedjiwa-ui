import * as React from "react";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  fieldSurfaceVariants,
  type FieldSurfaceVariants,
} from "../../lib/field-surface.variants";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Calendar, type DateRange } from "../date-picker/calendar";
import { TimeSelect, snap } from "../date-time-picker/time-select";

const ISO_DATE_TIME_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** Both ends local ISO `"YYYY-MM-DDTHH:mm"`, or null. */
export type DateTimeRangeValue = {
  from: string | null;
  to: string | null;
};

const EMPTY_RANGE: DateTimeRangeValue = { from: null, to: null };

/** The hour a newly picked end starts at when it has no time of its own. */
const DEFAULT_MINUTES = 9 * 60;

const pad = (n: number) => String(n).padStart(2, "0");
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toHm = (mins: number) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

/** Parses `"YYYY-MM-DDTHH:mm"`; returns null when absent or malformed. */
function parseValue(value: string | null | undefined) {
  if (!value) return null;
  const m = ISO_DATE_TIME_RE.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return null;
  return { date, minutes: Number(h) * 60 + Number(mi) };
}

/** Date plus time, for the trigger label. */
function toDateTime(parsed: { date: Date; minutes: number } | null): Date | null {
  if (!parsed) return null;
  return new Date(
    parsed.date.getFullYear(),
    parsed.date.getMonth(),
    parsed.date.getDate(),
    Math.floor(parsed.minutes / 60),
    parsed.minutes % 60,
  );
}

function formatRangeLabel(
  from: Date | null,
  to: Date | null,
  locale: string | undefined,
  placeholder: string,
  pendingSuffix: string,
): string {
  if (!from && !to) return placeholder;
  const fmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  if (from && !to) return `${fmt.format(from)} ${pendingSuffix}`;
  if (!from && to) return `${pendingSuffix} ${fmt.format(to)}`;
  return `${fmt.format(from!)} – ${fmt.format(to!)}`;
}

export type DateTimeRangePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  /** Controlled value. Both ends local ISO `"YYYY-MM-DDTHH:mm"` or null. */
  value?: DateTimeRangeValue;
  /** Uncontrolled initial value. */
  defaultValue?: DateTimeRangeValue;
  /** Fires on every change, date or time. */
  onValueChange?: (value: DateTimeRangeValue) => void;
  /** Minutes between time options. Default 30. */
  timeStep?: number;
  /** ISO date `"YYYY-MM-DD"`; days before this are disabled. */
  min?: string;
  /** ISO date `"YYYY-MM-DD"`; days after this are disabled. */
  max?: string;
  /** Text shown in the trigger when nothing is selected. */
  placeholder?: string;
  /** Suffix shown while only one end is chosen. Default "→ …". */
  pendingSuffix?: string;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Calendar months side-by-side. Default 1 — the panel is taller than DateRangePicker's. */
  numberOfMonths?: number;
  /** Visible label for the start time row. Default "Start". */
  startTimeLabel?: React.ReactNode;
  /** Visible label for the end time row. Default "End". */
  endTimeLabel?: React.ReactNode;
  /** Accessible name for the hour dropdowns. */
  hourLabel?: string;
  /** Accessible name for the minute dropdowns. */
  minuteLabel?: string;
  /** Accessible name for the AM/PM dropdowns, shown only in 12-hour locales. */
  periodLabel?: string;
  formatLabel?: (range: { from: Date | null; to: Date | null }) => string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  /**
   * Name for the hidden form inputs. Two are rendered, `${name}[from]` and
   * `${name}[to]`, so common form serializers see a nested object.
   */
  name?: string;
  className?: string;
};

const DEFAULT_PLACEHOLDER = "Pilih rentang tanggal & waktu";
const DEFAULT_PENDING_SUFFIX = "→ …";

/**
 * A start/end pair of local date-times in one inline field.
 *
 * The sibling of `DateRangePicker`: same trigger, same field variants, same
 * hidden-input naming. Days drive `Calendar mode="range"`; each end then keeps
 * its own time. Inline only — it is meant for forms and dialogs.
 *
 * An inverted result (an end earlier than the start) is still emitted rather
 * than clamped: validating it is the caller's job, and a silent correction is
 * worse than a visible error.
 */
export const DateTimeRangePicker = React.forwardRef<
  HTMLButtonElement,
  DateTimeRangePickerProps
>(function DateTimeRangePicker(props, ref) {
  const {
    value,
    defaultValue,
    onValueChange,
    timeStep = 30,
    min,
    max,
    placeholder = DEFAULT_PLACEHOLDER,
    pendingSuffix = DEFAULT_PENDING_SUFFIX,
    locale,
    weekStartsOn = 1,
    numberOfMonths = 1,
    startTimeLabel = "Mulai",
    endTimeLabel = "Selesai",
    hourLabel = "Hour",
    minuteLabel = "Minute",
    periodLabel = "AM/PM",
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

  const startLabelId = React.useId();
  const endLabelId = React.useId();

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<DateTimeRangeValue>(
    defaultValue ?? EMPTY_RANGE,
  );
  const currentValue = isControlled ? value : internalValue;

  const [open, setOpen] = React.useState(false);

  const resolvedState: NonNullable<FieldSurfaceVariants["state"]> =
    stateProp ??
    (ariaInvalid === true || ariaInvalid === "true" ? "error" : "default");

  const fromParsed = React.useMemo(
    () => parseValue(currentValue.from),
    [currentValue.from],
  );
  const toParsed = React.useMemo(
    () => parseValue(currentValue.to),
    [currentValue.to],
  );

  const fromDate = fromParsed?.date ?? null;
  const toDate = toParsed?.date ?? null;

  // Each end carries its own time. Deriving from the current value means
  // re-picking a day preserves that end's time, while an end that has never
  // had one falls back to the 09:00 default, snapped to the step.
  const fromMinutes = snap(fromParsed?.minutes ?? DEFAULT_MINUTES, timeStep);
  const toMinutes = snap(toParsed?.minutes ?? DEFAULT_MINUTES, timeStep);

  const minDate = React.useMemo(
    () => (min ? new Date(`${min}T00:00`) : undefined),
    [min],
  );
  const maxDate = React.useMemo(
    () => (max ? new Date(`${max}T00:00`) : undefined),
    [max],
  );

  const calendarValue = React.useMemo<DateRange>(
    () => ({ from: fromDate, to: toDate }),
    [fromDate, toDate],
  );

  const fromDT = toDateTime(fromParsed);
  const toDT = toDateTime(toParsed);

  const displayLabel = formatLabel
    ? formatLabel({ from: fromDT, to: toDT })
    : formatRangeLabel(
        fromDT,
        toDT,
        locale,
        placeholder,
        pendingSuffix,
      );

  const isPlaceholder = !fromDT && !toDT;
  const isDisabled = disabled || loading;

  const emit = (next: DateTimeRangeValue) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  // Days come straight from Calendar's own range logic — including the swap it
  // performs when the second click lands before the first. Times stay with
  // their slot: the start time belongs to the start, whichever day that is.
  const handleSelect = (next: DateRange) => {
    emit({
      from: next.from ? `${toIsoDate(next.from)}T${toHm(fromMinutes)}` : null,
      to: next.to ? `${toIsoDate(next.to)}T${toHm(toMinutes)}` : null,
    });
    // Unlike DateRangePicker, completing the range does not close the panel —
    // the time rows below are part of the same edit.
  };

  const handleStartTime = (mins: number) => {
    // With no start day yet there is nothing to attach the time to except
    // today, which is the same fallback DateTimePicker's inline mode uses.
    const day = fromDate ?? new Date();
    emit({
      from: `${toIsoDate(day)}T${toHm(mins)}`,
      to: currentValue.to,
    });
  };

  const handleEndTime = (mins: number) => {
    if (!toDate) return;
    emit({
      from: currentValue.from,
      to: `${toIsoDate(toDate)}T${toHm(mins)}`,
    });
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
          buttonProps["aria-label"] ?? (isPlaceholder ? placeholder : undefined)
        }
        data-slot="date-time-range-picker-trigger"
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
        // Block dialog/sheet auto-focus loops when the popover closes.
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div
          className="flex flex-col gap-3"
          data-slot="date-time-range-picker"
        >
          <Calendar
            mode="range"
            value={calendarValue}
            onSelect={handleSelect}
            min={minDate}
            max={maxDate}
            locale={locale}
            weekStartsOn={weekStartsOn}
            numberOfMonths={numberOfMonths}
            // Match DateTimePicker exactly. These two are siblings and may sit
            // on the same screen; differing headers, weekday case and day
            // shapes would read as two unrelated date UIs. Year navigation is
            // preserved by the label header's month/year chooser.
            headerVariant="label"
            dayShape="circle"
            weekdayCase="title"
            navPlacement="grouped"
            autoFocus
          />

          <div className="flex flex-col gap-2 border-t pt-3">
            <div className="flex items-center justify-between gap-4">
              <span
                id={startLabelId}
                className="text-foreground text-sm font-medium"
              >
                {startTimeLabel}
              </span>
              <TimeSelect
                value={fromMinutes}
                onValueChange={handleStartTime}
                timeStep={timeStep}
                locale={locale}
                labelledBy={startLabelId}
                hourLabel={hourLabel}
                minuteLabel={minuteLabel}
                periodLabel={periodLabel}
                slotPrefix="date-time-range-picker-start"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span
                id={endLabelId}
                className="text-foreground text-sm font-medium"
              >
                {endTimeLabel}
              </span>
              {/* Nothing to attach an end time to until an end day exists. */}
              <TimeSelect
                value={toMinutes}
                onValueChange={handleEndTime}
                timeStep={timeStep}
                locale={locale}
                labelledBy={endLabelId}
                hourLabel={hourLabel}
                minuteLabel={minuteLabel}
                periodLabel={periodLabel}
                disabled={!toDate}
                slotPrefix="date-time-range-picker-end"
              />
            </div>
          </div>
        </div>
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
DateTimeRangePicker.displayName = "DateTimeRangePicker";
