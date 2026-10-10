import { cva, type VariantProps } from "class-variance-authority";

/** `tone` follows the surface the player sits on: `default` for card/muted
 *  surfaces (incoming bubbles), `inverted` for `--primary` (outgoing). */
export const audioMessageButtonVariants = cva(
  "grid size-9 shrink-0 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] [&_svg]:size-4",
  {
    variants: {
      tone: {
        default: "bg-accent text-primary hover:bg-accent/80 focus-visible:ring-ring/50",
        inverted: "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 focus-visible:ring-primary-foreground/50",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export const audioMessageTrackVariants = cva("relative h-1.5 w-full grow overflow-hidden rounded-full", {
  variants: {
    tone: {
      default: "bg-border",
      inverted: "bg-primary-foreground/30",
    },
  },
  defaultVariants: { tone: "default" },
});

export const audioMessageRangeVariants = cva("absolute h-full rounded-full", {
  variants: {
    tone: {
      default: "bg-primary",
      inverted: "bg-primary-foreground",
    },
  },
  defaultVariants: { tone: "default" },
});

export const audioMessageThumbVariants = cva(
  "block size-3 rounded-full shadow-sm transition-transform focus-visible:outline-none focus-visible:ring-[3px] hover:scale-110",
  {
    variants: {
      tone: {
        default: "bg-primary focus-visible:ring-ring/50",
        inverted: "bg-primary-foreground focus-visible:ring-primary-foreground/50",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export type AudioMessageVariants = VariantProps<typeof audioMessageButtonVariants>;
