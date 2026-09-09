import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../lib/cn";

export type UserMenuTriggerProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** Who is signed in. */
  name: React.ReactNode;
  /** Their role or org, shown smaller beneath the name. */
  role?: React.ReactNode;
  /** Usually an `<Avatar />`. */
  avatar?: React.ReactNode;
  /** The name and role are hidden below `sm` by default, leaving just the
   *  avatar — set this to keep them at every width. */
  alwaysShowText?: boolean;
  showChevron?: boolean;
};

/** Deliberately a plain `<button>` with everything forwarded, so it drops
 *  straight into `<DropdownMenuTrigger asChild>` and inherits the menu's
 *  aria-expanded / aria-controls wiring instead of duplicating it. */
export function UserMenuTrigger({
  className,
  name,
  role,
  avatar,
  alwaysShowText = false,
  showChevron = true,
  ...props
}: UserMenuTriggerProps) {
  return (
    <button
      type="button"
      data-slot="user-menu-trigger"
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-full p-1 text-left",
        "transition-colors hover:bg-accent hover:text-accent-foreground",
        "outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className,
      )}
      {...props}
    >
      {avatar}

      <span
        data-slot="user-menu-trigger-text"
        className={cn(
          "min-w-0 flex-col",
          alwaysShowText ? "flex" : "hidden sm:flex",
        )}
      >
        <span className="truncate text-sm leading-tight font-semibold">{name}</span>
        {role != null && (
          <span className="text-muted-foreground truncate text-xs leading-tight">
            {role}
          </span>
        )}
      </span>

      {showChevron && (
        <ChevronDownIcon
          aria-hidden="true"
          className="text-muted-foreground mr-1 size-4 shrink-0"
        />
      )}
    </button>
  );
}
