import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "Feedback/Progress",
  component: Progress,
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "success", "warning", "error"],
    },
  },
  args: { value: 40, size: "default", state: "default" },
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <Progress {...args} aria-label="Mengunggah berkas" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">{size}</span>
          <Progress {...args} size={size} aria-label={`Ukuran ${size}`} />
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-4">
      {(
        [
          ["default", 45],
          ["success", 100],
          ["warning", 70],
          ["error", 30],
        ] as const
      ).map(([state, value]) => (
        <div key={state} className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">{state}</span>
          <Progress {...args} state={state} value={value} aria-label={state} />
        </div>
      ))}
    </div>
  ),
};

/** No value: the work is happening, the duration is unknown. aria-valuenow is
 *  omitted rather than set to 0. Turn on reduced motion to see the travelling
 *  segment give way to a filled track. */
export const Indeterminate: Story = {
  render: (args) => (
    <div className="w-80">
      <Progress {...args} value={null} aria-label="Memuat" />
    </div>
  ),
};
