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

  describe("keyboard navigation", () => {
    it("ArrowDown / ArrowUp moves the active option", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      const input = screen.getByPlaceholderText(/search/i);
      expect(input).toHaveFocus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getAllByRole("option")[1]).toHaveAttribute(
        "data-active",
        "true",
      );
      await user.keyboard("{ArrowUp}");
      expect(screen.getAllByRole("option")[0]).toHaveAttribute(
        "data-active",
        "true",
      );
    });

    it("Home / End jump to first / last option", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{End}");
      expect(screen.getAllByRole("option")[2]).toHaveAttribute(
        "data-active",
        "true",
      );
      await user.keyboard("{Home}");
      expect(screen.getAllByRole("option")[0]).toHaveAttribute(
        "data-active",
        "true",
      );
    });

    it("Enter selects the active option", async () => {
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
      await user.keyboard("{ArrowDown}{Enter}");
      expect(onChange).toHaveBeenLastCalledWith("banana");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("Esc closes the popover", async () => {
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
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("skips disabled options when navigating", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          isOptionDisabled={(o) => o.id === "banana"}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{ArrowDown}");
      // banana (idx 1) is disabled, active should land on cherry (idx 2).
      expect(screen.getAllByRole("option")[2]).toHaveAttribute(
        "data-active",
        "true",
      );
    });
  });

  describe("server search mode", () => {
    it("does not filter options locally when onSearchChange is provided", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          onSearchChange={() => {}}
          searchDebounceMs={0}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "zzz");
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("debounces onSearchChange", async () => {
      vi.useFakeTimers();
      try {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const onSearchChange = vi.fn();
        render(
          <Combobox
            options={FRUITS}
            getOptionValue={fruitValue}
            getOptionLabel={fruitLabel}
            onSearchChange={onSearchChange}
            searchDebounceMs={300}
          />,
        );
        await user.click(screen.getByRole("combobox"));
        await user.type(screen.getByPlaceholderText(/search/i), "ap");
        expect(onSearchChange).not.toHaveBeenCalled();
        vi.advanceTimersByTime(300);
        expect(onSearchChange).toHaveBeenCalledTimes(1);
        expect(onSearchChange).toHaveBeenLastCalledWith("ap");
      } finally {
        vi.useRealTimers();
      }
    });

    it("shows the loading message instead of options when loading and no options", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={[] as typeof FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          onSearchChange={() => {}}
          loading
          loadingMessage="Fetching…"
        />,
      );
      await user.click(screen.getByRole("combobox"));
      expect(screen.getByText(/fetching…/i)).toBeInTheDocument();
    });

    it("emits the latest query when typing continues past the debounce", async () => {
      vi.useFakeTimers();
      try {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const onSearchChange = vi.fn();
        render(
          <Combobox
            options={FRUITS}
            getOptionValue={fruitValue}
            getOptionLabel={fruitLabel}
            onSearchChange={onSearchChange}
            searchDebounceMs={100}
          />,
        );
        await user.click(screen.getByRole("combobox"));
        await user.type(screen.getByPlaceholderText(/search/i), "a");
        vi.advanceTimersByTime(100);
        await user.type(screen.getByPlaceholderText(/search/i), "p");
        vi.advanceTimersByTime(100);
        expect(onSearchChange.mock.calls.map((c) => c[0])).toEqual(["a", "ap"]);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("multiple select", () => {
    it("renders no chips when empty", () => {
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          multiple
        />,
      );
      expect(screen.queryByTestId("combobox-chip")).not.toBeInTheDocument();
    });

    it("toggles values on selection and keeps the popover open", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          multiple
          onValueChange={onChange}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: /apple/i }));
      expect(onChange).toHaveBeenLastCalledWith(["apple"]);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await user.click(screen.getByRole("option", { name: /cherry/i }));
      expect(onChange).toHaveBeenLastCalledWith(["apple", "cherry"]);
    });

    it("renders chips for each selected value", () => {
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          multiple
          value={["apple", "cherry"]}
          onValueChange={() => {}}
        />,
      );
      const chips = screen.getAllByTestId("combobox-chip");
      expect(chips).toHaveLength(2);
      expect(chips[0]).toHaveTextContent("Apple");
      expect(chips[1]).toHaveTextContent("Cherry");
    });

    it("× on a chip removes only that value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          multiple
          defaultValue={["apple", "banana"]}
          onValueChange={onChange}
        />,
      );
      const removeBananaButton = screen.getByRole("button", {
        name: /remove banana/i,
      });
      await user.click(removeBananaButton);
      expect(onChange).toHaveBeenLastCalledWith(["apple"]);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("collapses overflow chips into +N more", () => {
      const many = [
        { id: "a", name: "Apple" },
        { id: "b", name: "Banana" },
        { id: "c", name: "Cherry" },
        { id: "d", name: "Date" },
        { id: "e", name: "Elderberry" },
      ];
      render(
        <Combobox
          options={many}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          multiple
          maxChips={3}
          value={["a", "b", "c", "d", "e"]}
          onValueChange={() => {}}
        />,
      );
      const chips = screen.getAllByTestId("combobox-chip");
      expect(chips).toHaveLength(3);
      expect(screen.getByText(/\+2 more/i)).toBeInTheDocument();
    });

    it("backspace on empty search removes the last selected chip", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          multiple
          defaultValue={["apple", "banana"]}
          onValueChange={onChange}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{Backspace}");
      expect(onChange).toHaveBeenLastCalledWith(["apple"]);
    });

    it("renderValue overrides the default single-mode label", () => {
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          value="apple"
          onValueChange={() => {}}
          renderValue={(s) =>
            s ? <span>SELECTED: {(s as { name: string }).name}</span> : null
          }
        />,
      );
      expect(screen.getByRole("combobox")).toHaveTextContent(
        /SELECTED: Apple/,
      );
    });

    it("renderValue receives an array in multi mode", () => {
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          multiple
          value={["apple", "cherry"]}
          onValueChange={() => {}}
          renderValue={(s) => {
            const arr = s as { name: string }[];
            return <span>COUNT={arr.length}</span>;
          }}
        />,
      );
      expect(screen.getByRole("combobox")).toHaveTextContent("COUNT=2");
    });

    it("backspace with non-empty search does NOT remove a chip", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          multiple
          defaultValue={["apple", "banana"]}
          onValueChange={onChange}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "a");
      await user.keyboard("{Backspace}");
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
