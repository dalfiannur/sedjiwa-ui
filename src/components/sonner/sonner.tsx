import * as React from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// The kit also says error toasts should be persistent rather than timing out.
// Sonner has no per-type duration on <Toaster> — only one global default — so
// that half cannot be set here. It belongs at the call site:
//
//   toast.error("Gagal menyimpan", { duration: Infinity })
//
// Left as documentation on purpose rather than solved by wrapping `toast`:
// this package exports only <Toaster>, and consumers import `toast` straight
// from sonner. A wrapped re-export would fork that into two ways to call it.

export function Toaster({
  // Both from the design kit: non-critical toasts auto-dismiss after 5s, and
  // at most 3 stack at once. Sonner's own defaults are close but not these.
  duration = 5000,
  visibleToasts = 3,
  ...props
}: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      duration={duration}
      visibleToasts={visibleToasts}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
