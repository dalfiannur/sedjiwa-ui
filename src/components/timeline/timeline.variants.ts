import { cva, type VariantProps } from "class-variance-authority";

export const timelineVariants = cva("flex flex-col", {
  variants: {
    size: {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: { size: "default" },
});

export const timelineItemVariants = cva("relative flex gap-3", {
  variants: {
    size: {
      // Bottom padding is the gap to the next event; the connector runs
      // through it, so the two cannot be set independently.
      sm: "pb-3",
      default: "pb-4",
      lg: "pb-5",
    },
    last: {
      true: "pb-0",
      false: "",
    },
  },
  defaultVariants: { size: "default", last: false },
});

export const timelineDotVariants = cva(
  [
    "relative z-[1] flex shrink-0 items-center justify-center rounded-full",
    "border-2 bg-background",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      status: {
        default: "border-muted-foreground/40",
        success: "border-success",
        warning: "border-warning",
        error: "border-destructive",
      },
      hasIcon: {
        true: "size-6 [&_svg]:size-3",
        false: "size-3",
      },
    },
    compoundVariants: [
      // Without an icon the dot is a filled disc, so the status has to live in
      // the fill; with one, the ring carries it and the fill stays out of the
      // glyph's way.
      { hasIcon: false, status: "default", class: "bg-muted-foreground/40" },
      { hasIcon: false, status: "success", class: "bg-success" },
      { hasIcon: false, status: "warning", class: "bg-warning" },
      { hasIcon: false, status: "error", class: "bg-destructive" },
    ],
    defaultVariants: { status: "default", hasIcon: false },
  },
);

export const timelineConnectorVariants = cva(
  "bg-border absolute top-0 bottom-0 w-px -translate-x-1/2",
  {
    variants: {
      hasIcon: {
        true: "left-3",
        false: "left-1.5",
      },
    },
    defaultVariants: { hasIcon: false },
  },
);

export const timelineContentVariants = cva("min-w-0 flex-1", {
  variants: {
    hasIcon: {
      // Nudge the text onto the dot's centre line so the first line of the
      // title reads level with its marker.
      true: "pt-0.5",
      false: "-mt-1",
    },
  },
  defaultVariants: { hasIcon: false },
});

export type TimelineVariants = VariantProps<typeof timelineVariants>;
export type TimelineItemVariants = VariantProps<typeof timelineItemVariants>;
export type TimelineDotVariants = VariantProps<typeof timelineDotVariants>;
export type TimelineConnectorVariants = VariantProps<
  typeof timelineConnectorVariants
>;
export type TimelineContentVariants = VariantProps<
  typeof timelineContentVariants
>;
