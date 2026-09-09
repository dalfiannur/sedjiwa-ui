import * as React from "react";
import { Camera, X } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  imageInputPickerVariants,
  imageInputCaptionVariants,
  type ImageInputPickerVariants,
} from "./image-input.variants";

const DEFAULT_LABEL = "Unggah foto";
const DEFAULT_REPLACE_LABEL = "Ganti foto";
const DEFAULT_REMOVE_LABEL = "Hapus foto";

export type ImageInputProps = Omit<
  React.ComponentProps<"input">,
  // `src` is ours, not the input's: on `<input type="file">` the attribute is
  // meaningless, and here it names the picture already on the server.
  "type" | "size" | "value" | "defaultValue" | "onChange" | "multiple" | "src"
> & {
  shape?: ImageInputPickerVariants["shape"];
  size?: ImageInputPickerVariants["size"];
  state?: ImageInputPickerVariants["state"];
  /** The file the user picked. Controlled; there is no uncontrolled mode,
   *  because the preview has to be revoked when it changes and only the owner
   *  of the value knows when that is. */
  value?: File | null;
  onValueChange?: (file: File | null) => void;
  /** A picture that already exists — the one on the server, in an edit form.
   *  `value` wins over it: the moment someone picks a file, they are looking
   *  at what they picked. */
  src?: string | null;
  /** The caption, and the control's accessible name while it is empty. */
  label?: string;
  /** Replaces `label` once there is a picture. "Unggah foto" on a control
   *  already showing a face is the wrong instruction. */
  replaceLabel?: string;
  /** Text on the remove button. */
  removeLabel?: string;
  /** Called when the remove button is used. Pass it in an edit form, where
   *  removing means "delete the stored photo" and not merely "forget the file
   *  I just picked" — without it the button stays hidden for a picture that
   *  came from `src`, since clearing `value` would not remove anything the
   *  viewer can see. */
  onRemove?: () => void;
  /** Shown while there is no picture. */
  placeholder?: React.ReactNode;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
};

/**
 * A picker whose value is a picture, shown as one.
 *
 * Built the same way as `FileInput`: the root is a `<label>` wrapping a
 * visually-hidden but still focusable `<input type="file">`. The native
 * control stays the real one — keyboard activation, the file dialog, form
 * participation and screen-reader semantics are the browser's, not a
 * reimplementation — and clicking anywhere on the picker or its caption opens
 * the dialog with no click-forwarding of our own.
 *
 * What it adds over `FileInput` is the preview, and the preview is the reason
 * this is a component rather than a recipe: an object URL has to be revoked
 * when the file changes and again when the component unmounts. Skipping that
 * leaks, and the leak is invisible on screen — nothing about the page looks
 * wrong, so nobody finds it.
 *
 * Cropping is deliberately absent. Zooming and framing a photograph is a
 * library's worth of work; this component hands you the `File` and gets out of
 * the way.
 */
export function ImageInput({
  className,
  shape = "circle",
  size = "default",
  state: stateProp,
  value = null,
  onValueChange,
  src = null,
  label = DEFAULT_LABEL,
  replaceLabel = DEFAULT_REPLACE_LABEL,
  removeLabel = DEFAULT_REMOVE_LABEL,
  onRemove,
  placeholder,
  accept = "image/*",
  disabled = false,
  "aria-invalid": ariaInvalid,
  ...props
}: ImageInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  // The URL cannot be known before the effect runs, so publishing it costs one
  // extra render per pick. The alternative — minting it during render — hands
  // React a side effect it is free to throw away, and under StrictMode's double
  // render that is a leaked URL every time. Creating in an event handler misses
  // the case this component is built for: `value` is controlled, so a form
  // reset can change it without any handler of ours running.
  React.useEffect(() => {
    // `accept` filters the dialog, but a file can still arrive from a drop or
    // from someone switching the dialog to "all files". Previewing a PDF as an
    // image renders a broken-image glyph; falling back to the placeholder says
    // the same thing without looking like a bug.
    const url =
      value && value.type.startsWith("image/")
        ? URL.createObjectURL(value)
        : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectUrl(url);
    // Runs both when the file changes and when the component unmounts, which
    // is the whole point of doing this here.
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [value]);

  const resolvedState: NonNullable<ImageInputPickerVariants["state"]> =
    stateProp ??
    (ariaInvalid === true || ariaInvalid === "true" ? "error" : "default");

  const preview = objectUrl ?? src;
  const caption = preview ? replaceLabel : label;
  // Only offer removal when it would do something the viewer can see: a picked
  // file can always be dropped, a stored one only if the caller says how.
  const removable = !disabled && preview != null && (value != null || onRemove != null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onValueChange?.(e.target.files?.[0] ?? null);
  }

  function handleRemove(e: React.MouseEvent) {
    // The button sits outside the <label>, so no click is being forwarded to
    // the input — but resetting the DOM value still matters: without it,
    // re-picking the *same* file fires no change event and the control would
    // stay empty.
    e.preventDefault();
    if (inputRef.current) inputRef.current.value = "";
    onValueChange?.(null);
    onRemove?.();
  }

  return (
    <div
      data-slot="image-input"
      data-state={resolvedState}
      className={cn("flex flex-col items-center gap-2", className)}
    >
      <label
        data-slot="image-input-label"
        aria-disabled={disabled || undefined}
        className={cn(
          "group/image-input flex flex-col items-center gap-2",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          data-slot="image-input-control"
          className="sr-only"
          accept={accept}
          disabled={disabled}
          aria-invalid={resolvedState === "error" ? true : ariaInvalid}
          onChange={handleChange}
          {...props}
        />
        <span
          data-slot="image-input-picker"
          data-shape={shape}
          className={imageInputPickerVariants({ shape, size, state: resolvedState })}
        >
          {preview ? (
            // Decorative on purpose: the label's caption is already the
            // control's accessible name, and an alt here would be appended to
            // it — "Foto profil, Ganti foto".
            <img
              data-slot="image-input-preview"
              src={preview}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            (placeholder ?? <Camera aria-hidden="true" />)
          )}
        </span>
        <span
          data-slot="image-input-caption"
          className={imageInputCaptionVariants({ size })}
        >
          {caption}
        </span>
      </label>

      {removable && (
        <button
          type="button"
          data-slot="image-input-remove"
          onClick={handleRemove}
          className={cn(
            "text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
            "transition-colors duration-150",
            "hover:text-destructive-text focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "focus-visible:outline-none",
            "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0"
          )}
        >
          <X />
          {removeLabel}
        </button>
      )}
    </div>
  );
}
