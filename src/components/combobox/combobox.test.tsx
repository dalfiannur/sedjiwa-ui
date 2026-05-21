import * as React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { Combobox } from "./combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";

type IOObserverEntry = {
  target: Element;
  callback: IntersectionObserverCallback;
  instance: IntersectionObserver;
};

const ioRegistry: IOObserverEntry[] = [];

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  private targets = new Set<Element>();
  constructor(private cb: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.targets.add(target);
    ioRegistry.push({ target, callback: this.cb, instance: this });
  }
  unobserve(target: Element) {
    this.targets.delete(target);
    for (let i = ioRegistry.length - 1; i >= 0; i--) {
      if (ioRegistry[i]!.target === target && ioRegistry[i]!.instance === this) {
        ioRegistry.splice(i, 1);
      }
    }
  }
  disconnect() {
    for (let i = ioRegistry.length - 1; i >= 0; i--) {
      if (ioRegistry[i]!.instance === this) {
        ioRegistry.splice(i, 1);
      }
    }
    this.targets.clear();
  }
  takeRecords() {
    return [];
  }
}

beforeAll(() => {
  (
    globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }
  ).IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  ioRegistry.length = 0;
});

function triggerSentinelIntersection() {
  for (const entry of ioRegistry) {
    entry.callback(
      [
        {
          isIntersecting: true,
          target: entry.target,
          intersectionRatio: 1,
          time: 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
        },
      ],
      entry.instance,
    );
  }
}

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

  describe("pagination", () => {
    it("calls onLoadMore when the sentinel intersects and hasMore is true", async () => {
      const user = userEvent.setup();
      const onLoadMore = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          onLoadMore={onLoadMore}
          hasMore
        />,
      );
      await user.click(screen.getByRole("combobox"));
      triggerSentinelIntersection();
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it("does NOT call onLoadMore when loading", async () => {
      const user = userEvent.setup();
      const onLoadMore = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          onLoadMore={onLoadMore}
          hasMore
          loading
        />,
      );
      await user.click(screen.getByRole("combobox"));
      triggerSentinelIntersection();
      expect(onLoadMore).not.toHaveBeenCalled();
    });

    it("does NOT call onLoadMore when hasMore is false", async () => {
      const user = userEvent.setup();
      const onLoadMore = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          onLoadMore={onLoadMore}
          hasMore={false}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      triggerSentinelIntersection();
      expect(onLoadMore).not.toHaveBeenCalled();
    });

    it("does NOT call onLoadMore when onLoadMore is undefined", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          hasMore
        />,
      );
      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });
});

describe("clearable", () => {
  it("does NOT show clear button by default", () => {
    render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
        value="apple"
        onValueChange={() => {}}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /clear/i }),
    ).not.toBeInTheDocument();
  });

  it("clearable renders a clear button when a value is selected", () => {
    render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
        value="apple"
        onValueChange={() => {}}
        clearable
      />,
    );
    expect(
      screen.getByRole("button", { name: /clear/i }),
    ).toBeInTheDocument();
  });

  it("clearable button clears single value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
        defaultValue="apple"
        onValueChange={onChange}
        clearable
      />,
    );
    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("clearable button clears multi value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
        multiple
        defaultValue={["apple", "cherry"]}
        onValueChange={onChange}
        clearable
      />,
    );
    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe("form submission", () => {
  it("single mode renders one hidden input when name is set", () => {
    const { container } = render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
        defaultValue="apple"
        name="fruit"
      />,
    );
    const hiddens = container.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="fruit"]',
    );
    expect(hiddens).toHaveLength(1);
    expect(hiddens[0]!.value).toBe("apple");
  });

  it("multi mode renders one hidden input per selected value", () => {
    const { container } = render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
        multiple
        defaultValue={["apple", "cherry"]}
        name="fruits"
      />,
    );
    const hiddens = container.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="fruits"]',
    );
    expect(Array.from(hiddens).map((h) => h.value)).toEqual([
      "apple",
      "cherry",
    ]);
  });
});

describe("forwarding + ARIA", () => {
  it("forwards ref to the trigger", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Combobox
        ref={ref}
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
      />,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("state='error' propagates aria-invalid", () => {
    render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
        state="error"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("disabled blocks opening", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
        disabled
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

describe("RHF integration", () => {
  function RHFTestForm({
    multiple,
    onSubmit,
  }: {
    multiple: boolean;
    onSubmit: (data: Record<string, unknown>) => void;
  }) {
    const form = useForm<Record<string, unknown>>({
      defaultValues: { fruit: multiple ? [] : null },
    });
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="fruit"
            rules={{
              validate: (v) =>
                multiple
                  ? Array.isArray(v) && v.length > 0
                    ? true
                    : "Pick at least one"
                  : v
                    ? true
                    : "Required",
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fruit</FormLabel>
                <FormControl>
                  {multiple ? (
                    <Combobox
                      options={FRUITS}
                      getOptionValue={fruitValue}
                      getOptionLabel={fruitLabel}
                      multiple
                      value={field.value as string[]}
                      onValueChange={field.onChange}
                      name={field.name}
                      ref={field.ref}
                    />
                  ) : (
                    <Combobox
                      options={FRUITS}
                      getOptionValue={fruitValue}
                      getOptionLabel={fruitLabel}
                      value={field.value as string | null}
                      onValueChange={field.onChange}
                      name={field.name}
                      ref={field.ref}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button type="submit">Submit</button>
        </form>
      </Form>
    );
  }

  it("single-mode Controller wires field.onChange to onValueChange", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RHFTestForm multiple={false} onSubmit={onSubmit} />);
    await user.click(screen.getByLabelText("Fruit"));
    await user.click(screen.getByRole("option", { name: /banana/i }));
    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ fruit: "banana" }),
      expect.anything(),
    );
  });

  it("FormControl Slot-cloning lands aria-invalid on the trigger", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RHFTestForm multiple={false} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const trigger = screen.getByLabelText("Fruit");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("multi-mode Controller round-trips a string[]", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RHFTestForm multiple onSubmit={onSubmit} />);
    await user.click(screen.getByLabelText("Fruit"));
    await user.click(screen.getByRole("option", { name: /apple/i }));
    await user.click(screen.getByRole("option", { name: /cherry/i }));
    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ fruit: ["apple", "cherry"] }),
      expect.anything(),
    );
  });
});

describe("polish (final-review fixes)", () => {
  it("listbox has an accessible name (aria-label)", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
        aria-label="Fruit picker"
      />,
    );
    await user.click(screen.getByRole("combobox", { name: /fruit picker/i }));
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-label",
      "Fruit picker",
    );
  });

  it("keyboard navigation works when searchable={false}", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
        searchable={false}
        onValueChange={onChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    // Listbox should be focusable when searchable=false; ArrowDown should move active.
    await user.keyboard("{ArrowDown}");
    expect(screen.getAllByRole("option")[1]).toHaveAttribute(
      "data-active",
      "true",
    );
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("banana");
  });

  it("focus returns to the trigger after close", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        options={FRUITS}
        getOptionValue={fruitValue}
        getOptionLabel={fruitLabel}
      />,
    );
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  describe("creatable", () => {
    it("shows a create row when the query has no matching option", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          creatable
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "kiwi");
      const createRow = screen.getByRole("option", { name: /create.*kiwi/i });
      expect(createRow).toHaveAttribute(
        "data-slot",
        "combobox-create-option",
      );
    });

    it("does not show the create row when query matches an existing label (case-insensitive)", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          creatable
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "apple");
      expect(
        screen.queryByRole("option", { name: /create/i }),
      ).not.toBeInTheDocument();
    });

    it("does not show the create row for an empty/whitespace-only query", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          creatable
        />,
      );
      await user.click(screen.getByRole("combobox"));
      // no query: no create row
      expect(
        screen.queryByRole("option", { name: /create/i }),
      ).not.toBeInTheDocument();
      await user.type(screen.getByPlaceholderText(/search/i), "   ");
      expect(
        screen.queryByRole("option", { name: /create/i }),
      ).not.toBeInTheDocument();
    });

    it("clicking the create row fires onCreate with the trimmed query", async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          creatable
          onCreate={onCreate}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "  Kiwi  ");
      await user.click(screen.getByRole("option", { name: /create.*kiwi/i }));
      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate).toHaveBeenCalledWith("Kiwi");
    });

    it("Enter on an active create row fires onCreate", async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          creatable
          onCreate={onCreate}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "zzz");
      // only the create row remains; it should be the active option
      await user.keyboard("{Enter}");
      expect(onCreate).toHaveBeenCalledWith("zzz");
    });

    it("single-select: closes the popover and clears the search after create", async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          creatable
          onCreate={onCreate}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "kiwi");
      await user.click(screen.getByRole("option", { name: /create.*kiwi/i }));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("multi-select: keeps the popover open and clears the search after create", async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      render(
        <Combobox
          multiple
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          creatable
          onCreate={onCreate}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      await user.type(input, "kiwi");
      await user.click(screen.getByRole("option", { name: /create.*kiwi/i }));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(input.value).toBe("");
    });

    it("respects formatCreateLabel override", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          creatable
          formatCreateLabel={(q) => `Add new tag: ${q}`}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "kiwi");
      expect(
        screen.getByRole("option", { name: /add new tag: kiwi/i }),
      ).toBeInTheDocument();
    });

    it("respects isValidNewOption override (suppresses the create row)", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          creatable
          isValidNewOption={() => false}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "kiwi");
      expect(
        screen.queryByRole("option", { name: /create/i }),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });

    it("places the create row first when createPosition='first'", async () => {
      const user = userEvent.setup();
      render(
        <Combobox
          options={FRUITS}
          getOptionValue={fruitValue}
          getOptionLabel={fruitLabel}
          creatable
          createPosition="first"
        />,
      );
      await user.click(screen.getByRole("combobox"));
      await user.type(screen.getByPlaceholderText(/search/i), "a");
      const opts = screen.getAllByRole("option");
      expect(opts[0]).toHaveAttribute(
        "data-slot",
        "combobox-create-option",
      );
    });
  });
});
