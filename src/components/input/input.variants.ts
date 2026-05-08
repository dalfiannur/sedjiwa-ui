import { cva, type VariantProps } from "class-variance-authority";

export const inputIconVariants = cva(
  "flex shrink-0 items-center justify-center text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "w-8",
        default: "w-9",
        lg: "w-10",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export const inputAddonVariants = cva(
  "flex shrink-0 items-center bg-muted/50 text-muted-foreground select-none whitespace-nowrap",
  {
    variants: {
      side: {
        leading: "border-r border-input",
        trailing: "border-l border-input",
      },
      size: {
        sm: "px-2.5 text-xs",
        default: "px-3 text-sm",
        lg: "px-3.5 text-sm",
      },
    },
    defaultVariants: { size: "default", side: "leading" },
  },
);

export const inputActionVariants = cva(
  [
    "flex shrink-0 items-center justify-center text-muted-foreground",
    "transition-colors duration-150",
    "hover:bg-accent hover:text-accent-foreground",
    "focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:relative focus-visible:z-[1]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "w-8",
        default: "w-9",
        lg: "w-10",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export const inputFieldVariants = cva(
  [
    "flex-1 min-w-0 h-full bg-transparent outline-none px-3 py-1",
    "placeholder:text-muted-foreground",
    "selection:bg-primary selection:text-primary-foreground",
    "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "disabled:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "text-sm",
        default: "text-base md:text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type InputIconVariants = VariantProps<typeof inputIconVariants>;
export type InputAddonVariants = VariantProps<typeof inputAddonVariants>;
export type InputActionVariants = VariantProps<typeof inputActionVariants>;
export type InputFieldVariants = VariantProps<typeof inputFieldVariants>;
