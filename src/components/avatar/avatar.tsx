import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../lib/cn";
import { avatarVariants, type AvatarVariants } from "./avatar.variants";

export type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> &
  AvatarVariants;

export function Avatar({ className, size, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size ?? "default"}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
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

export function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      // No text size of its own — it inherits the root's, which is what makes
      // one `size` prop move the circle and the initials together. Setting one
      // here would win over the root and pin the initials at a single size
      // again, which is the bug this scale exists to remove.
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}
