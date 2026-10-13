import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { badgeVariants, type BadgeVariants } from "./badge.variants";

export type BadgeProps = React.ComponentProps<"span"> &
  BadgeVariants & {
    asChild?: boolean;
    /** A small dot in the text colour before the label — the status-pill
     *  look ("● Connected"). Decorative: the label carries the meaning.
     *  Ignored with `asChild`, which renders the child as-is. */
    dot?: boolean;
  };

export function Badge({
  className,
  variant,
  appearance,
  asChild = false,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? "default"}
      data-appearance={appearance ?? "solid"}
      className={cn(badgeVariants({ variant, appearance }), dot && !asChild && "gap-1.5", className)}
      {...props}
    >
      {/* Slot takes exactly one child, so the dot only exists without asChild. */}
      {asChild
        ? children
        : (
            <>
              {dot && (
                <span data-slot="badge-dot" aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
              )}
              {children}
            </>
          )}
    </Comp>
  );
}
