import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { formatNavCount } from "./format-nav-count";
import { navRailBadgeVariants, navRailItemVariants, navRailVariants } from "./nav-rail.variants";

export type NavRailProps = React.ComponentProps<"nav"> & {
  /** Names the navigation, e.g. "Navigasi utama". */
  "aria-label": string;
};

/**
 * A narrow column of icon destinations down the left edge — the app's main
 * navigation when there are only a handful of places to go and the content
 * needs the width. For a labelled, collapsible menu use `Sidebar`; for the
 * same destinations on a phone pair it with `BottomNav`.
 *
 * Presentational: it does not hide itself at small widths. Add
 * `hidden md:flex` (and show a `BottomNav` below `md`) where you mount it.
 */
export function NavRail({ className, ...props }: NavRailProps) {
  return <nav data-slot="nav-rail" className={cn(navRailVariants(), className)} {...props} />;
}

/** Top slot, usually the product mark. */
export function NavRailHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="nav-rail-header" className={cn("mb-3 flex flex-col items-center", className)} {...props} />;
}

/** Pushed to the bottom: workspace switcher, account menu. */
export function NavRailFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="nav-rail-footer" className={cn("mt-auto flex flex-col items-center gap-2", className)} {...props} />;
}

export type NavRailItemProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** The destination's name. Icon-only on screen, so it becomes the
   *  accessible name and the tooltip (`title`). */
  label: string;
  icon: React.ReactNode;
  /** Unread count or similar. Hidden at 0; past 99 shows "99+". */
  badge?: number;
  /** Marks the current page (`aria-current="page"`). Leave unset when the
   *  child is a router link that sets `aria-current` itself. */
  active?: boolean;
  /** Render the child element — usually a router `Link` — instead of a
   *  `<button>`. The icon and badge are placed inside it. */
  asChild?: boolean;
  children?: React.ReactElement;
};

export function NavRailItem({
  className,
  label,
  icon,
  badge,
  active,
  asChild = false,
  children,
  ...props
}: NavRailItemProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="nav-rail-item"
      // aria-label overrides the content, so the count is spoken through it.
      aria-label={badge ? `${label} (${formatNavCount(badge)})` : label}
      title={label}
      {...(active ? { "aria-current": "page" as const } : {})}
      {...(!asChild ? { type: "button" as const } : {})}
      className={cn(navRailItemVariants(), className)}
      {...props}
    >
      <span aria-hidden="true" className="contents">{icon}</span>
      <Slottable>{children}</Slottable>
      {badge ? (
        <span data-slot="nav-rail-badge" className={navRailBadgeVariants()}>
          {formatNavCount(badge)}
        </span>
      ) : null}
    </Comp>
  );
}
