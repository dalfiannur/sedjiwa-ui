import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagsInput } from "./tags-input";

const SUGGESTIONS = ["react", "vue", "svelte"];

function chips(): string[] {
  return screen
    .queryAllByTestId("combobox-chip")
    .map((c) => c.textContent ?? "");
}

async function openAndType(user: ReturnType<typeof userEvent.setup>, q: string) {
  await user.click(screen.getByRole("combobox"));
  await user.type(screen.getByPlaceholderText(/tambah/i), q);
}

describe("<TagsInput />", () => {
  it("renders the current tags as chips", () => {
    render(<TagsInput defaultValue={["react", "vue"]} />);
    expect(chips()).toEqual(["react", "vue"]);
  });

  it("renders no chips when empty", () => {
    render(<TagsInput />);
    expect(chips()).toEqual([]);
  });

  it("adds a tag the user types", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TagsInput onValueChange={onValueChange} />);
    await openAndType(user, "solid");
    await user.click(screen.getByRole("option", { name: /solid/i }));
    expect(onValueChange).toHaveBeenLastCalledWith(["solid"]);
  });

  it("keeps a typed tag visible as a chip", async () => {
    const user = userEvent.setup();
    render(<TagsInput />);
    await openAndType(user, "solid");
    await user.click(screen.getByRole("option", { name: /solid/i }));
    expect(chips()).toEqual(["solid"]);
  });

  it("appends rather than replaces", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TagsInput defaultValue={["react"]} onValueChange={onValueChange} />);
    await openAndType(user, "solid");
    await user.click(screen.getByRole("option", { name: /solid/i }));
    expect(onValueChange).toHaveBeenLastCalledWith(["react", "solid"]);
  });

  it("adds a suggestion the user picks from the list", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TagsInput suggestions={SUGGESTIONS} onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "vue" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["vue"]);
  });

  it("refuses to create a tag that is already on the list", async () => {
    const user = userEvent.setup();
    render(<TagsInput defaultValue={["react"]} />);
    await openAndType(user, "react");
    expect(
      screen.queryByRole("option", { name: /create/i }),
    ).not.toBeInTheDocument();
  });

  it("refuses to create a tag that duplicates a suggestion", async () => {
    const user = userEvent.setup();
    render(<TagsInput suggestions={SUGGESTIONS} />);
    await openAndType(user, "vue");
    expect(
      screen.queryByRole("option", { name: /create/i }),
    ).not.toBeInTheDocument();
  });

  it("removes a tag through its chip", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TagsInput
        defaultValue={["react", "vue"]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Remove react" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["vue"]);
  });

  it("obeys a controlled value", async () => {
    const user = userEvent.setup();
    render(<TagsInput value={["react"]} />);
    await openAndType(user, "solid");
    await user.click(screen.getByRole("option", { name: /solid/i }));
    expect(chips()).toEqual(["react"]);
  });

  it("takes a custom search placeholder", async () => {
    const user = userEvent.setup();
    render(<TagsInput searchPlaceholder="Ketik label…" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByPlaceholderText("Ketik label…")).toBeInTheDocument();
  });

  it("marks itself invalid in the error state", () => {
    render(<TagsInput state="error" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-state", "error");
  });

  it("can be disabled", () => {
    render(<TagsInput disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
