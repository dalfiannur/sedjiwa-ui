import { cva, type VariantProps } from "class-variance-authority";

export const numberInputControlsVariants = cva(
  "flex shrink-0 flex-col self-stretch border-l border-input",
  {
    variants: {
      size: {
        sm: "w-6",
        default: "w-7",
        lg: "w-8",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export const numberInputStepVariants = cva(
  [
    "flex flex-1 items-center justify-center text-muted-foreground",
    "transition-colors duration-150",
    "hover:bg-accent hover:text-accent-foreground",
    "focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:relative focus-visible:z-[1]",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      side: {
        // The divider belongs between the two halves, not under the lower one.
        up: "border-b border-input",
        down: "",
      },
      size: {
        sm: "[&_svg]:size-3",
        default: "[&_svg]:size-3.5",
        lg: "[&_svg]:size-4",
      },
    },
    defaultVariants: { side: "up", size: "default" },
  },
);

export type NumberInputControlsVariants = VariantProps<
  typeof numberInputControlsVariants
>;
export type NumberInputStepVariants = VariantProps<
  typeof numberInputStepVariants
>;
