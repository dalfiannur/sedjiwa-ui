import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../lib/cn";
import { avatarColorClass } from "./avatar-color";
import { avatarVariants, type AvatarVariants } from "./avatar.variants";

export type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> &
  AvatarVariants & {
    /** A small mark on the bottom-right edge — e.g. a people glyph for a
     *  group chat. It sits outside the clipped circle, so passing it wraps
     *  the avatar in a positioned `<span data-slot="avatar-wrapper">`; without
     *  it the DOM is unchanged. */
    badge?: React.ReactNode;
    /** Accessible name for `badge`. Without one the badge is decorative. */
    badgeLabel?: string;
  };

export function Avatar({ className, size, badge, badgeLabel, ...props }: AvatarProps) {
  const root = (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size ?? "default"}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
  if (badge == null) return root;
  return (
    <span data-slot="avatar-wrapper" className="relative inline-flex shrink-0">
      {root}
      <span
        data-slot="avatar-badge"
        {...(badgeLabel ? { role: "img", "aria-label": badgeLabel } : { "aria-hidden": true })}
        className="bg-card text-secondary-foreground ring-border absolute -right-1 -bottom-1 grid size-[18px] place-items-center rounded-full ring-1 [&>svg]:size-[11px]"
      >
        {badge}
      </span>
    </span>
  );
}

export function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

export type AvatarFallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  /** Tints the fallback from the label palette, picked by a stable hash of
   *  this key (a user id, a phone number). The same key always gets the same
   *  colour. Without it the fallback stays on `--muted`. */
  colorKey?: string;
};

export function AvatarFallback({
  className,
  colorKey,
  ...props
}: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      // No text size of its own — it inherits the root's, which is what makes
      // one `size` prop move the circle and the initials together. Setting one
      // here would win over the root and pin the initials at a single size
      // again, which is the bug this scale exists to remove.
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        colorKey != null && cn("font-semibold", avatarColorClass(colorKey)),
        className
      )}
      {...props}
    />
  );
}
