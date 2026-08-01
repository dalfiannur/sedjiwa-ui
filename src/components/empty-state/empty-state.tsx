import * as React from "react";
import { cn } from "../../lib/cn";
import {
  emptyMediaVariants,
  type EmptyMediaVariants,
} from "./empty-state.variants";

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg border-dashed p-6 text-center md:p-12",
        className
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  );
}

function EmptyMedia({
  className,
  variant = "default",
  tone = "default",
  ...props
}: React.ComponentProps<"div"> & EmptyMediaVariants) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      data-tone={tone}
      className={cn(emptyMediaVariants({ variant, tone, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-balance text-sm",
        className
      )}
      {...props}
    />
  );
}

export type EmptyStateProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Optional leading media, typically a lucide icon. Rendered in the boxed `icon` media slot. */
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional call-to-action(s) rendered below the description. */
  action?: React.ReactNode;
  /**
   * Media tone. `default` for "nothing created yet", `success` for "empty
   * because everything is resolved", `muted` for "a filter matched nothing".
   */
  tone?: EmptyMediaVariants["tone"];
};

/**
 * Convenience composition for the common empty-state pattern
 * (icon + title + description + action). For full control, use the
 * `Empty*` primitives directly.
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  tone,
  ...props
}: EmptyStateProps) {
  return (
    <Empty {...props}>
      <EmptyHeader>
        {icon != null && (
          <EmptyMedia variant="icon" tone={tone ?? "default"}>
            {icon}
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description != null && (
          <EmptyDescription>{description}</EmptyDescription>
        )}
      </EmptyHeader>
      {action != null && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyState,
};
