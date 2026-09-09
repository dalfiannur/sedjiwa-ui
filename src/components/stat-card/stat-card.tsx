import * as React from "react";
import { cn } from "../../lib/cn";
import { Card } from "../card";
import { statCardTileVariants, type StatCardTileVariants } from "./stat-card.variants";

export type StatCardProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** What the figure counts. Rendered above the value. */
  label: React.ReactNode;
  /** The figure itself. Pass it pre-formatted — thousands separators and
   *  currency belong to the caller's locale, not to this component. */
  value: React.ReactNode;
  /** Usually a lucide glyph. Decorative: it is hidden from assistive tech,
   *  because `label` already names the figure. */
  icon?: React.ReactNode;
  tone?: StatCardTileVariants["tone"];
  /** Footer slot, usually a `<TrendIndicator />`. */
  trend?: React.ReactNode;
};

export function StatCard({
  className,
  label,
  value,
  icon,
  tone = "primary",
  trend,
  ...props
}: StatCardProps) {
  return (
    <Card
      data-slot="stat-card"
      data-tone={tone}
      // Card's own rhythm (gap-6, py-6) is tuned for a header/content/footer
      // stack. A stat card is three tight lines, so it overrides both rather
      // than nesting a CardHeader that would only add air.
      className={cn("gap-4 p-5", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <span
            data-slot="stat-card-label"
            className="text-muted-foreground text-sm font-medium"
          >
            {label}
          </span>
          <span
            data-slot="stat-card-value"
            className="text-3xl leading-none font-bold tracking-tight tabular-nums"
          >
            {value}
          </span>
        </div>

        {icon != null && (
          <span
            data-slot="stat-card-icon"
            aria-hidden="true"
            className={statCardTileVariants({ tone })}
          >
            {icon}
          </span>
        )}
      </div>

      {trend != null && <div data-slot="stat-card-trend">{trend}</div>}
    </Card>
  );
}
