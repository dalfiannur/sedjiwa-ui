import { cva, type VariantProps } from "class-variance-authority";

export const progressTrackVariants = cva(
  [
    "relative w-full overflow-hidden rounded-full",
    "bg-secondary dark:bg-input/40",
  ].join(" "),
  {
    variants: {
      // Thickness, per the kit's sm/md/lg.
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export const progressFillVariants = cva(
  [
    "h-full rounded-full",
    // Only the width animates. A colour change on completion should not slide.
    "transition-[width] duration-300 ease-out",
  ].join(" "),
  {
    variants: {
      state: {
        default: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-destructive",
      },
    },
    defaultVariants: { state: "default" },
  },
);

export type ProgressVariants = VariantProps<typeof progressTrackVariants> &
  VariantProps<typeof progressFillVariants>;
