import { cva, type VariantProps } from "class-variance-authority";

export const filterChipGroupVariants = cva("flex flex-wrap items-center gap-1.5");

/** The chip. Off is a quiet outline on the card colour; on takes the accent
 *  tint with a primary border, so the selection reads at a glance without a
 *  solid fill competing with the content it filters. */
export const filterChipVariants = cva(
  [
    "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs whitespace-nowrap",
    "transition-[color,background-color,border-color]",
    "data-[state=off]:border-border data-[state=off]:bg-card data-[state=off]:text-secondary-foreground data-[state=off]:font-medium data-[state=off]:hover:bg-muted",
    "data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:font-semibold",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  ].join(" "),
);

export type FilterChipVariants = VariantProps<typeof filterChipVariants>;
