import { cva, type VariantProps } from "class-variance-authority";

export const pinInputBoxVariants = cva(
  [
    // Overrides `fieldSurfaceVariants`' `w-full`: a pin box is square-ish and
    // sized by its content, not by the row it sits in.
    "text-center font-medium tabular-nums",
    "outline-none",
    "disabled:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "w-8",
        default: "w-9",
        lg: "w-11",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export const pinInputGroupVariants = cva("flex items-center", {
  variants: {
    size: {
      sm: "gap-1.5",
      default: "gap-2",
      lg: "gap-2.5",
    },
  },
  defaultVariants: { size: "default" },
});

export type PinInputBoxVariants = VariantProps<typeof pinInputBoxVariants>;
export type PinInputGroupVariants = VariantProps<typeof pinInputGroupVariants>;
