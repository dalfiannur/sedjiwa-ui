import { cva, type VariantProps } from "class-variance-authority";

/** One dot.
 *
 *  The inset ring is not decoration. A swatch carries an arbitrary colour from
 *  product data, and sooner or later that colour is white, ivory or a pale
 *  grey — on a `--card` surface those render as nothing at all. A hairline in
 *  the text colour at low alpha gives every swatch an edge, and because it is
 *  drawn from `--foreground` it flips with the theme: dark on a light card,
 *  light on a dark one. Inset so it never grows the dot. */
export const colorSwatchVariants = cva(
  "block shrink-0 rounded-full ring-1 ring-foreground/15 ring-inset",
  {
    variants: {
      size: {
        sm: "size-3",
        default: "size-4",
        lg: "size-5",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type ColorSwatchVariants = VariantProps<typeof colorSwatchVariants>;

/** The row.
 *
 *  Sizing reaches through `[&>*]` rather than being inherited, for the same
 *  reason `AvatarGroup` does: every `ColorSwatch` carries a size class of its
 *  own, and a class on the child beats anything the parent passes down. */
export const colorSwatchListVariants = cva("flex flex-wrap items-center", {
  variants: {
    size: {
      sm: "gap-1.5 [&>*]:size-3",
      default: "gap-2 [&>*]:size-4",
      lg: "gap-2.5 [&>*]:size-5",
    },
  },
  defaultVariants: { size: "default" },
});

export type ColorSwatchListVariants = VariantProps<
  typeof colorSwatchListVariants
>;
