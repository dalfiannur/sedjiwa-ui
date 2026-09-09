import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  // px-3/py-1 and semibold, up from px-2/py-0.5 and medium: the Figma's status
  // pill is a 27px-tall object that holds its own against a table row, not a
  // tag clinging to its label.
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        success:
          "border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning:
          "border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        info:
          "border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // User-chosen label colours. They bring their own fill and text, so
        // `appearance` does not apply — a label has no solid/subtle pair,
        // it is only ever the tinted chip.
        "label-teal":
          "border-transparent bg-label-teal text-label-teal-text [a&]:hover:bg-label-teal/80",
        "label-blue":
          "border-transparent bg-label-blue text-label-blue-text [a&]:hover:bg-label-blue/80",
        "label-amber":
          "border-transparent bg-label-amber text-label-amber-text [a&]:hover:bg-label-amber/80",
        "label-rose":
          "border-transparent bg-label-rose text-label-rose-text [a&]:hover:bg-label-rose/80",
        "label-violet":
          "border-transparent bg-label-violet text-label-violet-text [a&]:hover:bg-label-violet/80",
        "label-lime":
          "border-transparent bg-label-lime text-label-lime-text [a&]:hover:bg-label-lime/80",
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
        class: "bg-destructive-subtle text-destructive-text [a&]:hover:bg-destructive-subtle/80",
      },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "solid",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
