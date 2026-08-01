import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        success:
          "border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning:
          "border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        info:
          "border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
      appearance: {
        // Deliberately empty. `border-transparent` must NOT live here: it would
        // also apply to `outline`, whose entire visual identity is its border,
        // silently rendering an outline+subtle badge as unstyled floating text.
        // The four toned variants already supply `border-transparent` from
        // their own variant slot, so the subtle compounds inherit it for free.
        solid: "",
        subtle: "",
      },
    },
    compoundVariants: [
      {
        variant: "success",
        appearance: "subtle",
        class: "bg-success-subtle text-success-text [a&]:hover:bg-success-subtle/80",
      },
      {
        variant: "warning",
        appearance: "subtle",
        class: "bg-warning-subtle text-warning-text [a&]:hover:bg-warning-subtle/80",
      },
      {
        variant: "info",
        appearance: "subtle",
        class: "bg-info-subtle text-info-text [a&]:hover:bg-info-subtle/80",
      },
      {
        variant: "destructive",
        appearance: "subtle",
        // The `dark:bg-destructive-subtle` below is required, not defensive:
        // twMerge cannot cancel a `dark:`-scoped class with an unscoped one, so
        // `dark:bg-destructive/60` from the variant slot survives unless it is
        // explicitly overridden at the same modifier scope. Without it a subtle
        // destructive badge carries two backgrounds in dark mode and the winner
        // depends on generated stylesheet order. Verified by removal.
        class:
          "bg-destructive-subtle text-destructive-text dark:bg-destructive-subtle [a&]:hover:bg-destructive-subtle/80",
      },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "solid",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
