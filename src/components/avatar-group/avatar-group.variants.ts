import { cva, type VariantProps } from "class-variance-authority";

/** The stack.
 *
 *  `ring-card` on each child is what makes the overlap legible: without a
 *  ring in the surface colour the faces bleed into one another and read as a
 *  single smear. It defaults to `--card` because a stack almost always sits in
 *  one; override with `[&>*]:ring-<surface>` where it does not. */
export const avatarGroupVariants = cva(
  "flex items-center [&>*]:shrink-0 [&>*]:ring-2 [&>*]:ring-card",
  {
    variants: {
      // Text size is set on the children, not inherited from the stack. Every
      // `Avatar` now carries a text size of its own, and a class on the child
      // beats anything the parent passes down — so a stack that only set the
      // size here would leave a `size="sm"` group rendering default-size
      // initials. `[&>*]` outranks the child's own class and holds the whole
      // stack, the overflow chip included, at one size.
      size: {
        sm: "-space-x-1.5 [&>*]:size-6 [&>*]:text-[0.625rem]",
        default: "-space-x-2 [&>*]:size-8 [&>*]:text-xs",
        lg: "-space-x-2.5 [&>*]:size-10 [&>*]:text-sm",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type AvatarGroupVariants = VariantProps<typeof avatarGroupVariants>;
