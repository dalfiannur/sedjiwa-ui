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

  describe("local search", () => {
    it("renders a search input by default", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      expect(
        screen.getByPlaceholderText(/search/i),
      ).toBeInTheDocument();
    });

    it("hides the search input when searchable=false", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          searchable={false}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    });

    it("filters options by case-insensitive substring on label", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "an");
      const opts = screen.getAllByRole("option");
      expect(opts).toHaveLength(1);
      expect(opts[0]).toHaveTextContent(/banana/i);
    });

    it("shows the empty message when no options match", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          emptyMessage="Nothing found"
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "xyz");
      expect(screen.getByText(/nothing found/i)).toBeInTheDocument();
    });

    it("custom filterFn overrides default substring match", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          filterFn={(o, q) =>
            o.id.toLowerCase().startsWith(q.toLowerCase())
          }
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "b");
      const opts = screen.getAllByRole("option");
      expect(opts).toHaveLength(1);
      expect(opts[0]).toHaveTextContent(/banana/i);
    });
  });
});
