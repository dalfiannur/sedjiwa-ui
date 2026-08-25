import { cva, type VariantProps } from "class-variance-authority";

export const radioGroupItemVariants = cva(
  [
    "aspect-square shrink-0 rounded-full border bg-transparent shadow-xs",
    "transition-[color,box-shadow,border-color,background-color] duration-150",
    "focus-visible:outline-none focus-visible:ring-[3px]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "dark:bg-input/30",
    // Hover, tone-agnostic — see checkbox.variants.ts for the reasoning.
    // A radio never fills its whole box (the dot is a separate element), so
    // both states take the accent wash rather than an opacity softening.
    "enabled:hover:bg-accent",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "size-4",
        default: "size-5",
        lg: "size-6",
      },
      state: {
        default:
          "border-input focus-visible:border-ring focus-visible:ring-ring/40 data-[state=checked]:border-primary",
        error:
          "border-destructive focus-visible:ring-destructive/35 data-[state=checked]:border-destructive",
        success: "border-success data-[state=checked]:border-success",
        warning: "border-warning data-[state=checked]:border-warning",
      },
    },
    defaultVariants: { size: "default", state: "default" },
  },
);

export const radioGroupItemIndicatorVariants = cva(
  "rounded-full",
  {
    variants: {
      size: {
        sm: "size-2",
        default: "size-2.5",
        lg: "size-3",
      },
      state: {
        default: "bg-primary",
        error: "bg-destructive",
        success: "bg-success",
        warning: "bg-warning",
      },
    },
    defaultVariants: { size: "default", state: "default" },
  },
);

export type RadioGroupItemVariants = VariantProps<typeof radioGroupItemVariants>;
