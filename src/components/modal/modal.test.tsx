import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./modal";

function ControlledModal({
  defaultOpen = true,
  preventBackdropClose,
  size,
  description,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  preventBackdropClose?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  description?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
      title="Confirm action"
      description={description}
      size={size}
      preventBackdropClose={preventBackdropClose}
    >
      <p>Modal body</p>
    </Modal>
  );
}

describe("<Modal />", () => {
  it("renders nothing when open=false", () => {
    render(<ControlledModal defaultOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title, description, and body when open=true", () => {
    render(<ControlledModal description="Are you sure?" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Confirm action");
    expect(dialog).toHaveTextContent("Are you sure?");
    expect(dialog).toHaveTextContent("Modal body");
  });

  it("omits the description block when description prop is not supplied", () => {
    render(<ControlledModal />);
    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("calls onOpenChange(false) when the user presses Escape", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<ControlledModal onOpenChange={onOpenChange} />);
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Escape still closes when preventBackdropClose=true", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ControlledModal preventBackdropClose onOpenChange={onOpenChange} />
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("applies the size class to the dialog content (sm)", () => {
    render(<ControlledModal size="sm" />);
    expect(screen.getByRole("dialog")).toHaveClass("max-w-sm");
  });

  it("applies the size class to the dialog content (xl)", () => {
    render(<ControlledModal size="xl" />);
    expect(screen.getByRole("dialog")).toHaveClass("max-w-4xl");
  });

  it("defaults to the md size when size prop is omitted", () => {
    render(<ControlledModal />);
    expect(screen.getByRole("dialog")).toHaveClass("max-w-md");
  });
});
