import { cva, type VariantProps } from "class-variance-authority";

export const checkboxVariants = cva(
  [
    "peer shrink-0 rounded-sm border bg-transparent shadow-xs",
    "transition-[color,box-shadow,border-color,background-color] duration-150",
    "focus-visible:outline-none focus-visible:ring-[3px]",
    "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
    "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "dark:data-[state=unchecked]:bg-input/30",
    // Hover. Deliberately tone-agnostic: rather than restating a /90 fill for
    // each of the four state tones, an unchecked box picks up the same faint
    // accent wash the Input action button uses, and a filled box (any tone)
    // simply softens. `enabled:` keeps this off disabled controls, where it
    // would otherwise fight disabled:opacity-50.
    "data-[state=unchecked]:enabled:hover:bg-accent",
    "data-[state=checked]:enabled:hover:opacity-90",
    "data-[state=indeterminate]:enabled:hover:opacity-90",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "size-4",
        default: "size-5",
        lg: "size-6",
      },
      state: {
        default: "border-input focus-visible:border-ring focus-visible:ring-ring/40",
        error:
          "border-destructive focus-visible:ring-destructive/35 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive data-[state=indeterminate]:bg-destructive data-[state=indeterminate]:border-destructive",
        success:
          "border-success data-[state=checked]:bg-success data-[state=checked]:border-success data-[state=indeterminate]:bg-success data-[state=indeterminate]:border-success",
        warning:
          "border-warning data-[state=checked]:bg-warning data-[state=checked]:border-warning data-[state=indeterminate]:bg-warning data-[state=indeterminate]:border-warning",
      },
    },
    defaultVariants: { size: "default", state: "default" },
  },
);

export const checkboxIndicatorIconVariants = cva(
  "stroke-[3]",
  {
    variants: {
      size: {
        sm: "size-3",
        default: "size-3.5",
        lg: "size-4",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type CheckboxVariants = VariantProps<typeof checkboxVariants>;
