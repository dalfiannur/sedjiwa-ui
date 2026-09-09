import { cva, type VariantProps } from "class-variance-authority";

/** The tone is the *judgement* (good / bad / neither), never the direction.
 *  Which direction earns which judgement is the caller's call — see
 *  `polarity` on TrendIndicator. Rejection rate falling is good news; revenue
 *  falling is not, and both are a downward arrow. */
export const trendIndicatorVariants = cva(
  "inline-flex items-center gap-1.5 text-sm font-semibold [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        // -text tokens, not the solid -foreground ones: this is coloured text
        // on a page or card surface, where the 4.5:1 floor applies directly
        // and there is no fill to darken the text against.
        positive: "text-success-text",
        negative: "text-destructive-text",
        neutral: "text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type TrendIndicatorVariants = VariantProps<typeof trendIndicatorVariants>;
