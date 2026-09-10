import { cva, type VariantProps } from "class-variance-authority";

export const kbdVariants = cva(
  [
    "bg-muted text-muted-foreground border-input inline-flex items-center justify-center",
    "rounded border border-b-2 font-medium select-none",
    "font-sans",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-4 min-w-4 px-1 text-[10px]",
        default: "h-5 min-w-5 px-1.5 text-xs",
        lg: "h-6 min-w-6 px-2 text-sm",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export const kbdGroupVariants = cva("inline-flex items-center", {
  variants: {
    size: {
      sm: "gap-0.5",
      default: "gap-1",
      lg: "gap-1",
    },
  },
  defaultVariants: { size: "default" },
});

export type KbdVariants = VariantProps<typeof kbdVariants>;
export type KbdGroupVariants = VariantProps<typeof kbdGroupVariants>;
