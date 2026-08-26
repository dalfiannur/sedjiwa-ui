import * as React from "react";
import { cn } from "../../lib/cn";
import {
  progressFillVariants,
  progressTrackVariants,
  type ProgressVariants,
} from "./progress.variants";

export type ProgressProps = Omit<React.ComponentProps<"div">, "role"> & {
  /**
   * Completion from 0 to 100. Omit (or pass null) for indeterminate work —
   * progress that is happening but whose duration is unknown.
   */
  value?: number | null;
  size?: ProgressVariants["size"];
  state?: ProgressVariants["state"];
};

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function Progress({
  className,
  value = null,
  size = "default",
  state = "default",
  ...props
}: ProgressProps) {
  const indeterminate = value == null;
  const percent = indeterminate ? 0 : clampPercent(value);

  return (
    <div
      data-slot="progress"
      data-size={size}
      data-state-tone={state}
      data-indeterminate={indeterminate || undefined}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      // Deliberately absent while indeterminate: the design kit says to omit
      // valuenow rather than send 0, because 0 claims "no progress made" when
      // the truth is "amount unknown". Screen readers announce the difference.
      aria-valuenow={indeterminate ? undefined : percent}
      className={cn(progressTrackVariants({ size }), className)}
      {...props}
    >
      <div
        data-slot="progress-fill"
        className={cn(
          progressFillVariants({ state }),
          indeterminate &&
            // A segment that travels the track. Under reduced motion the
            // animation stops, so the segment is widened to fill instead —
            // a still 40% sliver reads as "stuck at 40%", which is a worse
            // lie than a full bar that simply says "working".
            "w-2/5 animate-progress-indeterminate motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-60",
        )}
        style={indeterminate ? undefined : { width: `${percent}%` }}
      />
    </div>
  );
}
