import { cva, type VariantProps } from "class-variance-authority";

export const dataListVariants = cva("w-full", {
  variants: {
    size: {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base",
    },
    /** Gap between rows. Denser lists read as a table; looser ones as prose. */
    dense: {
      true: "",
      false: "",
    },
  },
  defaultVariants: { size: "default", dense: false },
});

export const dataListItemVariants = cva("", {
  variants: {
    orientation: {
      // The label column is `--data-list-label-width` wide and the value sits
      // beside it, so every value in the list shares one left edge. Below `sm`
      // the row folds: a fixed label column on a phone leaves the value a
      // sliver to wrap inside.
      horizontal: "flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4",
      vertical: "flex flex-col gap-0.5",
    },
    dense: {
      true: "py-1",
      false: "py-1.5",
    },
  },
  defaultVariants: { orientation: "horizontal", dense: false },
});

export const dataListLabelVariants = cva(
  // One size down and muted. Colour alone cannot carry the label/value
  // distinction — the same rule `card-list-table` follows for its rows.
  "text-muted-foreground shrink-0 leading-snug",
  {
    variants: {
      orientation: {
        horizontal:
          "sm:w-[var(--data-list-label-width)] sm:max-w-[var(--data-list-label-width)]",
        vertical: "",
      },
      size: {
        sm: "text-[11px]",
        default: "text-xs",
        lg: "text-sm",
      },
    },
    defaultVariants: { orientation: "horizontal", size: "default" },
  },
);

export const dataListValueVariants = cva(
  "text-foreground min-w-0 flex-1 leading-snug break-words",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type DataListVariants = VariantProps<typeof dataListVariants>;
export type DataListItemVariants = VariantProps<typeof dataListItemVariants>;
export type DataListLabelVariants = VariantProps<typeof dataListLabelVariants>;
export type DataListValueVariants = VariantProps<typeof dataListValueVariants>;
