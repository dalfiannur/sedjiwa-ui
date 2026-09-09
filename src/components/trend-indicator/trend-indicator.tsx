import * as React from "react";
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  trendIndicatorVariants,
  type TrendIndicatorVariants,
} from "./trend-indicator.variants";

type Tone = NonNullable<TrendIndicatorVariants["tone"]>;

/** Which direction is the good one for this particular metric.
 *  - `up` (default): more is better — revenue, users, orders.
 *  - `down`: less is better — rejections, cost per unit, response time.
 *  - `neutral`: the number moved, and we are not saying whether that is good. */
export type TrendPolarity = "up" | "down" | "neutral";

export type TrendIndicatorProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Signed change. `8.5` renders as an up arrow, `-4.3` as a down arrow. */
  value: number;
  /** Trailing text, e.g. "dari kemarin". */
  label?: React.ReactNode;
  polarity?: TrendPolarity;
  /** Defaults to one decimal place and a percent sign, sign stripped —
   *  the arrow already carries the direction. */
  formatValue?: (value: number) => string;
  /** Direction word for screen readers, since the arrow is decorative and
   *  colour alone must never be the signal. Pass `null` when `label` already
   *  says it ("naik dari kemarin") and you would rather not hear it twice. */
  directionLabel?: string | null;
};

const DEFAULT_DIRECTION_LABEL: Record<"up" | "down" | "flat", string> = {
  up: "naik",
  down: "turun",
  flat: "tetap",
};

function defaultFormat(value: number): string {
  return `${Math.abs(value).toFixed(1)}%`;
}

export function TrendIndicator({
  className,
  value,
  label,
  polarity = "up",
  formatValue = defaultFormat,
  directionLabel,
  ...props
}: TrendIndicatorProps) {
  const direction = value > 0 ? "up" : value < 0 ? "down" : "flat";

  // A flat trend is neither good nor bad regardless of polarity, so it short
  // circuits before the polarity table below.
  const tone: Tone =
    direction === "flat" || polarity === "neutral"
      ? "neutral"
      : (direction === "up") === (polarity === "up")
        ? "positive"
        : "negative";

  const Icon =
    direction === "up" ? TrendingUpIcon : direction === "down" ? TrendingDownIcon : MinusIcon;

  const srDirection =
    directionLabel === null ? null : (directionLabel ?? DEFAULT_DIRECTION_LABEL[direction]);

  return (
    <span
      data-slot="trend-indicator"
      data-direction={direction}
      data-tone={tone}
      className={cn(trendIndicatorVariants({ tone }), className)}
      {...props}
    >
      <Icon aria-hidden="true" />
      {srDirection != null && <span className="sr-only">{srDirection} </span>}
      {formatValue(value)}
      {label != null && (
        <span data-slot="trend-indicator-label" className="text-muted-foreground font-normal">
          {label}
        </span>
      )}
    </span>
  );
}
