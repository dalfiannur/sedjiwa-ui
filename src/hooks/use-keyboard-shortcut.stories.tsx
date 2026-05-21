import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "../components/input";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";

const meta: Meta = {
  title: "Hooks/useKeyboardShortcut",
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj;

function GlobalDemo() {
  const [count, setCount] = React.useState(0);
  useKeyboardShortcut("escape", () => setCount((c) => c + 1));
  return (
    <div className="grid w-80 gap-2 text-sm">
      <p className="text-muted-foreground">Press Escape anywhere on the page.</p>
      <p>
        Triggered: <span data-testid="count">{count}</span>
      </p>
    </div>
  );
}

export const Global: Story = {
  render: () => <GlobalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByTestId("count")).toHaveTextContent("1");
  },
};

function ModDemo() {
  const [last, setLast] = React.useState("—");
  useKeyboardShortcut("mod+k", () => setLast("mod+k"));
  return (
    <div className="grid w-80 gap-2 text-sm">
      <p className="text-muted-foreground">
        Press <kbd>⌘K</kbd> on macOS or <kbd>Ctrl+K</kbd> elsewhere.
      </p>
      <p>
        Last: <span data-testid="last">{last}</span>
      </p>
    </div>
  );
}

export const ModAlias: Story = {
  render: () => <ModDemo />,
};

function InputDemo() {
  const [count, setCount] = React.useState(0);
  useKeyboardShortcut("a", () => setCount((c) => c + 1), {
    allowInInputs: true,
    preventDefault: false,
  });
  return (
    <div className="grid w-80 gap-2 text-sm">
      <p className="text-muted-foreground">
        Type in the input — &quot;a&quot; still fires (allowInInputs: true).
      </p>
      <Input.Root>
        <Input.Field aria-label="text" placeholder="Type 'a'…" />
      </Input.Root>
      <p>
        Triggered: <span data-testid="count">{count}</span>
      </p>
    </div>
  );
}

export const AllowInInputs: Story = {
  render: () => <InputDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("text");
    input.focus();
    await userEvent.keyboard("a");
    await expect(canvas.getByTestId("count")).toHaveTextContent("1");
  },
};

function TargetDemo() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [count, setCount] = React.useState(0);
  useKeyboardShortcut("space", () => setCount((c) => c + 1), {
    target: ref,
    allowInInputs: true,
  });
  return (
    <div className="grid w-80 gap-2 text-sm">
      <p className="text-muted-foreground">
        Focus the box and press Space — only fires inside the box.
      </p>
      <div
        ref={ref}
        tabIndex={0}
        aria-label="box"
        className="bg-muted/40 outline-ring focus:ring-ring grid h-24 place-items-center rounded-md border focus:ring-2"
      >
        Focus me
      </div>
      <p>
        Triggered: <span data-testid="count">{count}</span>
      </p>
    </div>
  );
}

export const ElementTarget: Story = {
  render: () => <TargetDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByLabelText("box").focus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByTestId("count")).toHaveTextContent("1");
  },
};
