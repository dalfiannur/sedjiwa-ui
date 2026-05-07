# sedjiwa-ui v0.2.0 — DataTable + Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@qyubit/sedjiwa-ui@0.2.0` with two new composed primitives — `DataTable<T>` (typed, declarative table) and `Modal` (Dialog wrapper with sales-pipeline-shaped API). Both compose existing v0.1.0 primitives. No new peer deps.

**Architecture:** Each new primitive lives in its own folder under `src/components/<name>/` following the established pattern (component file + behavioural test + folder index). DataTable composes `Table` family; Modal composes `Dialog` family. React 19 ref-as-prop pattern; no `forwardRef`.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind CSS 4, vitest 3, @testing-library/react, @testing-library/user-event, jsdom.

**Spec:** `docs/superpowers/specs/2026-05-07-sedjiwa-ui-v0.2.0-design.md`

**Working directory:** `/home/qyubit/Workspace/qyubit/sedjiwa-portal/sedjiwa-ui`

---

## Pre-task setup

```bash
cd /home/qyubit/Workspace/qyubit/sedjiwa-portal/sedjiwa-ui
git checkout main
git pull origin main
git checkout -b feature/v0.2.0-composed
```

Confirm CI is green on `main` and `bun run lint && bun run typecheck && bun run test` all pass. v0.1.0 baseline is 79 tests passing.

---

## File Structure

Files created or modified by this plan:

```
sedjiwa-ui/
├── src/components/data-table/
│   ├── data-table.tsx         # NEW — composes <Table> family
│   ├── data-table.test.tsx    # NEW — 5 behavioural tests
│   └── index.ts               # NEW — re-exports DataTable + Column type
├── src/components/modal/
│   ├── modal.tsx              # NEW — wraps <Dialog>
│   ├── modal.test.tsx         # NEW — 6 behavioural tests
│   └── index.ts               # NEW — re-exports Modal + ModalProps type
├── src/index.ts               # MODIFIED — add DataTable + Modal exports
├── playground/src/playground.tsx  # MODIFIED — add showcase sections
├── README.md                  # MODIFIED — document new primitives
└── package.json               # MODIFIED — version 0.1.0 → 0.2.0
```

---

## Task 1: DataTable component (TDD)

**Files:**
- Create: `src/components/data-table/data-table.test.tsx`
- Create: `src/components/data-table/data-table.tsx`
- Create: `src/components/data-table/index.ts`

- [ ] **Step 1: Write the failing test**

Write to `src/components/data-table/data-table.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type Column } from "./data-table";

type Person = { id: string; name: string; role: string };

const PEOPLE: Person[] = [
  { id: "1", name: "Ada", role: "Engineer" },
  { id: "2", name: "Grace", role: "Designer" },
];

const COLUMNS: Column<Person>[] = [
  { key: "name", header: "Name", render: (p) => p.name },
  { key: "role", header: "Role", render: (p) => p.role, align: "right" },
];

describe("<DataTable />", () => {
  it("renders headers in column order with their labels", () => {
    render(
      <DataTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />
    );
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual(["Name", "Role"]);
  });

  it("renders body cells for each row using each column's render fn", () => {
    render(
      <DataTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />
    );
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });

  it("renders the empty message when rows is empty (default 'No data')", () => {
    render(
      <DataTable columns={COLUMNS} rows={[]} getRowKey={(p) => p.id} />
    );
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders a custom empty message when supplied", () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={[]}
        getRowKey={(p) => p.id}
        emptyMessage="Nobody here yet"
      />
    );
    expect(screen.getByText("Nobody here yet")).toBeInTheDocument();
  });

  it("calls onRowClick with the clicked row's data", async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        onRowClick={onRowClick}
      />
    );
    await user.click(screen.getByText("Ada"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(PEOPLE[0]);
  });

  it("renders the Actions column only when renderAction is supplied", () => {
    const { rerender } = render(
      <DataTable columns={COLUMNS} rows={PEOPLE} getRowKey={(p) => p.id} />
    );
    expect(screen.queryByRole("columnheader", { name: "Actions" })).not.toBeInTheDocument();

    rerender(
      <DataTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        renderAction={(p) => <button>Edit {p.name}</button>}
      />
    );
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Ada" })).toBeInTheDocument();
  });

  it("clicking inside an action cell does not fire onRowClick", async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        onRowClick={onRowClick}
        renderAction={(p) => <button>Edit {p.name}</button>}
      />
    );
    await user.click(screen.getByRole("button", { name: "Edit Ada" }));
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("forwards className to the outer wrapper", () => {
    const { container } = render(
      <DataTable
        columns={COLUMNS}
        rows={PEOPLE}
        getRowKey={(p) => p.id}
        className="custom-wrap"
      />
    );
    expect(container.querySelector(".custom-wrap")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test, expect FAIL**

Run: `bun run test src/components/data-table/data-table.test.tsx`
Expected: every test fails — module `./data-table` not found.

- [ ] **Step 3: Implement the component**

Write to `src/components/data-table/data-table.tsx`:
```tsx
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (item: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (item: T) => string;
  renderAction?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
  emptyMessage?: ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  renderAction,
  onRowClick,
  emptyMessage = "No data",
  className,
}: DataTableProps<T>) {
  const totalColumns = columns.length + (renderAction ? 1 : 0);

  return (
    <div data-slot="data-table" className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.align === "right" && "text-right",
                  col.className
                )}
              >
                {col.header}
              </TableHead>
            ))}
            {renderAction && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={totalColumns}
                className="text-muted-foreground text-center"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      col.align === "right" && "text-right",
                      col.className
                    )}
                  >
                    {col.render(row)}
                  </TableCell>
                ))}
                {renderAction && (
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderAction(row)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 4: Write the folder index**

Write to `src/components/data-table/index.ts`:
```typescript
export { DataTable } from "./data-table";
export type { Column, DataTableProps } from "./data-table";
```

- [ ] **Step 5: Run tests, expect 8 PASS**

Run: `bun run test src/components/data-table/data-table.test.tsx`
Expected: 8 tests passing.

- [ ] **Step 6: Run full pipeline**

Run: `bun run lint && bun run typecheck`
Expected: both exit 0 (any pre-existing warnings still allowed).

- [ ] **Step 7: Commit**

```bash
git add src/components/data-table/
git commit -m "feat(data-table): typed declarative table primitive"
```

---

## Task 2: Modal component (TDD)

**Files:**
- Create: `src/components/modal/modal.test.tsx`
- Create: `src/components/modal/modal.tsx`
- Create: `src/components/modal/index.ts`

- [ ] **Step 1: Write the failing test**

Write to `src/components/modal/modal.test.tsx`:
```tsx
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./modal";

function ControlledModal({
  defaultOpen = true,
  preventBackdropClose,
  size,
  description,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  preventBackdropClose?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  description?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
      title="Confirm action"
      description={description}
      size={size}
      preventBackdropClose={preventBackdropClose}
    >
      <p>Modal body</p>
    </Modal>
  );
}

describe("<Modal />", () => {
  it("renders nothing when open=false", () => {
    render(<ControlledModal defaultOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title, description, and body when open=true", () => {
    render(<ControlledModal description="Are you sure?" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Confirm action");
    expect(dialog).toHaveTextContent("Are you sure?");
    expect(dialog).toHaveTextContent("Modal body");
  });

  it("omits the description block when description prop is not supplied", () => {
    render(<ControlledModal />);
    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("calls onOpenChange(false) when the user presses Escape", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<ControlledModal onOpenChange={onOpenChange} />);
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Escape still closes when preventBackdropClose=true", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ControlledModal preventBackdropClose onOpenChange={onOpenChange} />
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("applies the size class to the dialog content (sm)", () => {
    render(<ControlledModal size="sm" />);
    expect(screen.getByRole("dialog")).toHaveClass("max-w-sm");
  });

  it("applies the size class to the dialog content (xl)", () => {
    render(<ControlledModal size="xl" />);
    expect(screen.getByRole("dialog")).toHaveClass("max-w-4xl");
  });

  it("defaults to the md size when size prop is omitted", () => {
    render(<ControlledModal />);
    expect(screen.getByRole("dialog")).toHaveClass("max-w-md");
  });
});
```

- [ ] **Step 2: Run the test, expect FAIL**

Run: `bun run test src/components/modal/modal.test.tsx`
Expected: every test fails — module `./modal` not found.

- [ ] **Step 3: Implement the component**

Write to `src/components/modal/modal.tsx`:
```tsx
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../dialog";

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  preventBackdropClose?: boolean;
  children: ReactNode;
};

const SIZE_CLASS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  preventBackdropClose = false,
  children,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="modal-content"
        className={cn(SIZE_CLASS[size])}
        onPointerDownOutside={
          preventBackdropClose ? (e) => e.preventDefault() : undefined
        }
        onInteractOutside={
          preventBackdropClose ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Write the folder index**

Write to `src/components/modal/index.ts`:
```typescript
export { Modal } from "./modal";
export type { ModalProps } from "./modal";
```

- [ ] **Step 5: Run tests, expect 8 PASS**

Run: `bun run test src/components/modal/modal.test.tsx`
Expected: 8 tests passing.

> **If a test fails on the size class assertion** (e.g., the class is on a parent rather than the dialog itself): the `cn()` call in `Modal` puts the size class on `DialogContent`, which is what `screen.getByRole("dialog")` resolves to. If Radix's role placement has shifted, fall back to asserting via `screen.getByRole("dialog").parentElement` — but inspect first; do NOT just paper over the change.

- [ ] **Step 6: Run full pipeline**

Run: `bun run lint && bun run typecheck`
Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/modal/
git commit -m "feat(modal): Dialog wrapper with sales-pipeline-style API"
```

---

## Task 3: Wire DataTable + Modal into the public barrel

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add the new exports**

Open `src/index.ts`. Find the line that exports `Tooltip`:
```typescript
export {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "./components/tooltip";
```

Insert these two export blocks immediately AFTER the Tooltip block and BEFORE the existing `cn` export:

```typescript
export { DataTable } from "./components/data-table";
export type { Column, DataTableProps } from "./components/data-table";

export { Modal } from "./components/modal";
export type { ModalProps } from "./components/modal";
```

The final lines of `src/index.ts` should now read:
```typescript
export {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "./components/tooltip";

export { DataTable } from "./components/data-table";
export type { Column, DataTableProps } from "./components/data-table";

export { Modal } from "./components/modal";
export type { ModalProps } from "./components/modal";

export { cn, type ClassValue } from "./lib/cn";
```

- [ ] **Step 2: Verify build emits the new exports**

Run: `bun run build`
Then: `grep -E "DataTable|Modal" dist/index.d.ts | head -10`
Expected: declarations mentioning `DataTable`, `DataTableProps`, `Column`, `Modal`, `ModalProps`.

- [ ] **Step 3: Run the full pipeline**

Run: `bun run lint && bun run typecheck && bun run test`
Expected: all green. Total tests: 79 (v0.1.0 baseline) + 8 (DataTable) + 8 (Modal) = 95 passing.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: export DataTable and Modal from public barrel"
```

---

## Task 4: Showcase DataTable + Modal in the playground

**Files:**
- Modify: `playground/src/playground.tsx`

- [ ] **Step 1: Add new imports and showcase tab**

Open `playground/src/playground.tsx`. Update the import block at the top to add the new components and a couple of helpers.

Find the existing import block and replace it with:

```tsx
import { useState } from "react";
import {
  Button, Badge, Avatar, AvatarFallback, AvatarImage,
  Input, Label, Separator, Skeleton,
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator,
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader,
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Toaster,
  DataTable, type Column,
  Modal,
} from "@qyubit/sedjiwa-ui";
```

- [ ] **Step 2: Add a new TabsTrigger for "Composed"**

Find the `<TabsList>` block. Replace it with:

```tsx
        <TabsList>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="composed">Composed</TabsTrigger>
          <TabsTrigger value="misc">Misc</TabsTrigger>
        </TabsList>
```

- [ ] **Step 3: Add the "composed" TabsContent block**

Find the closing `</TabsContent>` for the `value="data"` tab. Immediately AFTER it, BEFORE the `value="misc"` TabsContent, insert this block:

```tsx
        <TabsContent value="composed" className="space-y-8 pt-4">
          <ComposedShowcase />
        </TabsContent>
```

- [ ] **Step 4: Add the `ComposedShowcase` component**

At the bottom of `playground/src/playground.tsx`, AFTER the closing brace of `Playground`, add:

```tsx
type DemoPerson = { id: string; name: string; role: string; salary: number };

const PEOPLE: DemoPerson[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineer", salary: 95000 },
  { id: "2", name: "Grace Hopper", role: "Designer", salary: 88000 },
  { id: "3", name: "Margaret Hamilton", role: "Director", salary: 120000 },
];

const PERSON_COLUMNS: Column<DemoPerson>[] = [
  { key: "name", header: "Name", render: (p) => p.name },
  { key: "role", header: "Role", render: (p) => p.role },
  {
    key: "salary",
    header: "Salary",
    align: "right",
    render: (p) => `$${p.salary.toLocaleString("en-US")}`,
  },
];

function ComposedShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [size, setSize] = useState<"sm" | "md" | "lg" | "xl">("md");

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-lg font-medium">DataTable</h2>
        <DataTable
          columns={PERSON_COLUMNS}
          rows={PEOPLE}
          getRowKey={(p) => p.id}
          renderAction={(p) => (
            <Button size="sm" variant="ghost">
              Edit {p.name.split(" ")[0]}
            </Button>
          )}
          onRowClick={(p) => {
            // eslint-disable-next-line no-console
            console.log("row clicked:", p.name);
          }}
        />

        <h3 className="text-sm font-medium pt-4">Empty state</h3>
        <DataTable
          columns={PERSON_COLUMNS}
          rows={[]}
          getRowKey={(p) => p.id}
          emptyMessage="No people found"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Modal</h2>
        <div className="flex flex-wrap items-center gap-3">
          {(["sm", "md", "lg", "xl"] as const).map((s) => (
            <Button
              key={s}
              variant="outline"
              onClick={() => {
                setSize(s);
                setModalOpen(true);
              }}
            >
              Open {s}
            </Button>
          ))}
        </div>
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={`Modal — size ${size}`}
          description="A composed convenience layer over Dialog. Press Escape or click the backdrop to close."
          size={size}
        >
          <p className="text-sm text-muted-foreground">
            Modal body. Replace with whatever the consumer needs — forms,
            confirmations, embedded flows.
          </p>
        </Modal>
      </section>
    </>
  );
}
```

- [ ] **Step 5: Verify dev server starts cleanly**

Run:
```bash
timeout 5 bun run dev 2>&1 | tee /tmp/vite.log
```
Inspect `/tmp/vite.log`. Confirm a `Local: http://localhost:...` line appears with NO errors. The `timeout 5` will kill the server after 5 seconds — that's expected.

- [ ] **Step 6: Commit**

```bash
git add playground/src/playground.tsx
git commit -m "chore(playground): showcase DataTable and Modal"
```

---

## Task 5: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the Status section**

In `README.md`, replace:

```markdown
## Status

`v0.1.0` ships 19 primitives — the full set duplicated across sedjiwa-portal apps, ready to consume.
```

with:

```markdown
## Status

`v0.2.0` ships 19 atomic primitives plus 2 composed primitives (DataTable, Modal) extracted from observed consumer patterns.
```

- [ ] **Step 2: Replace the Components section**

Find the `## Components` section. Replace the ENTIRE section (from `## Components` through to the start of the next `## Development` heading) with:

```markdown
## Components

### Atomic primitives (v0.1.0)

shadcn-style primitives, composable via Tailwind utility classes:

- **Layout & overlay:** `Dialog`, `AlertDialog`, `Sheet`, `Tooltip`, `DropdownMenu`, `Sidebar`, `Tabs`
- **Forms:** `Form`, `Input`, `Label`, `Select`, `Separator`, plus `react-hook-form` integration via `FormField`/`FormItem`/`FormControl`/`FormMessage`/`FormDescription`/`FormLabel`
- **Display:** `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Skeleton`, `Table`
- **Feedback:** `Toaster` (sonner)

Helper: `cn` (clsx + tailwind-merge) is exported for consumer-side class composition.

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

```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document DataTable and Modal in README"
```

---

## Task 6: Bump version to v0.2.0

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Bump version**

In `package.json`, change:
```json
  "version": "0.1.0",
```
to:
```json
  "version": "0.2.0",
```

- [ ] **Step 2: Verify entire pipeline locally**

Run:
```bash
bun run lint && bun run typecheck && bun run test && bun run build
```
All green. Tests should report 95 passing across 22 files.

- [ ] **Step 3: Inspect publishable artifact**

Run:
```bash
bun pm pack
tar -tzf qyubit-sedjiwa-ui-0.2.0.tgz | sort
```
Expected output (only):
```
package/README.md
package/dist/index.d.ts
package/dist/index.js
package/dist/index.js.map
package/dist/styles.css
package/package.json
```
Then clean up: `rm qyubit-sedjiwa-ui-0.2.0.tgz`.

- [ ] **Step 4: Commit version bump**

```bash
git add package.json
git commit -m "chore: bump to v0.2.0"
```

---

## Task 7: Push, merge, tag, publish

> **⚠️ Confirm with the user before running this task.** Pushing and tagging are remote side-effects.

**Files:** none — git + registry operations.

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feature/v0.2.0-composed
```

- [ ] **Step 2: Open a PR (or merge directly)**

Either:
- Use the Gitea/GitHub UI to open a PR, wait for CI to pass, merge.
- OR fast-forward locally if you prefer that workflow:
  ```bash
  git checkout main
  git pull origin main
  git merge --ff-only feature/v0.2.0-composed
  git push origin main
  ```

- [ ] **Step 3: Tag and push**

```bash
git checkout main
git pull origin main
git tag v0.2.0
git push origin v0.2.0
```

If your CI's `publish` job is gated on tag pushes (it is, per `.github/workflows/ci.yml`), publication runs automatically.

If publishing manually (mirroring the v0.1.0 flow), run:
```bash
bun run build
bun publish
```

- [ ] **Step 4: Verify the published package**

```bash
mkdir -p /tmp/sedjiwa-ui-0.2.0
cd /tmp/sedjiwa-ui-0.2.0
bun init -y
bun add @qyubit/sedjiwa-ui@0.2.0
ls node_modules/@qyubit/sedjiwa-ui/dist/
```
Expected: `dist/index.js`, `dist/index.d.ts`, `dist/styles.css`.

```bash
cd /home/qyubit/Workspace/qyubit/sedjiwa-portal/sedjiwa-ui
rm -rf /tmp/sedjiwa-ui-0.2.0
```

- [ ] **Step 5: Delete the local feature branch (optional)**

```bash
git branch -d feature/v0.2.0-composed
```

---

## Done

`@qyubit/sedjiwa-ui@0.2.0` published with two new composed primitives:
- `<DataTable<T> />` — typed declarative table layered on `Table`
- `<Modal />` — Dialog wrapper with sales-pipeline-style API plus Radix a11y wins

95 tests passing total (79 v0.1.0 baseline + 8 DataTable + 8 Modal). No new peer deps. Pipeline green.

**Next:** Sales-pipeline migration is now mostly mechanical — the import-path swap plus the `isOpen`→`open` / `onClose`→`onOpenChange` find-replace handles the bulk of it. Token-system migration (sales-pipeline's `--color-surface-*` palette → sedjiwa-ui's shadcn tokens) is the remaining piece, and is its own workstream not covered here.
