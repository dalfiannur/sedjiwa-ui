import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Combobox } from "./combobox";
import type { FieldSurfaceVariants } from "../../lib/field-surface.variants";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";

type Fruit = { id: string; name: string };

const FRUITS: Fruit[] = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
  { id: "cherry", name: "Cherry" },
  { id: "date", name: "Date" },
  { id: "elderberry", name: "Elderberry" },
  { id: "fig", name: "Fig" },
  { id: "grape", name: "Grape" },
  { id: "honeydew", name: "Honeydew" },
];

/** Shared props controlled by Storybook controls. */
type BaseArgs = {
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxChips?: number;
};

const meta: Meta<BaseArgs> = {
  title: "Components/Combobox",
  component: Combobox as never,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    state: {
      control: "select",
      options: ["default", "error", "success", "warning"],
    },
    disabled: { control: "boolean" },
    searchable: { control: "boolean" },
    clearable: { control: "boolean" },
    multiple: { control: "boolean" },
  },
  args: {
    size: "default",
    state: "default",
    disabled: false,
    searchable: true,
    clearable: false,
  },
};
export default meta;

type Story = StoryObj<BaseArgs>;

export const Default: Story = {
  render: (args: BaseArgs) => (
    <div className="w-80">
      <Combobox<Fruit>
        size={args.size}
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        placeholder="Pick a fruit"
      />
    </div>
  ),
};

export const WithValue: Story = {
  render: (args: BaseArgs) => (
    <div className="w-80">
      <Combobox<Fruit>
        size={args.size}
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue="banana"
      />
    </div>
  ),
};

export const NotSearchable: Story = {
  args: { searchable: false },
  render: (args: BaseArgs) => (
    <div className="w-80">
      <Combobox<Fruit>
        size={args.size}
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        placeholder="Pick a fruit"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args: BaseArgs) => (
    <div className="flex w-80 flex-col gap-3">
      <Combobox<Fruit>
        size="sm"
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue="apple"
      />
      <Combobox<Fruit>
        size="default"
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue="apple"
      />
      <Combobox<Fruit>
        size="lg"
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue="apple"
      />
    </div>
  ),
};

export const States: Story = {
  render: (args: BaseArgs) => (
    <div className="flex w-80 flex-col gap-3">
      <Combobox<Fruit>
        size={args.size}
        state="default"
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue="apple"
      />
      <Combobox<Fruit>
        size={args.size}
        state="error"
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue="apple"
      />
      <Combobox<Fruit>
        size={args.size}
        state="success"
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue="apple"
      />
      <Combobox<Fruit>
        size={args.size}
        state="warning"
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue="apple"
      />
      <Combobox<Fruit>
        size={args.size}
        state={args.state}
        disabled
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue="apple"
      />
    </div>
  ),
};

export const Clearable: Story = {
  args: { clearable: true },
  render: (args: BaseArgs) => (
    <div className="w-80">
      <Combobox<Fruit>
        size={args.size}
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue="apple"
      />
    </div>
  ),
};

export const Multiple: Story = {
  args: { multiple: true },
  render: (args: BaseArgs) => (
    <div className="w-96">
      <Combobox<Fruit>
        multiple
        size={args.size}
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        placeholder="Pick fruits"
      />
    </div>
  ),
};

export const MultipleWithChips: Story = {
  args: { multiple: true, maxChips: 2 },
  render: (args: BaseArgs) => (
    <div className="w-96">
      <Combobox<Fruit>
        multiple
        size={args.size}
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        maxChips={args.maxChips}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue={["apple", "banana", "cherry", "date"]}
      />
    </div>
  ),
};

export const WithDisabledOptions: Story = {
  render: (args: BaseArgs) => (
    <div className="w-80">
      <Combobox<Fruit>
        size={args.size}
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        isOptionDisabled={(o) => o.id === "banana"}
      />
    </div>
  ),
};

export const CustomRenderOption: Story = {
  render: (args: BaseArgs) => (
    <div className="w-80">
      <Combobox<Fruit>
        size={args.size}
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        renderOption={(o, { selected }) => (
          <span className="flex w-full items-center justify-between gap-2">
            <span>{o.name}</span>
            <span className="text-xs text-muted-foreground">{o.id}</span>
            {selected ? (
              <span className="text-xs text-primary">✓</span>
            ) : null}
          </span>
        )}
      />
    </div>
  ),
};

export const CustomRenderValue: Story = {
  args: { multiple: true },
  render: (args: BaseArgs) => (
    <div className="w-96">
      <Combobox<Fruit>
        multiple
        size={args.size}
        state={args.state}
        disabled={args.disabled}
        searchable={args.searchable}
        clearable={args.clearable}
        options={FRUITS}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultValue={["apple", "banana"]}
        renderValue={(s) => {
          if (!s) return null;
          const list = Array.isArray(s) ? s : [s];
          return (
            <span className="text-sm">
              {list.length} fruits picked: {list.map((f) => f.name).join(", ")}
            </span>
          );
        }}
      />
    </div>
  ),
};

export const ServerSearch: Story = {
  render: (args: BaseArgs) => {
    function ServerSearchExample() {
      const [query, setQuery] = useState("");
      const [loading, setLoading] = useState(false);
      const [results, setResults] = useState<Fruit[]>(FRUITS);

      useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const t = window.setTimeout(() => {
          if (cancelled) return;
          const q = query.toLowerCase();
          setResults(
            q
              ? FRUITS.filter((f) => f.name.toLowerCase().includes(q))
              : FRUITS,
          );
          setLoading(false);
        }, 400);
        return () => {
          cancelled = true;
          window.clearTimeout(t);
        };
      }, [query]);

      return (
        <div className="w-80">
          <Combobox<Fruit>
            size={args.size}
            state={args.state}
            disabled={args.disabled}
            searchable={args.searchable}
            clearable={args.clearable}
            options={results}
            getOptionValue={(o) => o.id}
            getOptionLabel={(o) => o.name}
            onSearchChange={setQuery}
            loading={loading}
            emptyMessage="No fruits found"
          />
        </div>
      );
    }
    return <ServerSearchExample />;
  },
};

export const InfiniteScroll: Story = {
  render: (args: BaseArgs) => {
    function InfiniteScrollExample() {
      const PAGE = 25;
      const TOTAL = 200;
      const allOptions = useMemo<Fruit[]>(
        () =>
          Array.from({ length: TOTAL }, (_, i) => ({
            id: `id-${i}`,
            name: `Item ${i + 1}`,
          })),
        [],
      );
      const [visibleCount, setVisibleCount] = useState(PAGE);
      const [loading, setLoading] = useState(false);
      const visible = allOptions.slice(0, visibleCount);
      const hasMore = visibleCount < TOTAL;

      const onLoadMore = () => {
        if (loading || !hasMore) return;
        setLoading(true);
        window.setTimeout(() => {
          setVisibleCount((n) => Math.min(n + PAGE, TOTAL));
          setLoading(false);
        }, 400);
      };

      return (
        <div className="w-80">
          <Combobox<Fruit>
            size={args.size}
            state={args.state}
            disabled={args.disabled}
            searchable={args.searchable}
            clearable={args.clearable}
            options={visible}
            getOptionValue={(o) => o.id}
            getOptionLabel={(o) => o.name}
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            loading={loading}
          />
        </div>
      );
    }
    return <InfiniteScrollExample />;
  },
};

export const ServerSearchPlusInfiniteScroll: Story = {
  args: { multiple: true },
  render: (args: BaseArgs) => {
    function Demo() {
      const PAGE = 20;
      const all = useMemo<Fruit[]>(
        () =>
          Array.from({ length: 150 }, (_, i) => ({
            id: `id-${i}`,
            name: `Person #${i + 1}`,
          })),
        [],
      );
      const [query, setQuery] = useState("");
      const [page, setPage] = useState(1);
      const [loading, setLoading] = useState(false);

      const filtered = useMemo(() => {
        if (!query) return all;
        const q = query.toLowerCase();
        return all.filter((p) => p.name.toLowerCase().includes(q));
      }, [all, query]);
      const visible = filtered.slice(0, page * PAGE);
      const hasMore = visible.length < filtered.length;

      useEffect(() => {
        setPage(1);
      }, [query]);

      const onSearchChange = (q: string) => {
        setLoading(true);
        window.setTimeout(() => {
          setQuery(q);
          setLoading(false);
        }, 300);
      };

      const onLoadMore = () => {
        if (loading || !hasMore) return;
        setLoading(true);
        window.setTimeout(() => {
          setPage((p) => p + 1);
          setLoading(false);
        }, 300);
      };

      return (
        <div className="w-96">
          <Combobox<Fruit>
            multiple
            size={args.size}
            state={args.state}
            disabled={args.disabled}
            searchable={args.searchable}
            clearable={args.clearable}
            options={visible}
            getOptionValue={(o) => o.id}
            getOptionLabel={(o) => o.name}
            onSearchChange={onSearchChange}
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            loading={loading}
          />
        </div>
      );
    }
    return <Demo />;
  },
};

export const InRHFForm: Story = {
  render: (args: BaseArgs) => {
    function RHFExample() {
      const form = useForm<{ fruits: string[] }>({
        defaultValues: { fruits: [] },
      });
      const onSubmit = (data: { fruits: string[] }) => {
        alert(`Submitted: ${JSON.stringify(data)}`);
      };
      return (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-96 flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="fruits"
              rules={{
                validate: (v: string[]) =>
                  v.length > 0 ? true : "Pick at least one",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fruits</FormLabel>
                  <FormControl>
                    <Combobox<Fruit>
                      multiple
                      size={args.size}
                      state={args.state}
                      disabled={args.disabled}
                      searchable={args.searchable}
                      options={FRUITS}
                      getOptionValue={(o) => o.id}
                      getOptionLabel={(o) => o.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>Pick any number of fruits.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              className="rounded-md border bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              Submit
            </button>
          </form>
        </Form>
      );
    }
    return <RHFExample />;
  },
};
