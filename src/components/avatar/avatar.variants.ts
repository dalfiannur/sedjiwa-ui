import { cva, type VariantProps } from "class-variance-authority";

/** The circle.
 *
 *  Every step sets a text size alongside the box, and that pairing is the
 *  point: an avatar with no image falls back to initials, and initials left at
 *  one fixed size read as a rendering fault on a 112px circle. The scale is
 *  deliberately coarse — five steps, each a recognisable role (in a table row,
 *  in a chat line, on a profile card) rather than a continuous ramp. Reach for
 *  `className="size-9"` when a layout genuinely needs a size between two
 *  steps; that still works, it simply does not carry the matching text size. */
export const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "size-6 text-[0.625rem]",
        default: "size-8 text-xs",
        lg: "size-10 text-sm",
        xl: "size-16 text-xl",
        "2xl": "size-28 text-3xl",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type AvatarVariants = VariantProps<typeof avatarVariants>;
