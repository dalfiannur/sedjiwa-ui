import { cva, type VariantProps } from "class-variance-authority";

export const fieldSurfaceVariants = cva(
  [
    "flex w-full min-w-0 rounded-md border bg-transparent text-foreground overflow-hidden",
    "shadow-xs dark:bg-input/30",
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
    defaultVariants: { size: "default", state: "default" },
  },
);

export type FieldSurfaceVariants = VariantProps<typeof fieldSurfaceVariants>;
