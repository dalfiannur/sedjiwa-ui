import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { fieldSurfaceVariants } from "../../lib/field-surface.variants";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { ComboboxListbox } from "./combobox-listbox";
import type { ComboboxProps } from "./combobox.types";

const DEFAULT_PLACEHOLDER = "Select…";

function ComboboxImpl<T>(
  props: ComboboxProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const {
    placeholder = DEFAULT_PLACEHOLDER,
    size = "default",
    state = "default",
    disabled = false,
    className,
    id,
    "aria-label": ariaLabel,
  } = props;

  const [open, setOpen] = React.useState(false);
  const listboxId = React.useId();

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger
        ref={ref}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel ?? placeholder}
        disabled={disabled}
        data-slot="combobox-trigger"
        data-state={state}
        className={cn(
          fieldSurfaceVariants({ size, state }),
          "items-center justify-between gap-2 px-3 text-left",
          "text-muted-foreground",
          className,
        )}
      >
        <span className="flex-1 truncate text-sm">{placeholder}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-(--radix-popover-trigger-width) min-w-60 p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <ComboboxListbox listboxId={listboxId} />
      </PopoverContent>
    </Popover>
  );
}

export const Combobox = React.forwardRef(ComboboxImpl) as <T>(
  props: ComboboxProps<T> & { ref?: React.Ref<HTMLButtonElement> },
) => ReturnType<typeof ComboboxImpl>;

(Combobox as unknown as { displayName: string }).displayName = "Combobox";
