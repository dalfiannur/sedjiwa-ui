import * as React from "react";
import { cn } from "../../lib/cn";

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        // border-separate, not the preflight default of border-collapse.
        // The header is a filled bar with rounded ends, and border-radius on a
        // cell is simply ignored while the table collapses its borders. The
        // cost is that row rules can no longer live on <tr> — a collapsed
        // border belongs to the table, a separated one belongs to each cell —
        // so TableCell carries border-b and TableBody/TableFooter reach
        // through the row to reset it. border-spacing-0 keeps the cells
        // touching, so nothing about the layout changes.
        className={cn(
          "w-full caption-bottom border-separate border-spacing-0 text-sm",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn(className)} {...props} />;
}

export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child>td]:border-0", className)}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 font-medium [&>tr>td]:border-t [&>tr>td]:border-b-0",
        className
      )}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({
  // Column header by default. Without scope, screen readers fall back to
  // guessing which header a cell belongs to — usually right in a narrow table,
  // often wrong in a wide one, where you then hear a value with no idea what
  // column it came from. Every table in the library composes from this one
  // primitive, so setting it here covers all of them. Override with
  // scope="row" for a row header.
  scope = "col",
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      scope={scope}
      className={cn(
        // The header is a bar, not a rule: a muted fill whose outer corners
        // round off, so the whole row reads as one object sitting above the
        // data rather than as the data's first line.
        "bg-muted text-foreground h-12 px-4 text-left align-middle font-semibold whitespace-nowrap",
        "first:rounded-l-xl last:rounded-r-xl",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "border-b px-4 py-3 align-middle whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}
