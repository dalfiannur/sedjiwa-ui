import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { badgeVariants, type BadgeVariants } from "./badge.variants";

export type BadgeProps = React.ComponentProps<"span"> &
  BadgeVariants & { asChild?: boolean };

export function Badge({
  className,
  variant,
  appearance,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? "default"}
      data-appearance={appearance ?? "solid"}
      className={cn(badgeVariants({ variant, appearance }), className)}
      {...props}
    />
  );
}
