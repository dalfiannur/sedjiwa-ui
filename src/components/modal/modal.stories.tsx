import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { Button } from "../button";
import { Modal, type ModalProps } from "./modal";

type ShellProps = Omit<ModalProps, "open" | "onOpenChange" | "children"> & {
  children?: ReactNode;
};

function ModalShell({ children, ...props }: ShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal {...props} open={open} onOpenChange={setOpen}>
        {children ?? (
          <p className="text-sm text-muted-foreground">
            Pass any content as children — Modal handles header, layout, and
            close affordance for you.
          </p>
        )}
      </Modal>
    </div>
  );
}

const meta: Meta<ShellProps> = {
  title: "Components/Modal",
  component: ModalShell,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
    },
    preventBackdropClose: { control: "boolean" },
  },
  args: {
    title: "Confirm action",
    description: "This change cannot be undone.",
    size: "md",
    preventBackdropClose: false,
  },
};

export default meta;
type Story = StoryObj<ShellProps>;

export const Default: Story = {
  render: (args) => <ModalShell {...args} />,
};

// Validates the new `footer` prop. The buttons render inside DialogFooter,
// not in the body — so they get the proper sm:flex-row sm:justify-end layout.
export const WithFooter: Story = {
  render: (args) => (
    <ModalShell
      {...args}
      title="Delete project?"
      description="This permanently removes the project and its history."
      footer={
        <>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </>
      }
    />
  ),
};

export const Sizes: Story = {
  render: () => {
    const sizes = ["sm", "md", "lg", "xl"] as const;
    const [openSize, setOpenSize] = useState<(typeof sizes)[number] | null>(
      null
    );
    return (
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => (
          <Button key={s} variant="outline" onClick={() => setOpenSize(s)}>
            Open {s}
          </Button>
        ))}
        <Modal
          open={openSize !== null}
          onOpenChange={(next) => !next && setOpenSize(null)}
          title={`Size: ${openSize ?? ""}`}
          description="Each size emits both base and sm: width classes."
          size={openSize ?? "md"}
        >
          <p className="text-sm text-muted-foreground">
            Resize your viewport to see the responsive width in action.
          </p>
        </Modal>
      </div>
    );
  },
};

// preventBackdropClose stops outside-click and pointer-down-outside; Escape
// still closes the modal (matches existing semantics).
export const PreventBackdropClose: Story = {
  render: (args) => (
    <ModalShell
      {...args}
      preventBackdropClose
      title="Cannot dismiss by clicking outside"
      description="Use Escape or an explicit action to close."
      footer={<Button>Got it</Button>}
    />
  ),
};

// Validates the inherited Dialog max-h + overflow-y-auto: long body content
// scrolls inside the modal at any viewport.
export const LongBody: Story = {
  render: (args) => (
    <ModalShell
      {...args}
      title="Release notes"
      description="Scroll inside the modal."
      footer={<Button>Close</Button>}
    >
      <div className="grid gap-3 text-sm leading-relaxed">
        {Array.from({ length: 20 }).map((_, i) => (
          <p key={i}>
            <strong>Update {i + 1}.</strong> Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </ModalShell>
  ),
};
