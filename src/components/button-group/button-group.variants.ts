import { cva, type VariantProps } from "class-variance-authority";

export const buttonGroupVariants = cva(
  [
    "inline-flex w-fit isolate",
    // The frame is the group's, not each button's: children give up their own
    // radius, border and shadow so the seam between them is one hairline
    // rather than two stacked ones.
    "overflow-hidden rounded-md border",
    "[&>*]:rounded-none [&>*]:border-0 [&>*]:shadow-none",
    // Keyboard focus has to escape the overflow clip, so the ring is drawn
    // inside the button and the focused child is lifted above its neighbours.
    "[&>*:focus-visible]:z-10 [&>*:focus-visible]:ring-inset",
  ].join(" "),
  {
    variants: {
      orientation: {
        horizontal: "flex-row divide-x",
        vertical: "flex-col divide-y",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

export type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>;
