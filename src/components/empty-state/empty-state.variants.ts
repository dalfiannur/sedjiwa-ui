import { cva, type VariantProps } from "class-variance-authority";

export const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
      tone: {
        default: "",
        success: "",
        muted: "",
      },
    },
    compoundVariants: [
      { variant: "icon", tone: "default", class: "bg-muted text-foreground" },
      {
        variant: "icon",
        tone: "success",
        class: "bg-success-subtle text-success-text",
      },
      { variant: "icon", tone: "muted", class: "bg-muted text-muted-foreground" },
    ],
    defaultVariants: {
      variant: "default",
      tone: "default",
    },
  }
);

export type EmptyMediaVariants = VariantProps<typeof emptyMediaVariants>;
