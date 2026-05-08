import { cva, type VariantProps } from "class-variance-authority";

export const textareaVariants = cva(
  [
    "field-sizing-content min-h-16 resize-y px-3 py-2",
    "outline-none placeholder:text-muted-foreground",
    "selection:bg-primary selection:text-primary-foreground",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "text-sm min-h-12 px-3 py-1.5",
        default: "text-base md:text-sm min-h-16 px-3 py-2",
        lg: "text-base min-h-20 px-4 py-2.5",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type TextareaVariants = VariantProps<typeof textareaVariants>;
