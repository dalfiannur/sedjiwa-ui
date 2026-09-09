import * as React from "react";
import { StarIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { ratingVariants, type RatingVariants } from "./rating.variants";

export type RatingProps = Omit<React.ComponentProps<"div">, "children"> &
  RatingVariants & {
    /** Stars earned. Fractions are drawn as a partly filled star, so 4.3
     *  renders as four and a bit rather than rounding to a lie. */
    value: number;
    max?: number;
    /** Number of ratings behind the score, shown after the stars. */
    count?: number;
    /** The spoken name. Stars are shapes; without this a screen reader gets
     *  nothing at all from them. */
    formatLabel?: (value: number, max: number, count?: number) => string;
    /** The visible count text. Parentheses are the default because that is how
     *  the source design writes it. */
    formatCount?: (count: number) => string;
  };

function defaultLabel(value: number, max: number, count?: number): string {
  const stars = `${value} dari ${max} bintang`;
  return count == null ? stars : `${stars}, ${count} ulasan`;
}

export function Rating({
  className,
  size,
  value,
  max = 5,
  count,
  formatLabel = defaultLabel,
  formatCount = (n) => `(${n})`,
  ...props
}: RatingProps) {
  // Clamp rather than trust: a score out of a different scale would otherwise
  // overflow the row and silently draw more fill than there are stars.
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? (clamped / max) * 100 : 0;

  const stars = Array.from({ length: max }, (_, i) => (
    <StarIcon key={i} fill="currentColor" strokeWidth={0} className="shrink-0" />
  ));

  return (
    <div
      data-slot="rating"
      role="img"
      aria-label={formatLabel(clamped, max, count)}
      className={cn(ratingVariants({ size }), className)}
      {...props}
    >
      {/* Two full rows, the filled one clipped to the score. Drawing partial
          stars this way keeps every star the same shape and spacing — the
          alternative, swapping in a half-star glyph, only ever lands on
          halves and jumps when the score moves between them. */}
      <span data-slot="rating-stars" aria-hidden="true" className="relative inline-flex">
        <span className="flex text-muted-foreground/30">{stars}</span>
        <span
          className="absolute inset-y-0 left-0 flex overflow-hidden text-chart-3"
          style={{ width: `${percent}%` }}
        >
          {stars}
        </span>
      </span>

      {count != null && (
        <span data-slot="rating-count" className="text-muted-foreground tabular-nums">
          {formatCount(count)}
        </span>
      )}
    </div>
  );
}
