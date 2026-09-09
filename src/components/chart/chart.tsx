import * as React from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "../../lib/cn";

export type ChartContainerProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Fixed pixel height; the width always fills the parent. Recharts measures
   *  its parent, so something in the chain has to state a height — leaving it
   *  to the content collapses the chart to nothing. */
  height?: number;
  /** What the chart shows, in words. Required: to assistive tech the plot is
   *  an opaque SVG, and an unlabelled one is announced as nothing useful.
   *  Describe the trend, not the mechanics — "Penjualan naik dari 5k ke 60k
   *  unit sepanjang 2026", not "grafik garis". */
  "aria-label": string;
  children: React.ReactElement;
};

export function ChartContainer({
  className,
  height = 260,
  children,
  ...props
}: ChartContainerProps) {
  return (
    <div
      data-slot="chart"
      role="img"
      className={cn("w-full", className)}
      style={{ height }}
      {...props}
    >
      {/* aria-hidden on the plot itself: the container above already carries
          the description, and without this a screen reader walks hundreds of
          <path> and <text> nodes announcing stray axis numbers. */}
      <div aria-hidden="true" className="size-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

type TooltipEntry = {
  name?: string | number;
  value?: string | number;
  color?: string;
  dataKey?: string | number;
};

export type ChartTooltipContentProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatValue?: (value: string | number) => string;
};

/** Popover-surfaced tooltip. Kept here rather than inline in each chart so the
 *  three of them agree on what a hovered value looks like. */
export function ChartTooltipContent({
  active,
  payload,
  label,
  formatValue,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      data-slot="chart-tooltip"
      className="bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-sm shadow-md"
    >
      {label != null && (
        <div className="mb-1.5 font-medium">{label}</div>
      )}
      <ul className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <li key={`${entry.dataKey ?? i}`} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto pl-4 font-medium tabular-nums">
              {entry.value != null
                ? (formatValue?.(entry.value) ?? entry.value)
                : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
