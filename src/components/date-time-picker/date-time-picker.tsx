import * as React from "react";
import { Calendar as CalendarIcon, Check, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { DEFAULT_LOCALE } from "../../lib/locale";
import {
  fieldSurfaceVariants,
  type FieldSurfaceVariants,
} from "../../lib/field-surface.variants";
import { Button } from "../button";
import { Calendar } from "../date-picker";
import { Modal } from "../modal";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { TimeSelect, snap } from "./time-select";

type DateTimePickerSharedProps = {
  /** Controlled value, local ISO `"YYYY-MM-DDTHH:mm"`, or null for none. */
  value?: string | null;
  /** Minutes between time options. Default 30. */
  timeStep?: number;
  /** ISO date `"YYYY-MM-DD"`; days before this are disabled. */
  min?: string;
  /** ISO date `"YYYY-MM-DD"`; days after this are disabled. */
  max?: string;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  todayLabel?: React.ReactNode;
  timeLabel?: React.ReactNode;
  /** Accessible name for the hour dropdown. */
  hourLabel?: string;
  /** Accessible name for the minute dropdown. */
  minuteLabel?: string;
  /** Accessible name for the AM/PM dropdown, shown only in 12-hour locales. */
  periodLabel?: string;
  className?: string;
};

export type DateTimePickerModalProps = DateTimePickerSharedProps & {
  /** Opens in a Modal with an Apply button. Default. */
  mode?: "modal";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires with local ISO `"YYYY-MM-DDTHH:mm"` when Apply is pressed. */
  onApply: (value: string) => void;
  title?: React.ReactNode;
  applyLabel?: React.ReactNode;
};

export type DateTimePickerInlineProps = DateTimePickerSharedProps & {
  /** Renders a field trigger + Popover, for use inside forms and dialogs. */
  mode: "inline";
  /** Fires on every change — no Apply step, matching DatePicker. */
  onValueChange?: (value: string | null) => void;
  /** Text shown in the trigger when there is no value. */
  placeholder?: string;
  /** Custom formatter for the trigger label. */
  formatLabel?: (d: Date) => string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  disabled?: boolean;
  /** Name attribute on the underlying hidden form input. */
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

export type DateTimePickerProps =
  | DateTimePickerModalProps
  | DateTimePickerInlineProps;

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

const DEFAULT_INLINE_PLACEHOLDER = "Pilih tanggal & waktu";

/**
 * Date + time in one control.
 *
 * `mode="modal"` (the default) opens a Modal with an explicit Apply step.
 * `mode="inline"` renders a `DatePicker`-style field trigger with a Popover
 * and commits on every change — use it inside forms and dialogs, where a
 * modal-on-modal would stack two overlays and two commit buttons.
 */
export function DateTimePicker(props: DateTimePickerProps) {
  if (props.mode === "inline") return <DateTimePickerInline {...props} />;
  return <DateTimePickerModal {...props} />;
}

DateTimePicker.displayName = "DateTimePicker";

function DateTimePickerModal({
  open,
  onOpenChange,
  value,
  onApply,
  title = "Pilih tanggal & waktu",
  timeStep = 30,
  min,
  max,
  locale = DEFAULT_LOCALE,
  weekStartsOn = 0,
  applyLabel = "Terapkan",
  todayLabel = "Hari Ini",
  timeLabel = "Waktu",
  hourLabel = "Hour",
  minuteLabel = "Minute",
  periodLabel = "AM/PM",
  className,
}: DateTimePickerModalProps) {
  const timeLabelId = React.useId();
  const parsed = parseValue(value);
  const [draftDate, setDraftDate] = React.useState<Date>(() => parsed?.date ?? new Date());
  const [draftMinutes, setDraftMinutes] = React.useState<number>(() =>
    snap(parsed?.minutes ?? 9 * 60, timeStep),
  );

  // Re-seed the draft each time the modal transitions from closed to open, so a
  // cancelled edit is discarded. Derived during render (comparing against the
  // previous `open`, tracked in state rather than a ref) instead of in an
  // effect: `DateTimePicker` itself stays mounted across open/close (only
  // Modal's internal content unmounts), so an effect would work, but this
  // repo's lint config flags both synchronous setState-in-effect and ref
  // access during render. See the equivalent pattern in combobox.tsx and
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDraftDate(parsed?.date ?? new Date());
      setDraftMinutes(snap(parsed?.minutes ?? 9 * 60, timeStep));
    }
  }

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
          dayShape="circle"
          weekdayCase="title"
          navPlacement="grouped"
          value={draftDate}
          onSelect={setDraftDate}
          min={min ? new Date(`${min}T00:00`) : undefined}
          max={max ? new Date(`${max}T00:00`) : undefined}
          locale={locale}
          weekStartsOn={weekStartsOn}
        />

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <span id={timeLabelId} className="text-foreground text-sm font-medium">
            {timeLabel}
          </span>
          <TimeSelect
            value={draftMinutes}
            onValueChange={setDraftMinutes}
            timeStep={timeStep}
            locale={locale}
            labelledBy={timeLabelId}
            hourLabel={hourLabel}
            minuteLabel={minuteLabel}
            periodLabel={periodLabel}
          />
        </div>
      </div>
    </Modal>
  );
}

function DateTimePickerInline({
  value,
  onValueChange,
  timeStep = 30,
  min,
  max,
  locale = DEFAULT_LOCALE,
  weekStartsOn = 0,
  todayLabel = "Hari Ini",
  timeLabel = "Waktu",
  hourLabel = "Hour",
  minuteLabel = "Minute",
  periodLabel = "AM/PM",
  placeholder = DEFAULT_INLINE_PLACEHOLDER,
  formatLabel,
  size = "default",
  state: stateProp,
  loading = false,
  disabled = false,
  name,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: DateTimePickerInlineProps) {
  const timeLabelId = React.useId();
  const [open, setOpen] = React.useState(false);

  const parsed = parseValue(value);
  const selectedDate = parsed?.date ?? null;
  // With no value yet, the time control shows the same 09:00 default the modal
  // seeds its draft with, so picking a day lands on a sensible hour.
  const minutes = snap(parsed?.minutes ?? 9 * 60, timeStep);

  const resolvedState: NonNullable<FieldSurfaceVariants["state"]> =
    stateProp ??
    (ariaInvalid === true || ariaInvalid === "true" ? "error" : "default");

  const defaultFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  const selectedDateTime = parsed
    ? new Date(
        parsed.date.getFullYear(),
        parsed.date.getMonth(),
        parsed.date.getDate(),
        Math.floor(parsed.minutes / 60),
        parsed.minutes % 60,
      )
    : null;

  const displayLabel = selectedDateTime
    ? (formatLabel ?? ((d: Date) => defaultFormatter.format(d)))(selectedDateTime)
    : placeholder;

  const isPlaceholder = selectedDateTime === null;
  const isDisabled = disabled || loading;

  // Every change commits immediately — there is no draft to discard, so the
  // modal branch's open/close re-seed logic does not apply here.
  const emit = (date: Date, mins: number) =>
    onValueChange?.(`${toIsoDate(date)}T${toHm(mins)}`);

  const handleSelectDate = (date: Date) => emit(date, minutes);
  const handleTimeChange = (mins: number) => emit(selectedDate ?? new Date(), mins);

  return (
    <Popover open={open} onOpenChange={isDisabled ? undefined : setOpen}>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={isDisabled}
        aria-invalid={resolvedState === "error" ? true : ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading || undefined}
        aria-label={ariaLabel ?? (isPlaceholder ? placeholder : undefined)}
        data-slot="date-time-picker-trigger"
        data-state={resolvedState}
        data-loading={loading || undefined}
        data-placeholder={isPlaceholder || undefined}
        className={cn(
          fieldSurfaceVariants({ size, state: resolvedState }),
          "items-center gap-2 px-3 text-left",
          isPlaceholder && "text-muted-foreground",
          loading && "opacity-90",
          className,
        )}
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
        <div className="flex flex-col gap-4" data-slot="date-time-picker">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSelectDate(new Date())}
              data-slot="date-time-picker-today"
            >
              {todayLabel}
            </Button>
          </div>

          <Calendar
            mode="single"
            headerVariant="label"
            dayShape="circle"
            weekdayCase="title"
            navPlacement="grouped"
            value={selectedDate}
            onSelect={handleSelectDate}
            min={min ? new Date(`${min}T00:00`) : undefined}
            max={max ? new Date(`${max}T00:00`) : undefined}
            locale={locale}
            weekStartsOn={weekStartsOn}
            autoFocus
          />

          <div className="flex items-center justify-between gap-4 border-t pt-4">
            <span id={timeLabelId} className="text-foreground text-sm font-medium">
              {timeLabel}
            </span>
            <TimeSelect
              value={minutes}
              onValueChange={handleTimeChange}
              timeStep={timeStep}
              locale={locale}
              labelledBy={timeLabelId}
              hourLabel={hourLabel}
              minuteLabel={minuteLabel}
              periodLabel={periodLabel}
            />
          </div>
        </div>
      </PopoverContent>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
    </Popover>
  );
}
