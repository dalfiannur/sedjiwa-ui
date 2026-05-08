import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  preventBackdropClose?: boolean;
  footer?: ReactNode;
  children: ReactNode;
};

// Each size emits BOTH the base and the `sm:` responsive variant so it
// overrides DialogContent's built-in `sm:max-w-lg` at every breakpoint.
// twMerge cannot reconcile across responsive groups, so the `sm:` prefix
// is required even when we want the same width across breakpoints.
const SIZE_CLASS = {
  sm: "max-w-sm sm:max-w-sm",
  md: "max-w-md sm:max-w-md",
  lg: "max-w-2xl sm:max-w-2xl",
  xl: "max-w-4xl sm:max-w-4xl",
} as const;

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  preventBackdropClose = false,
  footer,
  children,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="modal-content"
        className={cn(SIZE_CLASS[size])}
        onPointerDownOutside={
          preventBackdropClose ? (e) => e.preventDefault() : undefined
        }
        onInteractOutside={
          preventBackdropClose ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
