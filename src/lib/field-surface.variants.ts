import { cva, type VariantProps } from "class-variance-authority";

export const fieldSurfaceVariants = cva(
  [
    "flex w-full min-w-0 border text-foreground overflow-hidden",
    "transition-[color,box-shadow,border-color,background-color] duration-150",
    "placeholder:text-muted-foreground",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "outline-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-8 text-sm",
        default: "h-9 text-sm",
        lg: "h-10 text-base",
      },
      // Radius, fill and shadow live here rather than in the base string so
      // the two appearances never both emit a `rounded-*` and leave the
      // winner to stylesheet order. `state` still owns the border colour and
      // the focus ring, which both appearances share.
      appearance: {
        default: "rounded-md bg-transparent shadow-xs dark:bg-input/30",
        // The Figma's top-bar search: a pill on a muted fill, reading as a
        // place to type rather than as a field in a form.
        search: "rounded-full bg-muted shadow-none dark:bg-input/50",
      },
      state: {
        default: [
          "border-input",
          "focus-within:border-ring focus-within:bg-primary/[0.06]",
          "focus-within:ring-ring/40 focus-within:ring-[3px]",
        ].join(" "),
        error: [
          "border-destructive bg-destructive/[0.07]",
          "focus-within:ring-destructive/35 focus-within:ring-[3px]",
        ].join(" "),
        success: "border-success bg-success/[0.08]",
        warning: "border-warning bg-warning/[0.10]",
      },
    },
    defaultVariants: { size: "default", state: "default", appearance: "default" },
  },
);

export type FieldSurfaceVariants = VariantProps<typeof fieldSurfaceVariants>;
