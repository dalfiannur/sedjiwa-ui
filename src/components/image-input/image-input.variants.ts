import { cva, type VariantProps } from "class-variance-authority";

/** The picker itself — the circle (or rounded square) you click.
 *
 *  The focus ring reaches in from the `<label>` group rather than living here.
 *  The element that actually takes focus is the visually-hidden
 *  `<input type="file">`, and it is a *sibling* of this span, not a child — so
 *  a plain `focus-within:` here would never once fire. The group modifier also
 *  carries `:focus-within`'s own specificity, which is what lets it outrank
 *  the resting ring the `state` variant draws. */
export const imageInputPickerVariants = cva(
  [
    "relative flex shrink-0 items-center justify-center overflow-hidden",
    "bg-muted text-muted-foreground",
    "transition-[color,box-shadow,border-color] duration-150",
    "group-focus-within/image-input:ring-ring/40 group-focus-within/image-input:ring-[3px]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      shape: {
        circle: "rounded-full",
        square: "rounded-xl",
      },
      size: {
        sm: "size-16 [&_svg]:size-5",
        default: "size-24 [&_svg]:size-7",
        lg: "size-32 [&_svg]:size-9",
      },
      // No fill of its own: the picker is mostly covered by the image, and a
      // tinted disc behind a photograph reads as a rendering fault. Only the
      // rim changes.
      state: {
        default: "ring-1 ring-border ring-inset",
        error: "ring-2 ring-destructive ring-inset",
        success: "ring-2 ring-success ring-inset",
        warning: "ring-2 ring-warning ring-inset",
      },
    },
    defaultVariants: { shape: "circle", size: "default", state: "default" },
  },
);

export type ImageInputPickerVariants = VariantProps<
  typeof imageInputPickerVariants
>;

/** The caption under the picker — "Unggah foto" in the source design.
 *
 *  It sits inside the same `<label>` as the picker, so it opens the file
 *  dialog natively on click and needs no handler of its own. It is styled as a
 *  link because it behaves like the primary affordance, but it is not an `<a>`:
 *  it navigates nowhere. */
export const imageInputCaptionVariants = cva(
  "text-primary font-medium underline-offset-4 group-hover/image-input:underline",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-sm",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type ImageInputCaptionVariants = VariantProps<
  typeof imageInputCaptionVariants
>;
