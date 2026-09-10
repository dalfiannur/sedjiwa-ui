import { cva, type VariantProps } from "class-variance-authority";

export const sliderVariants = cva(
  "relative flex touch-none select-none items-center data-[disabled]:opacity-50",
  {
    variants: {
      orientation: {
        horizontal: "w-full",
        vertical: "h-44 flex-col",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

export const sliderTrackVariants = cva(
  "bg-muted relative grow overflow-hidden rounded-full",
  {
    variants: {
      orientation: {
        horizontal: "h-full w-full",
        vertical: "w-full",
      },
      size: {
        sm: "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1",
        default:
          "data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5",
        lg: "data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2",
      },
    },
    defaultVariants: { orientation: "horizontal", size: "default" },
  },
);

export const sliderRangeVariants = cva("bg-primary absolute", {
  variants: {
    orientation: {
      horizontal: "h-full",
      vertical: "w-full",
    },
  },
  defaultVariants: { orientation: "horizontal" },
});

export const sliderThumbVariants = cva(
  [
    "border-primary bg-background block shrink-0 rounded-full border shadow-sm",
    "transition-[color,box-shadow]",
    "hover:ring-ring/50 hover:ring-4",
    "focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-4",
    "disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "size-3.5",
        default: "size-4",
        lg: "size-5",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type SliderVariants = VariantProps<typeof sliderVariants>;
export type SliderTrackVariants = VariantProps<typeof sliderTrackVariants>;
export type SliderThumbVariants = VariantProps<typeof sliderThumbVariants>;
