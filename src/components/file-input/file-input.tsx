import * as React from "react";
import { Paperclip, X } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  fieldSurfaceVariants,
  type FieldSurfaceVariants,
} from "../../lib/field-surface.variants";
import {
  fileInputTriggerVariants,
  fileInputValueVariants,
} from "./file-input.variants";

const DEFAULT_PLACEHOLDER = "Belum ada file dipilih";
const DEFAULT_BUTTON_LABEL = "Pilih File";
const DEFAULT_CLEAR_LABEL = "Hapus file";

export type FileInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "size" | "value" | "defaultValue" | "onChange" | "multiple"
> & {
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  /** Controlled selection. Single file only — see the note on `multiple`. */
  value?: File | null;
  onValueChange?: (file: File | null) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Text on the leading "choose" affordance. */
  buttonLabel?: string;
  /** Accessible name of the clear button (it is icon-only). */
  clearLabel?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
};

/**
 * A file picker that matches Input/Textarea instead of the browser's default
 * chrome (which renders as an unstyled, always-English "Choose File / No file
 * chosen").
 *
 * The root is a `<label>` wrapping a visually-hidden but still focusable
 * `<input type="file">`. That keeps the native control as the real one — so
 * keyboard activation, the file dialog, form participation and screen-reader
 * semantics are the browser's, not a reimplementation — while the visible row
 * is ordinary markup we can style. It also means clicking anywhere on the
 * field opens the picker with no JS click-forwarding, which is what would
 * otherwise double-fire when the component sits inside another label.
 *
 * Because the root is a label, give it an external one via `<Label htmlFor>`
 * pointing at `id` rather than nesting this inside a `<label>` — nested labels
 * are invalid HTML.
 *
 * `multiple` is deliberately not supported: `value` is a single File, and
 * accepting the attribute would silently drop every file after the first.
 */
export function FileInput({
  className,
  size = "default",
  state: stateProp,
  value = null,
  onValueChange,
  placeholder = DEFAULT_PLACEHOLDER,
  buttonLabel = DEFAULT_BUTTON_LABEL,
  clearLabel = DEFAULT_CLEAR_LABEL,
  disabled = false,
  "aria-invalid": ariaInvalid,
  ...props
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const resolvedState: NonNullable<FieldSurfaceVariants["state"]> =
    stateProp ??
    (ariaInvalid === true || ariaInvalid === "true" ? "error" : "default");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onValueChange?.(e.target.files?.[0] ?? null);
  }

  function handleClear(e: React.MouseEvent) {
    // Inside a <label>, a click on any descendant is forwarded to the control —
    // so without this the clear button would immediately reopen the picker.
    // Cancelling is enough; stopPropagation would additionally break any
    // click delegation a parent has set up, so it is deliberately absent.
    e.preventDefault();
    // Resetting the DOM value matters beyond clearing the display: without it,
    // re-picking the *same* file fires no change event and the field would
    // stay empty.
    if (inputRef.current) inputRef.current.value = "";
    onValueChange?.(null);
  }

  return (
    <label
      data-slot="file-input"
      data-state={resolvedState}
      aria-disabled={disabled || undefined}
      className={cn(
        fieldSurfaceVariants({ size, state: resolvedState }),
        "items-stretch overflow-hidden",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        data-slot="file-input-control"
        className="sr-only"
        disabled={disabled}
        aria-invalid={resolvedState === "error" ? true : ariaInvalid}
        onChange={handleChange}
        {...props}
      />
      <span
        data-slot="file-input-trigger"
        aria-hidden="true"
        className={fileInputTriggerVariants({ size })}
      >
        <Paperclip />
        {buttonLabel}
      </span>
      <span
        data-slot="file-input-value"
        data-placeholder={value ? undefined : "true"}
        className={cn(
          fileInputValueVariants({ size }),
          !value && "text-muted-foreground",
        )}
      >
        {value ? value.name : placeholder}
      </span>
      {value && !disabled && (
        <button
          type="button"
          data-slot="file-input-clear"
          aria-label={clearLabel}
          onClick={handleClear}
          className={cn(
            "flex shrink-0 items-center justify-center self-stretch px-2.5",
            "text-muted-foreground transition-colors duration-150",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          )}
        >
          <X />
        </button>
      )}
    </label>
  );
}
