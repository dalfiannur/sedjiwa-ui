import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "../components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import { InputOrderProvider, useInputOrder } from "./use-input-order";

function OrderedField({
  order,
  label,
  disabled,
}: {
  order: number;
  label: string;
  disabled?: boolean;
}) {
  const { ref, onKeyDown } = useInputOrder(order);
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <Input.Root disabled={disabled}>
        <Input.Field
          ref={ref as React.Ref<HTMLInputElement>}
          onKeyDown={onKeyDown}
          aria-label={label}
          disabled={disabled}
        />
      </Input.Root>
    </label>
  );
}

const meta: Meta = {
  title: "Hooks/useInputOrder",
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <InputOrderProvider onLastField="none">
      <div className="grid w-80 gap-3">
        {/* DOM order intentionally != logical order */}
        <OrderedField order={3} label="third" />
        <OrderedField order={1} label="first" />
        <OrderedField order={2} label="second" />
      </div>
    </InputOrderProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByLabelText("first");
    const second = canvas.getByLabelText("second");
    const third = canvas.getByLabelText("third");
    first.focus();
    await userEvent.keyboard("{Tab}");
    await expect(second).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(third).toHaveFocus();
  },
};

export const WithDisabled: Story = {
  render: () => (
    <InputOrderProvider onLastField="none">
      <div className="grid w-80 gap-3">
        <OrderedField order={1} label="a" />
        <OrderedField order={2} label="b" disabled />
        <OrderedField order={3} label="c" />
      </div>
    </InputOrderProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const a = canvas.getByLabelText("a");
    const c = canvas.getByLabelText("c");
    a.focus();
    await userEvent.keyboard("{Tab}");
    await expect(c).toHaveFocus();
  },
};

export const Wrap: Story = {
  render: () => (
    <InputOrderProvider onLastField="wrap">
      <div className="grid w-80 gap-3">
        <OrderedField order={1} label="a" />
        <OrderedField order={2} label="b" />
      </div>
    </InputOrderProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const a = canvas.getByLabelText("a");
    const b = canvas.getByLabelText("b");
    b.focus();
    await userEvent.keyboard("{Tab}");
    await expect(a).toHaveFocus();
  },
};

function OrderedSelect({ order, label }: { order: number; label: string }) {
  const { ref, onKeyDown } = useInputOrder(order);
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <Select>
        <SelectTrigger
          ref={ref as React.Ref<HTMLButtonElement>}
          onKeyDown={onKeyDown}
          aria-label={label}
          className="w-full"
        >
          <SelectValue placeholder="Pick…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">X</SelectItem>
          <SelectItem value="y">Y</SelectItem>
        </SelectContent>
      </Select>
    </label>
  );
}

export const WithSelect: Story = {
  render: () => (
    <InputOrderProvider onLastField="none">
      <div className="grid w-80 gap-3">
        <OrderedField order={1} label="before" />
        <OrderedSelect order={2} label="pick" />
        <OrderedField order={3} label="after" />
      </div>
    </InputOrderProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const before = canvas.getByLabelText("before");
    const pick = canvas.getByLabelText("pick");
    const after = canvas.getByLabelText("after");

    // Tab from a plain input to the Select trigger.
    before.focus();
    await userEvent.keyboard("{Tab}");
    await expect(pick).toHaveFocus();

    // Tab from Select trigger to the next ordered field.
    await userEvent.keyboard("{Tab}");
    await expect(after).toHaveFocus();
  },
};

function CustomEnterField() {
  const { ref, onKeyDown } = useInputOrder(2, {
    onEnter: () => alert("custom action"),
  });
  return (
    <label className="grid gap-1 text-sm">
      <span>last (custom Enter)</span>
      <Input.Root>
        <Input.Field
          ref={ref as React.Ref<HTMLInputElement>}
          onKeyDown={onKeyDown}
          aria-label="last"
        />
      </Input.Root>
    </label>
  );
}

export const EnterOverride: Story = {
  render: () => (
    <InputOrderProvider onLastField="none">
      <div className="grid w-80 gap-3">
        <OrderedField order={1} label="first" />
        <CustomEnterField />
      </div>
    </InputOrderProvider>
  ),
};
