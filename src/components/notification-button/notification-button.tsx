import * as React from "react";
import { BellIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../button";

export type NotificationButtonProps = Omit<ButtonProps, "children" | "size"> & {
  /** Unread count. `0` and `undefined` both render a bare bell — a badge
   *  showing "0" is noise, not information. */
  count?: number;
  /** Counts above this render as `{max}+`. */
  max?: number;
  /** Accessible name without the count; the count is appended for you, so a
   *  screen reader hears "Notifikasi, 6 belum dibaca". */
  label?: string;
  /** How the appended count is worded. */
  countLabel?: (count: number) => string;
  /** Replace the bell. */
  icon?: React.ReactNode;
};

export function NotificationButton({
  className,
  count,
  max = 99,
  label = "Notifikasi",
  countLabel = (n) => `${n} belum dibaca`,
  icon,
  variant = "ghost",
  ...props
}: NotificationButtonProps) {
  const unread = count != null && count > 0;
  const shown = unread ? (count > max ? `${max}+` : String(count)) : null;

  return (
    <Button
      data-slot="notification-button"
      variant={variant}
      size="icon"
      // The count is inside the button, so without an explicit name a screen
      // reader would announce a bare "6". aria-label replaces the whole
      // subtree, which is why the badge below is hidden rather than relied on.
      aria-label={unread ? `${label}, ${countLabel(count)}` : label}
      className={cn("relative", className)}
      {...props}
    >
      {icon ?? <BellIcon aria-hidden="true" />}
      {shown != null && (
        <span
          data-slot="notification-button-count"
          aria-hidden="true"
          className={cn(
            "bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5",
            "flex h-4 min-w-4 items-center justify-center rounded-full px-1",
            "text-[10px] leading-none font-bold tabular-nums",
          )}
        >
          {shown}
        </span>
      )}
    </Button>
  );
}
