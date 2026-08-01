# @qyubit/sedjiwa-ui

Shared React + Tailwind CSS UI primitives for the sedjiwa-portal apps.

## Status

`v0.2.0` ships 19 atomic primitives plus 2 composed primitives (DataTable, Modal) extracted from observed consumer patterns.

## Requirements

- React 19+
- Tailwind CSS 4+
- A consumer app set up to use Tailwind v4's `@source` directive.

## Install

```bash
bun add @qyubit/sedjiwa-ui \
  @radix-ui/react-alert-dialog @radix-ui/react-avatar \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-label @radix-ui/react-select \
  @radix-ui/react-separator @radix-ui/react-slot \
  @radix-ui/react-tabs @radix-ui/react-tooltip \
  lucide-react next-themes react-hook-form sonner tw-animate-css
```

`react`, `react-dom`, and `tailwindcss` are peer dependencies your app already provides. The Radix `@radix-ui/*` packages, `lucide-react` (icons), `next-themes` (Toaster theme integration), `react-hook-form` (Form integration), `sonner` (Toaster runtime), and `tw-animate-css` (entrance/exit animations) are also peer dependencies — install whichever you actually use.

## Setup

In your app's main stylesheet (e.g., `src/index.css`):

```css
@import "tailwindcss";
@import "@qyubit/sedjiwa-ui/styles.css";

@source "../node_modules/@qyubit/sedjiwa-ui";
```

The `@source` directive tells Tailwind to scan the library's compiled JSX so utility classes used inside our components are emitted into your final CSS.

## Theming

The library exposes shadcn-shaped CSS variables: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--success`, `--warning`, `--info`, `--border`, `--input`, `--ring`, `--radius`, plus `--sidebar-*` and `--chart-*`.

Override any token in your own `:root { ... }` and `.dark { ... }` blocks **after** importing the library stylesheet.

See [`docs/theming.md`](./docs/theming.md) for the full token contract, including the semantic colour pairs' contrast guarantees and the `--sidebar-*` retinting rules.

## Dark mode

Toggle the `.dark` class on `<html>` (or any ancestor of your app):

```ts
document.documentElement.classList.toggle("dark");
```

## Components

### Atomic primitives (v0.1.0)

shadcn-style primitives, composable via Tailwind utility classes:

- **Layout & overlay:** `Dialog`, `AlertDialog`, `Sheet`, `Tooltip`, `DropdownMenu`, `Sidebar`, `Tabs`
- **Forms:** `Form`, `Input`, `Label`, `Select`, `Separator`, plus `react-hook-form` integration via `FormField`/`FormItem`/`FormControl`/`FormMessage`/`FormDescription`/`FormLabel`
- **Display:** `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Skeleton`, `Table`
- **Feedback:** `Toaster` (sonner)

Helper: `cn` (clsx + tailwind-merge) is exported for consumer-side class composition.

#### `<Button />`

Standard variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and sizes (`sm`, `default`, `lg`, `icon`, `icon-sm`, `icon-lg`), plus two interactive-state props:

- `loading?: boolean` — renders a spinner before the children, sets `aria-busy="true"`, `aria-disabled="true"`, `data-state="loading"`, and suppresses `onClick` (also calls `e.preventDefault()` to stop form submission for `type="submit"` buttons). Children stay mounted (no width jitter). The native `disabled` attribute is **not** set, so focus is preserved for screen readers.
- `pressed?: boolean` — controlled toggle state. Sets `aria-pressed` and `data-state="on" | "off"`. When `loading` is also true, `loading` wins visually (`data-state="loading"`).

```tsx
import { Button } from "@qyubit/sedjiwa-ui";

<Button loading>Saving…</Button>
<Button pressed={isOn} onClick={() => setIsOn((v) => !v)}>Toggle</Button>
```

Limitation: when used with `asChild`, the spinner is **not** injected into the slotted child (Radix `Slot` only accepts a single child). The ARIA + data-state attributes still propagate. If you need a spinner inside a slotted element, render it yourself.

##### Interactive-state vocabulary

All stateful interactive components in this library expose state through a shared contract:

| Concept | DOM signal | ARIA |
|---|---|---|
| toggled on | `data-state="on"` | `aria-pressed="true"` (toggle) or `aria-selected="true"` (option) |
| busy / processing | `data-state="loading"` | `aria-busy="true"` |
| open / expanded | `data-state="open"` | `aria-expanded="true"` (Radix-driven) |
| disabled by app logic | `data-disabled="true"` | `aria-disabled="true"` |

This is a documentation contract, not a shared abstraction — Tabs, Dropdown, and Dialog already conform via Radix. Future components (Toggle, Switch) should adopt the same vocabulary.

### Composed primitives (v0.2.0)

Higher-level building blocks layered on the atomic primitives.

#### `<DataTable<T> />`

Typed, declarative table with column config. Composes `Table`, so consumers can drop down to lower-level primitives whenever they need full control.

```tsx
import { DataTable, type Column } from "@qyubit/sedjiwa-ui";

type Person = { id: string; name: string; role: string };

const columns: Column<Person>[] = [
  { key: "name", header: "Name", render: (p) => p.name },
  { key: "role", header: "Role", render: (p) => p.role, align: "right" },
];

<DataTable
  columns={columns}
  rows={people}
  getRowKey={(p) => p.id}
  emptyMessage="No people yet"
  onRowClick={(p) => navigate(`/people/${p.id}`)}
  renderAction={(p) => <Button size="sm">Edit</Button>}
/>;
```

Props: `columns`, `rows`, `getRowKey`, `renderAction?`, `onRowClick?`, `emptyMessage?`, `className?`.

#### `<Modal />`

Convenience wrapper over `Dialog` for the common "controlled open + title + body" shape. Inherits Radix's focus-trap, Escape-to-close, and ARIA semantics.

```tsx
import { Modal, Button } from "@qyubit/sedjiwa-ui";

const [open, setOpen] = useState(false);

<>
  <Button onClick={() => setOpen(true)}>Open</Button>
  <Modal
    open={open}
    onOpenChange={setOpen}
    title="Confirm action"
    description="This cannot be undone."
    size="md"
  >
    <p>Modal body content here.</p>
  </Modal>
</>;
```

Props: `open`, `onOpenChange`, `title`, `description?`, `size?` (`sm` | `md` | `lg` | `xl`), `preventBackdropClose?`, `children`.

For richer composition (multiple sections, custom close logic, no header), use `Dialog` and its sub-components directly.

## Development

```bash
bun install
bun run dev       # vite playground
bun run test      # vitest
bun run build     # tsup
bun run lint
```

## Publishing

Publish is gated by tag pushes (`v*`) in CI. See `.github/workflows/ci.yml`.
