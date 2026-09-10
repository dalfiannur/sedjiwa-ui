import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import type { FieldSurfaceVariants } from "../../lib/field-surface.variants";
import { Input } from "../input";

const DEFAULT_SHOW_LABEL = "Tampilkan kata sandi";
const DEFAULT_HIDE_LABEL = "Sembunyikan kata sandi";

export type PasswordInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "size"
> & {
  /** Controlled reveal state. */
  visible?: boolean;
  /** Uncontrolled initial reveal state. Defaults to masked. */
  defaultVisible?: boolean;
  /** Fires with the state the user asked for, controlled or not. */
  onVisibleChange?: (visible: boolean) => void;
  /**
   * Drop the reveal button. The field still masks; there is simply no way to
   * unmask it — for confirmation fields, where revealing defeats the point.
   */
  showToggle?: boolean;
  /** Accessible name for the button while the value is masked. */
  showLabel?: string;
  /** Accessible name for the button while the value is revealed. */
  hideLabel?: string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  /** Appended inside `Input.Root` after the toggle — extra actions or icons. */
  children?: React.ReactNode;
  /** Class for the outer `Input.Root` wrapper. */
  className?: string;
  /** Class for the inner `Input.Field`. */
  inputClassName?: string;
};

export function PasswordInput(props: PasswordInputProps) {
  const {
    visible,
    defaultVisible = false,
    onVisibleChange,
    showToggle = true,
    showLabel = DEFAULT_SHOW_LABEL,
    hideLabel = DEFAULT_HIDE_LABEL,
    size,
    state,
    loading,
    disabled,
    readOnly,
    className,
    inputClassName,
    children,
    // Pulled out so they land on Input.Root (FormControl Slot-cloning target),
    // not on Input.Field via the rest spread. Input.Root routes them via context.
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...fieldProps
  } = props;

  const isControlled = visible !== undefined;
  const [internalVisible, setInternalVisible] = React.useState(defaultVisible);
  const isVisible = isControlled ? visible : internalVisible;

  const toggle = () => {
    const next = !isVisible;
    if (!isControlled) setInternalVisible(next);
    onVisibleChange?.(next);
  };

  return (
    <Input.Root
      size={size}
      state={state}
      loading={loading}
      disabled={disabled}
      readOnly={readOnly}
      id={id}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      className={className}
    >
      <Input.Field
        // Managers and password fills key off this; without it a browser
        // offers the wrong credential, or none.
        autoComplete={fieldProps.autoComplete ?? "current-password"}
        {...fieldProps}
        type={isVisible ? "text" : "password"}
        className={inputClassName}
      />
      {showToggle ? (
        <Input.Action
          onClick={toggle}
          aria-pressed={isVisible}
          aria-label={isVisible ? hideLabel : showLabel}
          data-slot="password-input-toggle"
          // The button reveals the field it sits in; it does not describe a
          // value of its own, so there is nothing for a screen reader to read
          // out beyond the label above.
          title={isVisible ? hideLabel : showLabel}
        >
          {isVisible ? <EyeOff /> : <Eye />}
        </Input.Action>
      ) : null}
      {children}
    </Input.Root>
  );
}
PasswordInput.displayName = "PasswordInput";
