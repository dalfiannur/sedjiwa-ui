import { cva, type VariantProps } from "class-variance-authority";

export const bottomNavVariants = cva(
  "bg-sidebar border-sidebar-border flex h-16 shrink-0 border-t pb-[env(safe-area-inset-bottom)]",
);

/** One destination: icon over a short label, sharing the bar's width with
 *  its siblings. Active follows `aria-current="page"`, like `NavRailItem`. */
export const bottomNavItemVariants = cva(
  [
    "text-muted-foreground flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
    "aria-[current=page]:text-sidebar-primary aria-[current=page]:font-bold",
    "focus-visible:ring-sidebar-ring/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[22px]",
  ].join(" "),
);

export const bottomNavBadgeVariants = cva(
  "bg-primary text-primary-foreground absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] leading-none font-bold tabular-nums",
);

export type BottomNavVariants = VariantProps<typeof bottomNavVariants>;
