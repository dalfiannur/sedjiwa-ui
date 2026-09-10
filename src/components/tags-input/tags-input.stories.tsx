import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TagsInput, type TagsInputProps } from "./tags-input";
import { Label } from "../label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../form";

const FRAMEWORKS = ["react", "vue", "svelte", "solid", "angular"];

const meta: Meta<TagsInputProps> = {
  title: "Components/TagsInput",
  component: TagsInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    maxChips: { control: "number" },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "default",
    state: "default",
    clearable: false,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<TagsInputProps>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <TagsInput {...args} />
    </div>
  ),
};

/** Suggestions are a starting point, not a limit — anything typed can be added. */
export const WithSuggestions: Story = {
  args: { suggestions: FRAMEWORKS },
  render: (args) => (
    <div className="w-80 space-y-2">
      <Label>Teknologi</Label>
      <TagsInput {...args} />
    </div>
  ),
};

export const Prefilled: Story = {
  args: { suggestions: FRAMEWORKS, defaultValue: ["react", "svelte"] },
  render: (args) => (
    <div className="w-80">
      <TagsInput {...args} />
    </div>
  ),
};

/** Past `maxChips` the rest collapse into a count rather than wrapping forever. */
export const ManyTags: Story = {
  args: {
    defaultValue: ["react", "vue", "svelte", "solid", "angular", "qwik"],
    maxChips: 3,
  },
  render: (args) => (
    <div className="w-80">
      <TagsInput {...args} />
    </div>
  ),
};

export const Clearable: Story = {
  args: { defaultValue: ["react", "vue"], clearable: true },
  render: (args) => (
    <div className="w-80">
      <TagsInput {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="w-80 space-y-3">
      {(["sm", "default", "lg"] as const).map((size) => (
        <TagsInput key={size} {...args} size={size} defaultValue={[size]} />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="w-80 space-y-3">
      {(["default", "error", "success", "warning"] as const).map((state) => (
        <TagsInput key={state} {...args} state={state} defaultValue={[state]} />
      ))}
    </div>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [tags, setTags] = useState<string[]>(["react"]);
    return (
      <div className="w-80 space-y-2">
        <TagsInput
          {...args}
          suggestions={FRAMEWORKS}
          value={tags}
          onValueChange={setTags}
        />
        <p className="text-sm text-muted-foreground">
          {tags.length} label: {tags.join(", ") || "—"}
        </p>
      </div>
    );
  },
};

export const InRHFForm: Story = {
  render: () => {
    type Values = { tags: string[] };
    const form = useForm<Values>({ defaultValues: { tags: [] } });
    return (
      <Form {...form}>
        <form
          className="w-80 space-y-4"
          onSubmit={form.handleSubmit(() => undefined)}
        >
          <FormField
            control={form.control}
            name="tags"
            rules={{
              validate: (v) => v.length > 0 || "Pilih minimal satu label",
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <TagsInput
                    suggestions={FRAMEWORKS}
                    value={field.value}
                    onValueChange={field.onChange}
                    name={field.name}
                  />
                </FormControl>
                <FormDescription>
                  Ketik lalu pilih baris &ldquo;Create&rdquo; untuk label baru.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  },
};
