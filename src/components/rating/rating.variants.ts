import { cva, type VariantProps } from "class-variance-authority";

export const ratingVariants = cva("inline-flex items-center", {
  variants: {
    size: {
      sm: "gap-1.5 text-xs [&_svg]:size-3.5",
      default: "gap-2 text-sm [&_svg]:size-4",
      lg: "gap-2.5 text-base [&_svg]:size-5",
    },
  },
  defaultVariants: { size: "default" },
});

export type RatingVariants = VariantProps<typeof ratingVariants>;
