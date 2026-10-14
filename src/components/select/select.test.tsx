import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select, SelectTrigger, SelectValue, SelectContent,
  SelectItem,
} from "./select";

describe("<Select />", () => {
  it("renders the trigger label and hides options initially", () => {
    render(
      <Select>
        <SelectTrigger aria-label="fruit">
          <SelectValue placeholder="Pick fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByLabelText("fruit")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
  });

  // The trigger shares the text-field surface (fieldSurfaceVariants default),
  // so a Select next to an Input on a gray page reads as the same kind of field.
  it("gives the trigger the same surface as a text input", () => {
    render(
      <Select>
        <SelectTrigger aria-label="fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByLabelText("fruit");
    expect(trigger).toHaveClass("bg-white", "dark:bg-input/30");
    expect(trigger).not.toHaveClass("bg-transparent");
  });

  it("opens listbox on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Select>
        <SelectTrigger aria-label="fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    await user.click(screen.getByLabelText("fruit"));
    expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument();
  });

  it("calls onValueChange when an option is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Select onValueChange={onChange}>
        <SelectTrigger aria-label="fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    );
    await user.click(screen.getByLabelText("fruit"));
    await user.click(await screen.findByRole("option", { name: "Banana" }));
    expect(onChange).toHaveBeenCalledWith("banana");
  });
});
