import { cva, type VariantProps } from "class-variance-authority";

export const alertVariants = cva(
  [
    "relative flex w-full gap-3 p-4 text-sm",
    // The kit asks for a 4px left edge in the tone colour. It is the third
    // signal alongside the icon and the text, so the variant never rests on
    // colour alone — which also means it must not be dropped for being decor.
    "border-l-4",
  ].join(" "),
  {
    variants: {
      variant: {
        info: "bg-info-subtle text-info-text border-l-info",
        success: "bg-success-subtle text-success-text border-l-success",
        warning: "bg-warning-subtle text-warning-text border-l-warning",
        error: "bg-destructive-subtle text-destructive-text border-l-destructive",
      },
      // Page-level banners sit flush against the page edge; inline ones sit
      // inside a card and take its radius.
      placement: {
        inline: "rounded-lg",
        page: "rounded-none",
      },
    },
    defaultVariants: { variant: "info", placement: "inline" },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;
