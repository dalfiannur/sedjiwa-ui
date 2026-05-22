import { cva, type VariantProps } from "class-variance-authority";

export const dynamicTabTriggerVariants = cva(
  [
    "group/dyn-tab relative inline-flex h-7 max-w-[200px] items-center gap-1.5 border border-transparent px-3 text-sm font-medium whitespace-nowrap transition-colors",
    "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "text-muted-foreground hover:bg-muted hover:text-foreground",
    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-border data-[state=active]:shadow-sm",
    "after:content-[''] after:absolute after:left-2 after:right-2 after:h-[2px] after:rounded-full after:bg-[var(--dtab-accent,transparent)] after:opacity-0 data-[state=active]:after:opacity-100 after:transition-opacity",
  ],
  {
    variants: {
      color: {
        default: "[--dtab-accent:transparent]",
        red: "[--dtab-accent:#ef4444]",
        orange: "[--dtab-accent:#f97316]",
        yellow: "[--dtab-accent:#eab308]",
        green: "[--dtab-accent:#22c55e]",
        blue: "[--dtab-accent:#3b82f6]",
        purple: "[--dtab-accent:#a855f7]",
        pink: "[--dtab-accent:#ec4899]",
      },
      position: {
        bottom: "rounded-md after:bottom-[3px]",
        top: "rounded-md after:top-[3px]",
      },
      isDragging: {
        true: "z-10 cursor-grabbing opacity-80",
        false: "",
      },
      isRenaming: {
        true: "px-1.5",
        false: "",
      },
    },
    defaultVariants: {
      color: "default",
      position: "bottom",
      isDragging: false,
      isRenaming: false,
    },
  },
);

export type DynamicTabTriggerVariants = VariantProps<typeof dynamicTabTriggerVariants>;

export const dynamicTabStripVariants = cva(
  "flex h-9 w-full shrink-0 items-center gap-0.5 bg-foreground/5 px-1",
  {
    variants: {
      position: {
        top: "border-b",
        bottom: "border-t",
      },
    },
    defaultVariants: {
      position: "bottom",
    },
  },
);

export type DynamicTabStripVariants = VariantProps<typeof dynamicTabStripVariants>;
