import { cva, type VariantProps } from "class-variance-authority";

export const segmentedControlVariants = cva(
  "bg-muted text-muted-foreground inline-flex items-center justify-center rounded-lg p-[3px]",
  {
    variants: {
      size: {
        sm: "h-8",
        default: "h-9",
        lg: "h-10",
      },
      orientation: {
        horizontal: "flex-row",
        vertical: "h-auto w-fit flex-col items-stretch",
      },
      fullWidth: {
        true: "flex w-full",
        false: "w-fit",
      },
    },
    defaultVariants: {
      size: "default",
      orientation: "horizontal",
      fullWidth: false,
    },
  },
);

export const segmentedControlItemVariants = cva(
  [
    "text-foreground dark:text-muted-foreground inline-flex items-center justify-center gap-1.5",
    "rounded-md border border-transparent px-2 py-1 font-medium whitespace-nowrap",
    "transition-[color,box-shadow,background-color]",
    "data-[state=on]:bg-background data-[state=on]:shadow-sm",
    "dark:data-[state=on]:text-foreground dark:data-[state=on]:border-input dark:data-[state=on]:bg-input/30",
    "data-[state=off]:hover:bg-background/50",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-[calc(100%-1px)] text-xs",
        default: "h-[calc(100%-1px)] text-sm",
        lg: "h-[calc(100%-1px)] text-sm",
      },
      orientation: {
        horizontal: "",
        vertical: "h-auto w-full",
      },
      fullWidth: {
        true: "flex-1",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      orientation: "horizontal",
      fullWidth: false,
    },
  },
);

export type SegmentedControlVariants = VariantProps<
  typeof segmentedControlVariants
>;
export type SegmentedControlItemVariants = VariantProps<
  typeof segmentedControlItemVariants
>;
