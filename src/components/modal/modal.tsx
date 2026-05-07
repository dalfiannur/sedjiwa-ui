import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  children: ReactNode;
};

const SIZE_CLASS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  preventBackdropClose = false,
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
      </DialogContent>
    </Dialog>
  );
}
