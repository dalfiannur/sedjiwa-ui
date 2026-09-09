/* eslint-disable react-refresh/only-export-components -- compound component
   intentionally co-locates all sub-components in one file to share the
   ARIA-forwarding context and displayName constants. Library code; HMR
   semantics don't apply here. */
import * as React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  fieldSurfaceVariants,
  type FieldSurfaceVariants,
} from "../../lib/field-surface.variants";
import {
  inputActionVariants,
  inputAddonVariants,
  inputFieldVariants,
  inputIconVariants,
} from "./input.variants";
import {
  InputContext,
  useInputContext,
  type InputContextValue,
} from "./input.context";

const ROOT_DISPLAY_NAME = "Input.Root";
const FIELD_DISPLAY_NAME = "Input.Field";
const LEADING_ICON_DISPLAY_NAME = "Input.LeadingIcon";
const TRAILING_ICON_DISPLAY_NAME = "Input.TrailingIcon";
const LEADING_ADDON_DISPLAY_NAME = "Input.LeadingAddon";
const TRAILING_ADDON_DISPLAY_NAME = "Input.TrailingAddon";
const ACTION_DISPLAY_NAME = "Input.Action";

function getDisplayName(element: React.ReactElement): string | undefined {
  const t = element.type as { displayName?: string; name?: string } | string;
  if (typeof t === "string") return undefined;
  return t?.displayName ?? t?.name;
}

export type InputRootProps = Omit<
  React.ComponentProps<"div">,
  "size" | "aria-invalid"
> & {
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  /** `search` swaps the bordered box for a pill on a muted fill — the top-bar
   *  search field. Everything else (sizes, states, the icon and addon slots)
   *  behaves identically. */
  appearance?: FieldSurfaceVariants["appearance"];
  loading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
};

function InputRoot({
  className,
  size = "default",
  state: stateProp,
  appearance = "default",
  loading = false,
  disabled = false,
  readOnly = false,
  children,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...divProps
}: InputRootProps) {
  const resolvedState: NonNullable<FieldSurfaceVariants["state"]> =
    stateProp ??
    (ariaInvalid === true || ariaInvalid === "true" ? "error" : "default");

  const childArr = React.Children.toArray(children);
  const hasTrailingIcon = childArr.some(
    (c) =>
      React.isValidElement(c) && getDisplayName(c) === TRAILING_ICON_DISPLAY_NAME,
  );

  const ctx = React.useMemo<InputContextValue>(
    () => ({
      size: size ?? "default",
      state: resolvedState,
      loading,
      disabled,
      readOnly,
      ariaProps: {
        id,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid":
          resolvedState === "error" ? true : ariaInvalid,
      },
    }),
    [size, resolvedState, loading, disabled, readOnly, id, ariaDescribedBy, ariaInvalid],
  );

  const trailingExtras: React.ReactNode[] = [];
  if (loading) {
    trailingExtras.push(
      <span
        key="__input_loading"
        data-slot="input-loading"
        aria-hidden="true"
        className={cn(inputIconVariants({ size }), "text-muted-foreground")}
      >
        <Loader2 className="animate-spin" />
      </span>,
    );
  } else if (
    !hasTrailingIcon &&
    (resolvedState === "error" ||
      resolvedState === "success" ||
      resolvedState === "warning")
  ) {
    const Icon =
      resolvedState === "error"
        ? AlertCircle
        : resolvedState === "success"
          ? CheckCircle2
          : AlertTriangle;
    const iconColor =
      resolvedState === "error"
        ? "text-destructive"
        : resolvedState === "success"
          ? "text-success"
          : "text-warning";
    trailingExtras.push(
      <span
        key="__input_auto_icon"
        data-slot="input-trailing-icon"
        data-auto="true"
        aria-hidden="true"
        className={cn(inputIconVariants({ size }), iconColor)}
      >
        <Icon />
      </span>,
    );
  }

  // childArr, not `children`. Both branches below must hand React the same
  // children with the same keys, and these two values do not: React.Children
  // .toArray() assigns keys like ".0", while a single raw child carries a null
  // key. Starting from `children` and reassigning to a childArr-derived array
  // therefore changes the input's key the moment a trailing extra appears --
  // React reads that as a different element, unmounts the <input> and mounts a
  // fresh one. Focus falls to the nearest focusable ancestor and every
  // keystroke after that is swallowed.
  //
  // The trigger is the most common thing a form does: a field crossing the
  // valid/invalid boundary, since that is exactly when the state icon is
  // injected. Measured downstream in metaprint before it was patched there --
  // typing into a code field after a failed submit let a single character
  // through.
  //
  // childArr is already computed above, unconditionally, so this costs nothing.
  let renderedChildren: React.ReactNode = childArr;
  if (trailingExtras.length > 0) {
    const actionIndex = childArr.findIndex(
      (c) =>
        React.isValidElement(c) && getDisplayName(c) === ACTION_DISPLAY_NAME,
    );
    if (actionIndex >= 0) {
      renderedChildren = [
        ...childArr.slice(0, actionIndex),
        ...trailingExtras,
        ...childArr.slice(actionIndex),
      ];
    } else {
      renderedChildren = [...childArr, ...trailingExtras];
    }
  }

  return (
    <InputContext.Provider value={ctx}>
      <div
        data-slot="input"
        data-appearance={appearance}
        data-state={resolvedState}
        data-loading={loading || undefined}
        aria-disabled={disabled || undefined}
        className={cn(
          fieldSurfaceVariants({ size, state: resolvedState, appearance }),
          "items-stretch",
          loading && "opacity-90",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        {...divProps}
      >
        {renderedChildren}
      </div>
    </InputContext.Provider>
  );
}
InputRoot.displayName = ROOT_DISPLAY_NAME;

export type InputFieldProps = React.ComponentProps<"input">;

function InputField({
  className,
  type = "text",
  style,
  onChange,
  onClick,
  onKeyDown,
  ...props
}: InputFieldProps) {
  const { size, state, loading, disabled, readOnly, ariaProps } =
    useInputContext("Field");

  const ctxAriaInvalid = ariaProps["aria-invalid"];
  const resolvedAriaInvalid =
    props["aria-invalid"] !== undefined
      ? props["aria-invalid"]
      : state === "error"
        ? true
        : ctxAriaInvalid;

  return (
    <input
      type={type}
      data-slot="input-field"
      data-state={state}
      className={cn(inputFieldVariants({ size }), className)}
      {...props}
      id={props.id ?? ariaProps.id}
      aria-describedby={
        props["aria-describedby"] ?? ariaProps["aria-describedby"]
      }
      aria-invalid={resolvedAriaInvalid}
      aria-busy={loading || undefined}
      disabled={disabled || props.disabled}
      readOnly={readOnly || props.readOnly}
      onChange={loading ? undefined : onChange}
      onClick={loading ? undefined : onClick}
      onKeyDown={loading ? undefined : onKeyDown}
      style={loading ? { ...style, pointerEvents: "none" } : style}
    />
  );
}
InputField.displayName = FIELD_DISPLAY_NAME;

export type InputLeadingIconProps = React.ComponentProps<"span">;

function InputLeadingIcon({
  className,
  children,
  ...props
}: InputLeadingIconProps) {
  const { size } = useInputContext("LeadingIcon");
  return (
    <span
      data-slot="input-leading-icon"
      aria-hidden="true"
      className={cn(inputIconVariants({ size }), className)}
      {...props}
    >
      {children}
    </span>
  );
}
InputLeadingIcon.displayName = LEADING_ICON_DISPLAY_NAME;

export type InputTrailingIconProps = React.ComponentProps<"span">;

function InputTrailingIcon({
  className,
  children,
  ...props
}: InputTrailingIconProps) {
  const { size } = useInputContext("TrailingIcon");
  return (
    <span
      data-slot="input-trailing-icon"
      aria-hidden="true"
      className={cn(inputIconVariants({ size }), className)}
      {...props}
    >
      {children}
    </span>
  );
}
InputTrailingIcon.displayName = TRAILING_ICON_DISPLAY_NAME;

export type InputLeadingAddonProps = React.ComponentProps<"div">;

function InputLeadingAddon({
  className,
  children,
  ...props
}: InputLeadingAddonProps) {
  const { size } = useInputContext("LeadingAddon");
  return (
    <div
      data-slot="input-leading-addon"
      className={cn(inputAddonVariants({ size, side: "leading" }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
InputLeadingAddon.displayName = LEADING_ADDON_DISPLAY_NAME;

export type InputTrailingAddonProps = React.ComponentProps<"div">;

function InputTrailingAddon({
  className,
  children,
  ...props
}: InputTrailingAddonProps) {
  const { size } = useInputContext("TrailingAddon");
  return (
    <div
      data-slot="input-trailing-addon"
      className={cn(inputAddonVariants({ size, side: "trailing" }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
InputTrailingAddon.displayName = TRAILING_ADDON_DISPLAY_NAME;

export type InputActionProps = React.ComponentProps<"button">;

function InputAction({
  className,
  type = "button",
  disabled: disabledProp,
  ...props
}: InputActionProps) {
  const { size, disabled: ctxDisabled, loading } = useInputContext("Action");
  return (
    <button
      type={type}
      data-slot="input-action"
      className={cn(inputActionVariants({ size }), className)}
      disabled={ctxDisabled || disabledProp || loading}
      {...props}
    />
  );
}
InputAction.displayName = ACTION_DISPLAY_NAME;

export const Input = {
  Root: InputRoot,
  Field: InputField,
  LeadingIcon: InputLeadingIcon,
  TrailingIcon: InputTrailingIcon,
  LeadingAddon: InputLeadingAddon,
  TrailingAddon: InputTrailingAddon,
  Action: InputAction,
};
