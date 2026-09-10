import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../button";

const DEFAULT_COPY_LABEL = "Salin";
const DEFAULT_COPIED_LABEL = "Tersalin";
const DEFAULT_TIMEOUT = 2000;

export type CopyButtonProps = Omit<
  ButtonProps,
  "value" | "children" | "asChild" | "loading" | "pressed"
> & {
  /** The text put on the clipboard. */
  value: string;
  /** Fires after the write resolves — never when it fails. */
  onCopy?: (value: string) => void;
  /**
   * Fires when the clipboard refuses: no API (an insecure context), permission
   * denied, or the write rejecting for any other reason.
   */
  onError?: (error: unknown) => void;
  /** How long the copied state lasts, in ms. Defaults to 2000. */
  timeout?: number;
  /** Accessible name while idle. */
  copyLabel?: string;
  /** Accessible name once copied. */
  copiedLabel?: string;
  /** Render the label as text beside the icon rather than only for readers. */
  withLabel?: boolean;
};

export function CopyButton({
  value,
  onCopy,
  onError,
  timeout = DEFAULT_TIMEOUT,
  copyLabel = DEFAULT_COPY_LABEL,
  copiedLabel = DEFAULT_COPIED_LABEL,
  withLabel = false,
  variant = "ghost",
  size,
  disabled,
  className,
  onClick,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    void (async () => {
      try {
        // Optional-chained rather than assumed: `navigator.clipboard` is
        // undefined outside a secure context, and reading `.writeText` off it
        // would throw before the try/catch could report anything useful.
        const writeText = navigator.clipboard?.writeText;
        if (!writeText) throw new Error("Clipboard API unavailable");
        await writeText.call(navigator.clipboard, value);

        setCopied(true);
        onCopy?.(value);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
      } catch (error) {
        // Deliberately no tick on failure. A button that confirms a copy that
        // never happened sends the user away believing they hold the value.
        onError?.(error);
      }
    })();
  };

  const label = copied ? copiedLabel : copyLabel;

  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (withLabel ? "default" : "icon")}
      disabled={disabled}
      onClick={handleClick}
      data-slot="copy-button"
      // Not `data-state`: `Button` owns that attribute for its own loading and
      // pressed states, writes it after spreading props, and would both
      // overwrite this and blur what `[data-state]` means to a stylesheet.
      data-copied={copied}
      aria-label={withLabel ? undefined : label}
      className={cn(className)}
      {...props}
    >
      {copied ? (
        <Check data-slot="copy-button-copied-icon" aria-hidden="true" />
      ) : (
        <Copy data-slot="copy-button-icon" aria-hidden="true" />
      )}
      {withLabel ? label : null}
      {/* The icon swap is silent to a screen reader — the accessible name
          changes, but nothing re-reads a name the user is not focused on. */}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </Button>
  );
}
CopyButton.displayName = "CopyButton";
