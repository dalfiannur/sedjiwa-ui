import { cva, type VariantProps } from "class-variance-authority";

export const switchVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center rounded-full",
    "border border-transparent shadow-inner",
    "transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-[3px]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/60",
    // Hover, tone-agnostic — see checkbox.variants.ts. The track is always
    // filled (input when off, the state tone when on), so softening reads in
    // both states where an accent wash would not.
    "enabled:hover:opacity-90",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        default: "h-5 w-9",
      },
      state: {
        default:
          "data-[state=checked]:bg-primary focus-visible:ring-ring/40",
        error:
          "data-[state=checked]:bg-destructive focus-visible:ring-destructive/35",
        success: "data-[state=checked]:bg-success focus-visible:ring-success/35",
        warning: "data-[state=checked]:bg-warning focus-visible:ring-warning/35",
      },
    },
    defaultVariants: { size: "default", state: "default" },
  },
);

export const switchThumbVariants = cva(
  [
    "pointer-events-none block rounded-full bg-background shadow-md",
    "transition-transform duration-200",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "size-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0.5",
        default:
          "size-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type SwitchVariants = VariantProps<typeof switchVariants>;
