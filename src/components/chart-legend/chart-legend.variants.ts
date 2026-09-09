import { cva, type VariantProps } from "class-variance-authority";

/** Two shapes from the same source design: a row of dot+label pairs under a
 *  chart, and the same pair carrying a figure above it. `stacked` is the
 *  second — it is a legend entry that happens to also be the number, not a
 *  separate component. */
export const chartLegendItemVariants = cva("flex min-w-0", {
  variants: {
    layout: {
      inline: "flex-row items-center gap-2",
      stacked: "flex-col gap-1",
    },
  },
  defaultVariants: { layout: "inline" },
});

export type ChartLegendItemVariants = VariantProps<typeof chartLegendItemVariants>;
