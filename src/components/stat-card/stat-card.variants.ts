import { cva, type VariantProps } from "class-variance-authority";

/** The icon tile. Every pair here is one the contrast gate already checks —
 *  the `-subtle`/`-text` tones, plus `accent`/`accent-foreground` for primary,
 *  which has no subtle step of its own. Do not reach for a solid `bg-<tone>`
 *  here: those want a dark foreground, and a dark glyph on a saturated tile
 *  reads as a warning rather than as decoration. */
export const statCardTileVariants = cva(
  "flex size-14 shrink-0 items-center justify-center rounded-2xl [&>svg]:size-6",
  {
    variants: {
      tone: {
        primary: "bg-accent text-accent-foreground",
        success: "bg-success-subtle text-success-text",
        warning: "bg-warning-subtle text-warning-text",
        destructive: "bg-destructive-subtle text-destructive-text",
        info: "bg-info-subtle text-info-text",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { tone: "primary" },
  },
);

export type StatCardTileVariants = VariantProps<typeof statCardTileVariants>;
