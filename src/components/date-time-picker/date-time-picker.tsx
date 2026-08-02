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
  /** Accessible name for the hour dropdown. */
  hourLabel?: string;
  /** Accessible name for the minute dropdown. */
  minuteLabel?: string;
  /** Accessible name for the AM/PM dropdown, shown only in 12-hour locales. */
  periodLabel?: string;
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
/** Minute granularity, clamped so a nonsensical timeStep still yields options. */
function minuteStep(timeStep: number) {
  return Math.min(Math.max(Math.round(timeStep), 1), 60);
}

/**
 * Rounds the MINUTE component to the nearest step, carrying into the hour when
 * it rounds up to 60. Clamps at the last selectable slot of the day so 23:59
 * never becomes an unreachable 24:00.
 */
function snap(minutes: number, timeStep: number) {
  const step = minuteStep(timeStep);
  const lastMinute = Math.floor(59 / step) * step;
  let hour = Math.floor(minutes / 60);
  let minute = Math.round((minutes % 60) / step) * step;
  if (minute > 59) {
    minute = 0;
    hour += 1;
  }
  if (hour > 23) return 23 * 60 + lastMinute;
  return hour * 60 + minute;
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
  hourLabel = "Hour",
  minuteLabel = "Minute",
  periodLabel = "AM/PM",
  className,
}: DateTimePickerProps) {
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

  const { is12Hour, hours, minutes, periods } = React.useMemo(() => {
    const cycle = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions()
      .hourCycle;
    const twelve = cycle === "h11" || cycle === "h12";
    const step = minuteStep(timeStep);

    // Day-period names come from the locale rather than hardcoded AM/PM, so
    // e.g. id-ID would read "AM"/"PM" and other locales their own equivalents.
    const periodFmt = new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true });
    const periodName = (hour24: number) =>
      periodFmt
        .formatToParts(new Date(2000, 0, 1, hour24))
        .find((p) => p.type === "dayPeriod")?.value ?? (hour24 < 12 ? "AM" : "PM");

    return {
      is12Hour: twelve,
      hours: twelve
        ? Array.from({ length: 12 }, (_, i) => {
            const h = i === 0 ? 12 : i; // 12, 1, 2 … 11
            return { value: h, label: String(h) };
          })
        : Array.from({ length: 24 }, (_, h) => ({ value: h, label: pad(h) })),
      minutes: Array.from({ length: Math.ceil(60 / step) }, (_, i) => ({
        value: i * step,
        label: pad(i * step),
      })),
      periods: [
        { value: "am", label: periodName(9) },
        { value: "pm", label: periodName(21) },
      ],
    };
  }, [locale, timeStep]);

  const draftHour24 = Math.floor(draftMinutes / 60);
  const draftMinute = draftMinutes % 60;
  const draftPeriod = draftHour24 < 12 ? "am" : "pm";
  // 0 and 12 both display as "12" on a 12-hour clock.
  const draftHourDisplay = is12Hour ? draftHour24 % 12 || 12 : draftHour24;

  const setHour = (h: number) => {
    const hour24 = is12Hour ? (h % 12) + (draftPeriod === "pm" ? 12 : 0) : h;
    setDraftMinutes(hour24 * 60 + draftMinute);
  };
  const setMinute = (m: number) => setDraftMinutes(draftHour24 * 60 + m);
  const setPeriod = (p: string) => {
    const base = draftHour24 % 12;
    setDraftMinutes((base + (p === "pm" ? 12 : 0)) * 60 + draftMinute);
  };

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
          {/* A group labelled "Time" holding the separate controls. Each
              dropdown carries its own accessible name — the visible label
              cannot name two or three comboboxes at once. */}
          <div
            role="group"
            aria-labelledby={timeLabelId}
            className="flex items-center gap-2"
          >
            <Select
              value={String(draftHourDisplay)}
              onValueChange={(v) => setHour(Number(v))}
            >
              <SelectTrigger
                className="w-[4.5rem]"
                data-slot="date-time-picker-hour"
                aria-label={hourLabel}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.map((h) => (
                  <SelectItem key={h.value} value={String(h.value)}>
                    {h.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span aria-hidden className="text-muted-foreground text-sm">
              :
            </span>

            <Select
              value={String(draftMinute)}
              onValueChange={(v) => setMinute(Number(v))}
            >
              <SelectTrigger
                className="w-[4.5rem]"
                data-slot="date-time-picker-minute"
                aria-label={minuteLabel}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {is12Hour && (
              <Select value={draftPeriod} onValueChange={setPeriod}>
                <SelectTrigger
                  className="w-[5rem]"
                  data-slot="date-time-picker-period"
                  aria-label={periodLabel}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

DateTimePicker.displayName = "DateTimePicker";
