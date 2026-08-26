import * as React from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { alertVariants, type AlertVariants } from "./alert.variants";

type AlertVariant = NonNullable<AlertVariants["variant"]>;

/** Same glyphs the Toaster uses, so the two surfaces agree on what an error
 *  or a success looks like. */
const ICONS: Record<AlertVariant, React.ComponentType<{ className?: string }>> = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  error: OctagonXIcon,
};

/** How urgently, if at all, this should interrupt a screen reader.
 *  - `auto` (default): errors and warnings assert, info and success are polite.
 *  - `off`: no live region — for a banner that renders with the page and is
 *    read in document order anyway. */
export type AlertAnnounce = "auto" | "off";

const ROLE_FOR: Record<AlertVariant, "alert" | "status"> = {
  error: "alert",
  warning: "alert",
  success: "status",
  info: "status",
};

export type AlertProps = Omit<React.ComponentProps<"div">, "title"> & {
  variant?: AlertVariants["variant"];
  placement?: AlertVariants["placement"];
  /** Optional heading above the message. */
  title?: React.ReactNode;
  /** Optional trailing slot for a link or button. */
  action?: React.ReactNode;
  /** Render a dismiss button. Without this the alert is not dismissible. */
  onDismiss?: () => void;
  /** Accessible name for the dismiss button. */
  dismissLabel?: string;
  announce?: AlertAnnounce;
  /** Replace the variant's icon, or pass null to drop it. */
  icon?: React.ReactNode | null;
};

export function Alert({
  className,
  variant = "info",
  placement = "inline",
  title,
  action,
  onDismiss,
  dismissLabel = "Dismiss alert",
  announce = "auto",
  icon,
  children,
  ...props
}: AlertProps) {
  const resolved: AlertVariant = variant ?? "info";
  const Icon = ICONS[resolved];

  return (
    <div
      data-slot="alert"
      data-variant={resolved}
      data-placement={placement}
      // The design kit describes this twice and the two passages disagree for
      // info: molecules says a static informational alert needs no role,
      // feedback says role="status". Both hold, for different cases — the real
      // question is whether the alert appeared just now or was always there.
      // So it is a decision the caller makes, with the common case defaulted.
      role={announce === "off" ? undefined : ROLE_FOR[resolved]}
      className={cn(alertVariants({ variant: resolved, placement }), className)}
      {...props}
    >
      {icon === null ? null : (
        <span data-slot="alert-icon" className="mt-0.5 shrink-0" aria-hidden="true">
          {icon ?? <Icon className="size-4" />}
        </span>
      )}

      <div data-slot="alert-body" className="flex min-w-0 flex-1 flex-col gap-1">
        {title != null && (
          <div data-slot="alert-title" className="font-medium">
            {title}
          </div>
        )}
        {children != null && (
          <div data-slot="alert-description" className="[&_a]:underline [&_a]:underline-offset-4">
            {children}
          </div>
        )}
        {action != null && (
          <div data-slot="alert-action" className="mt-1">
            {action}
          </div>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          data-slot="alert-dismiss"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className={cn(
            "-mr-1 -mt-1 ml-2 flex size-6 shrink-0 items-center justify-center rounded-md",
            "transition-colors hover:bg-black/5 dark:hover:bg-white/10",
            "focus-visible:ring-ring/50 outline-none focus-visible:ring-2",
          )}
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
