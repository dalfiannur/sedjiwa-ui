import * as React from "react";
import { cn } from "../../lib/cn";
import {
  fieldSurfaceVariants,
  type FieldSurfaceVariants,
} from "../../lib/field-surface.variants";
import { textareaVariants } from "./textarea.variants";

export type TextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "size" | "aria-invalid"
> & {
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
};

export function Textarea({
  className,
  size = "default",
  state: stateProp,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps) {
  const resolvedState: NonNullable<FieldSurfaceVariants["state"]> =
    stateProp ??
    (ariaInvalid === true || ariaInvalid === "true" ? "error" : "default");

  return (
    <textarea
      data-slot="textarea"
      data-state={resolvedState}
      aria-invalid={resolvedState === "error" ? true : ariaInvalid}
      className={cn(
        // Pull surface styling but drop fixed height (textarea is multi-line)
        fieldSurfaceVariants({ size, state: resolvedState }),
        "h-auto",
        textareaVariants({ size }),
        className,
      )}
      {...props}
    />
  );
}
