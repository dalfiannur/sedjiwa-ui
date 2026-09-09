import { cva, type VariantProps } from "class-variance-authority";

/** `incoming`/`outgoing` rather than left/right: the side is a consequence of
 *  who wrote the message, and naming it by position would read backwards the
 *  moment the row is mirrored for RTL. */
export const chatBubbleRowVariants = cva("flex w-full items-end gap-3", {
  variants: {
    side: {
      incoming: "justify-start",
      outgoing: "justify-end",
    },
  },
  defaultVariants: { side: "incoming" },
});

export const chatBubbleSurfaceVariants = cva(
  [
    "flex max-w-[min(38rem,80%)] min-w-0 flex-col gap-1 px-4 py-3 text-sm",
    // One corner stays tight, and it is the one nearest the author — the shape
    // says which end of the conversation this came from even in a screenshot
    // with the colour stripped.
    "rounded-2xl",
  ].join(" "),
  {
    variants: {
      side: {
        incoming: "bg-muted text-foreground rounded-bl-sm",
        outgoing: "bg-primary text-primary-foreground rounded-br-sm",
      },
    },
    defaultVariants: { side: "incoming" },
  },
);

/** The timestamp row.
 *
 *  Incoming dims to --muted-foreground (5.34:1 on --muted). Outgoing does NOT
 *  dim: --primary-foreground on --primary measures 4.66:1, which leaves no
 *  headroom at all — any opacity below full drops it under the floor. There
 *  the hierarchy comes from size, and that is the whole reason these two are
 *  not the same class string. */
export const chatBubbleMetaVariants = cva(
  "flex items-center justify-end gap-1 text-[0.6875rem] leading-none tabular-nums",
  {
    variants: {
      side: {
        incoming: "text-muted-foreground",
        outgoing: "text-primary-foreground",
      },
    },
    defaultVariants: { side: "incoming" },
  },
);

export type ChatBubbleVariants = VariantProps<typeof chatBubbleSurfaceVariants>;
