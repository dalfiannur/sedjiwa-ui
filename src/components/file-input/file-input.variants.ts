import { cva, type VariantProps } from "class-variance-authority";

/** The "choose a file" affordance, styled as a leading addon of the field. */
export const fileInputTriggerVariants = cva(
  [
    "flex shrink-0 items-center gap-1.5 self-stretch",
    "border-r border-input bg-muted/50 text-muted-foreground select-none whitespace-nowrap",
    "transition-colors duration-150",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "px-2.5 text-xs",
        default: "px-3 text-sm",
        lg: "px-3.5 text-sm",
      },
    },
    defaultVariants: { size: "default" },
  },
);

/** Filename, or the placeholder when nothing is chosen yet. */
export const fileInputValueVariants = cva(
  "min-w-0 flex-1 self-center truncate px-3 text-left",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type FileInputTriggerVariants = VariantProps<
  typeof fileInputTriggerVariants
>;
export type FileInputValueVariants = VariantProps<
  typeof fileInputValueVariants
>;
