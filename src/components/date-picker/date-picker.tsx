import * as React from "react";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  fieldSurfaceVariants,
  type FieldSurfaceVariants,
} from "../../lib/field-surface.variants";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Calendar } from "./calendar";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a `"YYYY-MM-DD"` string into a local-time Date (no UTC drift). */
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

export type DatePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  /** Controlled value. ISO `"YYYY-MM-DD"` or `null` for empty. */
  value?: string | null;
  /** Uncontrolled initial value. ISO `"YYYY-MM-DD"` or `null`. */
  defaultValue?: string | null;
  /** Fires with the ISO string when the user picks a day. */
  onValueChange?: (value: string | null) => void;
  /** ISO date; disables days before this date in the calendar. */
  min?: string;
  /** ISO date; disables days after this date in the calendar. */
  max?: string;
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** BCP-47 locale tag for date / month / weekday formatting. */
  locale?: string;
  /** Day the week starts on in the calendar grid. 0 = Sunday, 1 = Monday (default). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Custom formatter for the displayed date inside the trigger. */
  formatLabel?: (d: Date) => string;
  /** Inclusive lower bound for the year dropdown. Defaults to `min`'s year or today − 100. */
  fromYear?: number;
  /** Inclusive upper bound for the year dropdown. Defaults to `max`'s year or today + 50. */
  toYear?: number;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  /** Name attribute on the underlying hidden form input. */
  name?: string;
  className?: string;
};

const DEFAULT_PLACEHOLDER = "Pilih tanggal";

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      placeholder = DEFAULT_PLACEHOLDER,
      locale,
      weekStartsOn = 1,
      formatLabel,
      fromYear,
      toYear,
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
    const [internalValue, setInternalValue] = React.useState<string | null>(
      defaultValue ?? null,
    );
    const currentValue = isControlled ? (value ?? null) : internalValue;

    const [open, setOpen] = React.useState(false);

    const resolvedState: NonNullable<FieldSurfaceVariants["state"]> =
      stateProp ??
      (ariaInvalid === true || ariaInvalid === "true" ? "error" : "default");

    const selectedDate = React.useMemo(
      () => parseISO(currentValue),
      [currentValue],
    );
    const minDate = React.useMemo(() => parseISO(min) ?? undefined, [min]);
    const maxDate = React.useMemo(() => parseISO(max) ?? undefined, [max]);

    const defaultFormatter = React.useMemo(
      () =>
        new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      [locale],
    );

    const displayLabel = selectedDate
      ? (formatLabel ?? ((d: Date) => defaultFormatter.format(d)))(selectedDate)
      : placeholder;

    const isPlaceholder = selectedDate === null;
    const isDisabled = disabled || loading;

    const handleSelect = (date: Date) => {
      const next = formatISO(date);
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={isDisabled ? undefined : setOpen}>
        <PopoverTrigger
          ref={ref}
          id={id}
          type="button"
          disabled={isDisabled}
          aria-invalid={
            resolvedState === "error" ? true : ariaInvalid
          }
          aria-describedby={ariaDescribedBy}
          aria-busy={loading || undefined}
          aria-label={
            buttonProps["aria-label"] ??
            (selectedDate ? undefined : placeholder)
          }
          data-slot="date-picker-trigger"
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
          <Calendar
            value={selectedDate}
            onSelect={handleSelect}
            min={minDate}
            max={maxDate}
            locale={locale}
            weekStartsOn={weekStartsOn}
            fromYear={fromYear}
            toYear={toYear}
            autoFocus
          />
        </PopoverContent>
        {name ? (
          <input type="hidden" name={name} value={currentValue ?? ""} />
        ) : null}
      </Popover>
    );
  },
);
DatePicker.displayName = "DatePicker";
