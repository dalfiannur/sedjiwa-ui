import { cva, type VariantProps } from "class-variance-authority";

export const navRailVariants = cva(
  "bg-sidebar text-sidebar-foreground border-sidebar-border flex w-[72px] shrink-0 flex-col items-center gap-2 border-r py-4",
);

/** One destination: a 44px square (touch-target minimum) holding an icon.
 *  Active is marked by `aria-current="page"` — set by `active`, or by a
 *  router link that sets it itself — and drawn with the sidebar tokens. */
export const navRailItemVariants = cva(
  [
    "relative grid size-11 place-items-center rounded-xl text-muted-foreground transition-colors",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-primary",
    "focus-visible:ring-sidebar-ring/50 focus-visible:outline-none focus-visible:ring-[3px]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  ].join(" "),
);

/** The count on an item: primary fill, ringed in the rail colour so it reads
 *  as sitting on top of the icon square. */
export const navRailBadgeVariants = cva(
  "bg-primary text-primary-foreground border-sidebar absolute top-1 right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 px-1 text-[11px] leading-none font-bold tabular-nums",
);

export type NavRailVariants = VariantProps<typeof navRailVariants>;
