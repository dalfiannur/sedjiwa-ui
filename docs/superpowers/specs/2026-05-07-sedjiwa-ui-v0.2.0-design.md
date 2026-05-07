# sedjiwa-ui v0.2.0 — Composed Primitives Design Spec

**Status:** Approved 2026-05-07
**Owner:** uray@qyubit.io
**Predecessor:** v0.1.0 (19 atomic primitives, published 2026-05-07)

## Goals

Promote two composed patterns observed across consumer apps into first-class primitives in `@qyubit/sedjiwa-ui`:

- `DataTable<T>` — typed, declarative table with column config (modelled after sales-pipeline's `DataTable`).
- `Modal` — convenience wrapper over `Dialog` for the common "controlled open + title + body" shape (modelled after sales-pipeline's `Modal`).

Both compose v0.1.0's atomic primitives. They give consumers shorter callsites for common cases without removing the option to drop down to lower-level primitives when needed.

### Non-goals (v0.2.0)

- `IconButton` — already expressible as `<Button size="icon-sm" aria-label="…"><Icon /></Button>`. No new primitive needed.
- `CurrencyInput` — locale-coupled (Indonesian formatter); doesn't belong in a generic UI library. Stays app-local.
- Token/theme migration shims for sales-pipeline (different palette + variable names). That is consumer-side migration work, not library work.
- Sortable/paginated/virtualised DataTable. Out of scope; can be added in v0.3.0 once a real consumer asks.

## Scope

Two new components, layered on existing v0.1.0 primitives:

```
src/components/
├── data-table/
│   ├── data-table.tsx
│   ├── data-table.test.tsx
│   └── index.ts
└── modal/
    ├── modal.tsx
    ├── modal.test.tsx
    └── index.ts
```

Plus barrel + playground updates and a version bump (`0.1.0` → `0.2.0`).

No new peer dependencies — both compose existing v0.1.0 components and the already-installed Radix packages.

## Architecture

### DataTable

Composes the v0.1.0 `Table` primitive. The component is a thin orchestrator: it walks `columns` and `rows` and emits the corresponding `<TableHeader>`, `<TableRow>`, `<TableHead>`, `<TableCell>` elements. There is no new HTML directly — every element comes from the underlying `Table` component family.

This composition gives consumers:

- One source of truth for table styling (changes to `Table`'s look automatically apply).
- The option to drop to `Table` directly for advanced layouts (sticky headers, sub-tables, custom rows) without forking `DataTable`.

#### Public API

```typescript
import type { ReactNode } from "react";

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

export function DataTable<T>(props: DataTableProps<T>): JSX.Element;
```

#### Behaviour notes

- `align="right"` propagates `text-right` to both the column's `<TableHead>` and every row's `<TableCell>` for that column.
- `renderAction` adds a fixed-label "Actions" column on the right side. v0.2.0 does not localise the label; consumers needing custom labels add a column with `key: "actions"` instead.
- `onRowClick` toggles `cursor-pointer` on rows and listens on the row element. Action cells stop propagation so clicking an action button does not also fire `onRowClick`.
- `emptyMessage` (default "No data") renders inside a single `<TableRow>` spanning all columns when `rows.length === 0`.
- `className` is forwarded to the outermost wrapping `<div>` so consumers can adjust the container without forking.
- The generic `T` is preserved end-to-end so consumers get type-safety on `render(item)`, `getRowKey(item)`, etc.

### Modal

Wraps `Dialog` + `DialogContent` + `DialogHeader` + `DialogTitle` (+ optional `DialogDescription`). Inherits Radix's focus-trap, Escape-to-close, scroll-lock, and ARIA semantics for free.

#### Public API

```typescript
import type { ReactNode } from "react";

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  preventBackdropClose?: boolean;
  children: ReactNode;
};

export function Modal(props: ModalProps): JSX.Element;
```

#### Behaviour notes

- `open` / `onOpenChange` deliberately match Radix Dialog's prop names. Sales-pipeline's `Modal` uses `isOpen` / `onClose`; the rename is a one-time migration cost that aligns Modal with the rest of the library.
- `description` is rendered as `<DialogDescription>` when present (improves screen-reader announcement). When omitted, `<DialogDescription>` is not rendered.
- `size` maps:
  - `sm` → `max-w-sm`
  - `md` → `max-w-md` (default)
  - `lg` → `max-w-2xl`
  - `xl` → `max-w-4xl`
- `preventBackdropClose: true` sets `onPointerDownOutside={(e) => e.preventDefault()}` on `DialogContent`. The Escape key still closes (intentional — escape is the user's accessibility escape hatch and should not be blocked).
- The Modal exposes its own footer/body slots only via `children`. Consumers needing a structured footer (e.g., right-aligned buttons) compose them inside `children` directly.

## Public API surface

`src/index.ts` adds:

```typescript
export { DataTable } from "./components/data-table";
export type { Column, DataTableProps } from "./components/data-table";

export { Modal } from "./components/modal";
export type { ModalProps } from "./components/modal";
```

## Testing

Vitest + `@testing-library/react` + `@testing-library/user-event`, using the existing jsdom setup (matchMedia + ResizeObserver + pointer-event polyfills already in place from v0.1.0).

### DataTable tests

Fixture type:

```typescript
type Person = { id: string; name: string; role: string };
```

Behaviours covered (5):

1. Renders header cells in column order with their labels.
2. Renders body cells in row order, calling each column's `render` with the correct row.
3. `emptyMessage` appears when `rows` is empty; default is "No data".
4. `onRowClick` fires with the clicked row's data; cursor class is applied.
5. `renderAction` cell appears only when the prop is supplied; clicking inside it does not also fire `onRowClick`.

### Modal tests

Behaviours covered (6):

1. `open=false` renders no dialog (assert `queryByRole("dialog")` is null).
2. `open=true` renders dialog; `title` and `description` appear; uses `findByRole("dialog")` to disambiguate from any Radix-rendered duplicates.
3. Calling backdrop click invokes `onOpenChange(false)`.
4. With `preventBackdropClose=true`, backdrop click does NOT invoke `onOpenChange`.
5. Escape key closes the dialog regardless of `preventBackdropClose`.
6. Each `size` value applies the corresponding `max-w-*` class to dialog content.

## Migration path (informational, not part of v0.2.0)

When sales-pipeline migrates to consume `@qyubit/sedjiwa-ui`:

- `Modal` callsites need a one-time prop rename: `isOpen=` → `open=`, `onClose={() => setOpen(false)}` → `onOpenChange={setOpen}`. Find-replace handles this across all sales-pipeline callsites.
- `DataTable` API is identical to sales-pipeline's, plus two additive fields. No callsite changes needed beyond the import path.
- Token system migration (sales-pipeline's `--color-surface-*` / `--color-text-*` palette → sedjiwa-ui's `--background` / `--foreground` / etc.) is a separate workstream documented in a later spec, not v0.2.0.

## Risks & open questions

- **Generic-component DTS size.** TypeScript's generated declaration for a generic component can be verbose. Mitigation: tsup's existing `dts: true` handles this, and v0.1.0 already ships generic types via `react-hook-form`'s `FormField`. Re-evaluate only if `dist/index.d.ts` grows past ~30 KB.
- **`renderAction` label localisation gap.** Documented as a v0.2.0 limitation. Consumers needing localised action-column labels use a regular column with `key: "actions"` instead.
- **Modal escape-key always closes.** Some apps may want to suppress this (e.g., destructive forms). Out of scope for v0.2.0. If demanded, a `preventEscapeClose` prop is a backwards-compatible addition.

## Success criteria

- `@qyubit/sedjiwa-ui@0.2.0` published to the private registry.
- 11 new tests pass (5 DataTable + 6 Modal); all v0.1.0 tests still pass; pipeline (lint, typecheck, build) green.
- Playground gains tabs (or sections) demonstrating both new primitives end-to-end including dark mode.
- README documents both new components with copy-pasteable examples.
- No new peer dependencies introduced. tsup `external` array unchanged.
