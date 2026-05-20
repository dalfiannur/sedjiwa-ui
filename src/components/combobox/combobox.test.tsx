import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "./combobox";

const FRUITS = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
  { id: "cherry", name: "Cherry" },
];

function fruitValue(f: { id: string }) {
  return f.id;
}
function fruitLabel(f: { name: string }) {
  return f.name;
}

describe("<Combobox />", () => {
  describe("scaffold", () => {
    it("renders a trigger button with the default placeholder", () => {
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
        />,
      );
      expect(
        screen.getByRole("combobox", { name: /select/i }),
      ).toBeInTheDocument();
    });

    it("uses a custom placeholder", () => {
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          placeholder="Pick a fruit"
        />,
      );
      expect(
        screen.getByRole("combobox", { name: /pick a fruit/i }),
      ).toBeInTheDocument();
    });
  });

  describe("single-value selection", () => {
    it("opens the listbox on trigger click and renders options", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("shows the selected option's label on the trigger", () => {
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          value="banana"
          onValueChange={() => {}}
        />,
      );
      expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
    });

    it("falls back to the raw value when the option is not in the list", () => {
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          value="durian"
          onValueChange={() => {}}
        />,
      );
      expect(screen.getByRole("combobox")).toHaveTextContent("durian");
    });

    it("clicking an option fires onValueChange and closes the popover", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          onValueChange={onChange}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: /banana/i }));
      expect(onChange).toHaveBeenLastCalledWith("banana");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("uncontrolled defaultValue is shown and updates internally", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          defaultValue="apple"
        />,
      );
      expect(screen.getByRole("combobox")).toHaveTextContent("Apple");
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: /cherry/i }));
      expect(screen.getByRole("combobox")).toHaveTextContent("Cherry");
    });

    it("controlled mode does not update without parent ack", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          value="apple"
          onValueChange={onChange}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: /cherry/i }));
      expect(onChange).toHaveBeenCalledWith("cherry");
      expect(screen.getByRole("combobox")).toHaveTextContent("Apple");
    });
  });
});
