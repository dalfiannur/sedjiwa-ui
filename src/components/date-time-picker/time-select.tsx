import * as React from "react";
import { cn } from "../../lib/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

/**
 * Shared locale-aware hour / minute / period control.
 *
 * Internal to the date-time pickers — deliberately NOT exported from
 * `src/index.ts`. `DateTimePicker` and `DateTimeRangePicker` both need the
 * identical rounding and hour-cycle behaviour, and duplicating it would
 * guarantee drift.
 */

export const pad = (n: number) => String(n).padStart(2, "0");

/** Minute granularity, clamped so a nonsensical timeStep still yields options. */
export function minuteStep(timeStep: number) {
  return Math.min(Math.max(Math.round(timeStep), 1), 60);
}

/**
 * Rounds the MINUTE component to the nearest step, carrying into the hour when
 * it rounds up to 60. Clamps at the last selectable slot of the day so 23:59
 * never becomes an unreachable 24:00.
 */
export function snap(minutes: number, timeStep: number) {
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

/**
 * Locale hour cycle plus the hour / minute / period option lists.
 * Exposed as a hook so both pickers derive them identically.
 */
export function useTimeOptions(locale: string | undefined, timeStep: number) {
  return React.useMemo(() => {
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
}

export type TimeSelectProps = {
  /** Minutes since midnight. */
  value: number;
  onValueChange: (minutes: number) => void;
  /** Minutes between minute options. Default 30. */
  timeStep?: number;
  locale?: string;
  /** id of the visible label; the group is labelled by it. */
  labelledBy?: string;
  /** Accessible name for the hour dropdown. */
  hourLabel?: string;
  /** Accessible name for the minute dropdown. */
  minuteLabel?: string;
  /** Accessible name for the AM/PM dropdown, shown only in 12-hour locales. */
  periodLabel?: string;
  /** Disables all three dropdowns. */
  disabled?: boolean;
  /** Prefix for the `data-slot` attributes. Default `"date-time-picker"`. */
  slotPrefix?: string;
  className?: string;
};

export function TimeSelect({
  value,
  onValueChange,
  timeStep = 30,
  locale,
  labelledBy,
  hourLabel = "Hour",
  minuteLabel = "Minute",
  periodLabel = "AM/PM",
  disabled = false,
  slotPrefix = "date-time-picker",
  className,
}: TimeSelectProps) {
  const { is12Hour, hours, minutes, periods } = useTimeOptions(locale, timeStep);

  const hour24 = Math.floor(value / 60);
  const minute = value % 60;
  const period = hour24 < 12 ? "am" : "pm";
  // 0 and 12 both display as "12" on a 12-hour clock.
  const hourDisplay = is12Hour ? hour24 % 12 || 12 : hour24;

  const setHour = (h: number) => {
    const next24 = is12Hour ? (h % 12) + (period === "pm" ? 12 : 0) : h;
    onValueChange(next24 * 60 + minute);
  };
  const setMinute = (m: number) => onValueChange(hour24 * 60 + m);
  const setPeriod = (p: string) => {
    const base = hour24 % 12;
    onValueChange((base + (p === "pm" ? 12 : 0)) * 60 + minute);
  };

  return (
    // A group labelled by the visible label, holding the separate controls.
    // Each dropdown carries its own accessible name — the visible label
    // cannot name two or three comboboxes at once.
    <div
      role="group"
      aria-labelledby={labelledBy}
      className={cn("flex items-center gap-2", className)}
    >
      <Select
        value={String(hourDisplay)}
        onValueChange={(v) => setHour(Number(v))}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-[4.5rem]"
          data-slot={`${slotPrefix}-hour`}
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
        value={String(minute)}
        onValueChange={(v) => setMinute(Number(v))}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-[4.5rem]"
          data-slot={`${slotPrefix}-minute`}
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
        <Select value={period} onValueChange={setPeriod} disabled={disabled}>
          <SelectTrigger
            className="w-[5rem]"
            data-slot={`${slotPrefix}-period`}
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
  );
}

TimeSelect.displayName = "TimeSelect";
