import { cva, type VariantProps } from "class-variance-authority";

export const accordionItemVariants = cva("", {
  variants: {
    variant: {
      /** Hairline between sections — the quiet default for a settings panel. */
      separated: "border-b border-border last:border-b-0",
      /** Each section in its own bordered card, for a page of unrelated blocks. */
      contained:
        "border border-border rounded-md mb-2 last:mb-0 overflow-hidden",
      /** Nothing but the sections themselves. */
      plain: "",
    },
  },
  defaultVariants: { variant: "separated" },
});

export const accordionTriggerVariants = cva(
  [
    "flex flex-1 items-center justify-between gap-3 w-full text-left",
    "font-medium text-foreground",
    "transition-[color,background-color] duration-150",
    "hover:underline underline-offset-4",
    "focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:relative focus-visible:z-[1] rounded-sm",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "py-2.5 text-sm [&_svg]:size-3.5",
        default: "py-3.5 text-sm [&_svg]:size-4",
        lg: "py-4 text-base [&_svg]:size-4",
      },
      variant: {
        separated: "",
        contained: "px-3",
        plain: "",
      },
    },
    defaultVariants: { size: "default", variant: "separated" },
  },
);

export const accordionContentVariants = cva(
  [
    "overflow-hidden text-muted-foreground",
    // Height keyframes from tw-animate-css, driven by the element height Radix
    // measures into --radix-accordion-content-height. Deliberately left alive
    // under prefers-reduced-motion; see the note in styles/base.css.
    "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-sm",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type AccordionItemVariants = VariantProps<typeof accordionItemVariants>;
export type AccordionTriggerVariants = VariantProps<
  typeof accordionTriggerVariants
>;
export type AccordionContentVariants = VariantProps<
  typeof accordionContentVariants
>;
