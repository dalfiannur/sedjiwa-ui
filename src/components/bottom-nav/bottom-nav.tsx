import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { formatNavCount } from "../nav-rail/format-nav-count";
import { bottomNavBadgeVariants, bottomNavItemVariants, bottomNavVariants } from "./bottom-nav.variants";

export type BottomNavProps = React.ComponentProps<"nav"> & {
  /** Names the navigation, e.g. "Navigasi utama". */
  "aria-label": string;
};

/**
 * The phone counterpart of `NavRail`: the same destinations as a tab bar
 * along the bottom edge, each with a visible label. Pads itself above the
 * home indicator (`safe-area-inset-bottom`).
 *
 * Presentational: add `md:hidden` (and a `NavRail` from `md`) where you
 * mount it, and leave it out on screens that need the full height.
 */
export function BottomNav({ className, ...props }: BottomNavProps) {
  return <nav data-slot="bottom-nav" className={cn(bottomNavVariants(), className)} {...props} />;
}

export type BottomNavItemProps = Omit<React.ComponentProps<"button">, "children"> & {
  label: string;
  icon: React.ReactNode;
  /** Unread count or similar, on the icon. Hidden at 0; past 99 shows "99+". */
  badge?: number;
  /** Marks the current page. Leave unset for a router link that sets
   *  `aria-current` itself. */
  active?: boolean;
  /** Render the child element (a router `Link`) instead of a `<button>`. */
  asChild?: boolean;
  children?: React.ReactElement;
};

export function BottomNavItem({
  className,
  label,
  icon,
  badge,
  active,
  asChild = false,
  children,
  ...props
}: BottomNavItemProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="bottom-nav-item"
      // The badge is aria-hidden with its icon; the count is spoken here. The
      // name still starts with the visible label (WCAG 2.5.3).
      {...(badge ? { "aria-label": `${label} (${formatNavCount(badge)})` } : {})}
      {...(active ? { "aria-current": "page" as const } : {})}
      {...(!asChild ? { type: "button" as const } : {})}
      className={cn(bottomNavItemVariants(), className)}
      {...props}
    >
      <span className="relative" aria-hidden="true">
        {icon}
        {badge ? (
          <span data-slot="bottom-nav-badge" className={bottomNavBadgeVariants()}>
            {formatNavCount(badge)}
          </span>
        ) : null}
      </span>
      <Slottable>{children}</Slottable>
      <span className="max-w-full truncate">
        {label}
      </span>
    </Comp>
  );
}
