import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AudioMessage } from "./audio-message";

const meta: Meta<typeof AudioMessage> = {
  title: "Data Display/AudioMessage",
  component: AudioMessage,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof AudioMessage>;

// A tiny silent WAV so the story never touches the network.
const SILENT =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

export const InBubbles: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <div className="bg-card border-border rounded-2xl rounded-bl-sm border px-3 py-2">
        <AudioMessage src={SILENT} />
      </div>
      <div className="bg-primary text-primary-foreground self-end rounded-2xl rounded-br-sm px-3 py-2">
        <AudioMessage src={SILENT} tone="inverted" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("button", { name: "Putar pesan suara" })).toHaveLength(2);
  },
};
