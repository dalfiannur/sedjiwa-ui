import { cva, type VariantProps } from "class-variance-authority";

export const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
      /**
       * These slots are intentionally empty, and `variant.icon` above carries no
       * colour. Every background/foreground class lives in the gated
       * compoundVariants below, so exactly one ever matches and there is never a
       * second colour class for twMerge to reconcile.
       *
       * Do NOT fold `bg-muted text-foreground` back into `variant.icon` — it looks
       * redundant with the `tone: "default"` compound, but moving it there makes
       * the slot additive: a toned compound would then have to override a colour
       * the variant already applied. Badge took that shape and it produced two
       * bugs (a variant's border silently stripped, and a `dark:`-scoped class an
       * unscoped one could not cancel).
       */
      tone: {
        default: "",
        success: "",
        muted: "",
      },
    },
    compoundVariants: [
      { variant: "icon", tone: "default", class: "bg-muted text-foreground" },
      {
        variant: "icon",
        tone: "success",
        class: "bg-success-subtle text-success-text",
      },
      { variant: "icon", tone: "muted", class: "bg-muted text-muted-foreground" },
    ],
    defaultVariants: {
      variant: "default",
      tone: "default",
    },
  }
);

export type EmptyMediaVariants = VariantProps<typeof emptyMediaVariants>;
