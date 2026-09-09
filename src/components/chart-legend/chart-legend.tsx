import * as React from "react";
import { cn } from "../../lib/cn";
import {
  chartLegendItemVariants,
  type ChartLegendItemVariants,
} from "./chart-legend.variants";

export type ChartLegendProps = React.ComponentProps<"ul">;

/** A plain list, deliberately: a legend is read as a set of pairs, and a
 *  screen reader announcing "list, 2 items" is exactly right. It carries no
 *  chart dependency of its own, so it works under a hand-drawn SVG just as
 *  well as under a charting library. */
export function ChartLegend({ className, children, ...props }: ChartLegendProps) {
  return (
    <ul
      data-slot="chart-legend"
      className={cn(
        "flex flex-wrap items-start justify-center gap-x-8 gap-y-3",
        className,
      )}
      {...props}
    >
      {children}
    </ul>
  );
}

export type ChartLegendItemProps = Omit<React.ComponentProps<"li">, "color"> &
  ChartLegendItemVariants & {
    /** Any CSS colour. Reach for a chart token — `var(--chart-1)` … `--chart-5`
     *  — so the swatch tracks the series in both themes. */
    color?: string;
    label: React.ReactNode;
    /** Renders above the label, in the `stacked` layout's larger type. Pass it
     *  pre-formatted; thousands separators are the caller's locale, not ours. */
    value?: React.ReactNode;
  };

export function ChartLegendItem({
  className,
  layout,
  color = "var(--chart-1)",
  label,
  value,
  ...props
}: ChartLegendItemProps) {
  // A value implies the stacked shape unless the caller says otherwise —
  // a figure sitting inline beside its own dot reads as two separate items.
  const resolved = layout ?? (value != null ? "stacked" : "inline");

  const swatch = (
    <span
      data-slot="chart-legend-swatch"
      aria-hidden="true"
      className="size-3 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );

  return (
    <li
      data-slot="chart-legend-item"
      data-layout={resolved}
      className={cn(chartLegendItemVariants({ layout: resolved }), className)}
      {...props}
    >
      {value != null && (
        <span
          data-slot="chart-legend-value"
          className="text-2xl leading-none font-bold tracking-tight tabular-nums"
        >
          {value}
        </span>
      )}
      <span className="flex items-center gap-2">
        {swatch}
        <span
          data-slot="chart-legend-label"
          className="text-muted-foreground truncate text-sm"
        >
          {label}
        </span>
      </span>
    </li>
  );
}
