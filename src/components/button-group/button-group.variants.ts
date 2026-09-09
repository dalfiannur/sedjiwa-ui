import { cva, type VariantProps } from "class-variance-authority";

export const buttonGroupVariants = cva(
  [
    "inline-flex w-fit isolate",
    // The frame is the group's, not each button's: children give up their own
    // radius, border and shadow so the seam between them is one hairline
    // rather than two stacked ones.
    "overflow-hidden rounded-md border",
    "[&>*]:rounded-none [&>*]:border-0 [&>*]:shadow-none",
    // The seam is drawn with :not(:first-child) rather than `divide-x`, and
    // that is not a style choice. `divide-x` emits `& > * + *` — specificity
    // (0,1,1) — which ties with `[&>*]:border-0` above and loses to it on
    // source order, so every divider silently came out 0px wide. Shipped that
    // way in 0.41.0. `:not(:first-child)` scores (0,2,0) and outranks the
    // reset outright, so the seam no longer depends on how Tailwind happens to
    // order its output.
    // Keyboard focus has to escape the overflow clip, so the ring is drawn
    // inside the button and the focused child is lifted above its neighbours.
    "[&>*:focus-visible]:z-10 [&>*:focus-visible]:ring-inset",
  ].join(" "),
  {
    variants: {
      orientation: {
        horizontal: "flex-row [&>*:not(:first-child)]:border-l",
        vertical: "flex-col [&>*:not(:first-child)]:border-t",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

export type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>;
