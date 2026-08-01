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
          <span id={timeLabelId} className="text-foreground text-sm font-medium">
            {timeLabel}
          </span>
          <Select
            value={String(draftMinutes)}
            onValueChange={(v) => setDraftMinutes(Number(v))}
          >
            {/* The visible "Time" text is the trigger's accessible name.
                Without this the combobox has none at all — axe button-name. */}
            <SelectTrigger
              className="w-[9rem]"
              data-slot="date-time-picker-time"
              aria-labelledby={timeLabelId}
            >
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
