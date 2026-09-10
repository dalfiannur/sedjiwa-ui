import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  accordionContentVariants,
  accordionItemVariants,
  accordionTriggerVariants,
  type AccordionItemVariants,
  type AccordionTriggerVariants,
} from "./accordion.variants";

export type AccordionVariant = NonNullable<AccordionItemVariants["variant"]>;
export type AccordionSize = NonNullable<AccordionTriggerVariants["size"]>;

type AccordionContextValue = {
  variant: AccordionVariant;
  size: AccordionSize;
};

const AccordionContext = React.createContext<AccordionContextValue>({
  variant: "separated",
  size: "default",
});

export type AccordionProps = React.ComponentProps<
  typeof AccordionPrimitive.Root
> & {
  variant?: AccordionVariant;
  size?: AccordionSize;
};

/**
 * Collapsible sections, on Radix's accordion.
 *
 * Not `Tabs`: tabs swap between peers where exactly one is visible at a time,
 * an accordion reveals detail in place and can show any number of sections —
 * including none. Reach for this when the sections are content, for tabs when
 * they are views.
 */
function Accordion({
  variant = "separated",
  size = "default",
  className,
  ...props
}: AccordionProps) {
  const ctx = React.useMemo(() => ({ variant, size }), [variant, size]);
  return (
    <AccordionContext.Provider value={ctx}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        data-variant={variant}
        data-size={size}
        className={cn("w-full", className)}
        {...props}
      />
    </AccordionContext.Provider>
  );
}
Accordion.displayName = "Accordion";

export type AccordionItemProps = React.ComponentProps<
  typeof AccordionPrimitive.Item
>;

function AccordionItem({ className, ...props }: AccordionItemProps) {
  const { variant } = React.useContext(AccordionContext);
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  );
}
AccordionItem.displayName = "AccordionItem";

export type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
> & {
  /** Drop the chevron — for a trigger that carries its own affordance. */
  hideChevron?: boolean;
};

function AccordionTrigger({
  className,
  children,
  hideChevron = false,
  ...props
}: AccordionTriggerProps) {
  const { variant, size } = React.useContext(AccordionContext);
  return (
    <AccordionPrimitive.Header className="flex" data-slot="accordion-header">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(accordionTriggerVariants({ size, variant }), className)}
        {...props}
      >
        {children}
        {hideChevron ? null : (
          <ChevronDown
            data-slot="accordion-chevron"
            aria-hidden="true"
            className="text-muted-foreground shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180"
          />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}
AccordionTrigger.displayName = "AccordionTrigger";

export type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
>;

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  const { variant, size } = React.useContext(AccordionContext);
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(accordionContentVariants({ size }))}
      {...props}
    >
      {/* The padding lives on an inner element: the animated one is measured
          for its height, and padding on it would make the closed state a few
          pixels tall instead of zero. */}
      <div
        data-slot="accordion-content-inner"
        className={cn(
          "pb-3.5",
          variant === "contained" && "px-3",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
