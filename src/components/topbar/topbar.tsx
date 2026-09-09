import * as React from "react";
import { cn } from "../../lib/cn";

export type TopbarProps = React.ComponentProps<"header"> & {
  /** Far left: a sidebar trigger, a brand mark, a back button. */
  leading?: React.ReactNode;
  /** Grows to fill the middle and is the first thing to collapse — pass an
   *  `<Input>` in its `search` variant. */
  search?: React.ReactNode;
  /** Anything trailing (notifications, a user menu) goes in `children`. */
  children?: React.ReactNode;
};

/** The bar itself only does layout and the surface. It carries no positioning,
 *  so it sits equally well inside `AppShellHeader`, inside `SidebarLayout`, or
 *  on its own with a `sticky top-0` from the caller. */
export function Topbar({ className, leading, search, children, ...props }: TopbarProps) {
  return (
    <header
      data-slot="topbar"
      className={cn(
        "bg-card text-card-foreground flex h-16 w-full items-center gap-3 px-4",
        className,
      )}
      {...props}
    >
      {leading != null && (
        <div data-slot="topbar-leading" className="flex shrink-0 items-center gap-2">
          {leading}
        </div>
      )}

      {search != null && (
        // Capped rather than unbounded: at 1440px an edge-to-edge search field
        // reads as a page-wide input, which is what the Figma avoids too.
        <div data-slot="topbar-search" className="min-w-0 flex-1 md:max-w-sm">
          {search}
        </div>
      )}

      {/* Pushes the actions right whether or not a search slot was passed. */}
      <div
        data-slot="topbar-actions"
        className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2"
      >
        {children}
      </div>
    </header>
  );
}
