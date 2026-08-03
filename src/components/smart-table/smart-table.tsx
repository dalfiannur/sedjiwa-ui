import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, EllipsisVertical } from "lucide-react";
import { cn } from "../../lib/cn";
import { CardListTable } from "../card-list-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  SmartTablePagination,
  type SmartTablePaginationProps,
} from "./smart-table-pagination";
import {
  SmartTableHeaderMenu,
  type SmartTableMenuLabels,
} from "./smart-table-header-menu";

export type SmartColumn<T> = {
  key: string;
  header: ReactNode;
  render: (item: T) => ReactNode;
  align?: "left" | "right";
  /** Grid track for this column (e.g. `"1fr"`, `"minmax(0,1.5fr)"`, `"9rem"`). Defaults to `minmax(0,1fr)`. */
  width?: string;
  className?: string;
  /**
   * Client-side sort: returns the value to sort by. Enables "Sort
   * ascending/descending" in the column's ⋮ menu. With server pagination this
   * only sorts the current page — prefer `sortField` + controlled `onSortChange`
   * for full-dataset sorting.
   */
  sortAccessor?: (item: T) => string | number | boolean | Date | null | undefined;
  /**
   * Server-side sort key emitted via `onSortChange`. When the table is
   * controlled (an `onSortChange` handler is set), a column is sortable iff it
   * has a `sortField`.
   */
  sortField?: string;
  /** Whether the column offers "Hide column" in its ⋮ menu. Defaults to true. */
  hideable?: boolean;
  /** Custom ⋮ menu content. Overrides the built-in sort/hide menu for this column. */
  headerMenu?: ReactNode;
};

export type SmartTableSort = { key: string; dir: "asc" | "desc" };
type SortState = SmartTableSort;

export type SmartTableProps<T> = {
  columns: SmartColumn<T>[];
  rows: T[];
  getRowKey: (item: T) => string;
  /** Leading indicator cell per row (e.g. a status check icon). Adds a narrow leading column. */
  renderLeading?: (item: T) => ReactNode;
  /** Header content for the leading column. */
  leadingHeader?: ReactNode;
  /** Trailing per-row action (e.g. a ⋮ row menu). Clicks here don't trigger `onRowClick`. */
  renderAction?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
  emptyMessage?: ReactNode;
  /** Minimum grid width before horizontal scroll kicks in. Defaults to `48rem`. */
  minWidth?: string;
  /**
   * Below `md`, stack into `CardListTable` cards instead of a horizontally
   * scrolling table. The table shows at `md` and up.
   */
  responsive?: boolean;
  /** Responsive card fallback: column key used as each card's header (`CardListTable` `titleKey`). */
  cardTitleKey?: string;
  /** Responsive card fallback: compact card spacing. */
  dense?: boolean;
  /** Server-side pagination. When set (and more than one page), a pager footer is shown. */
  pagination?: SmartTablePaginationProps;
  /**
   * Controlled (server-side) sort. Pass `onSortChange` to take control of
   * sorting: the table stops sorting client-side, reflects `sortState` in the
   * header, and calls `onSortChange` when a column's Sort item is clicked
   * (toggling the same direction off → `null`). Columns are sortable via their
   * `sortField`.
   */
  sortState?: SmartTableSort | null;
  onSortChange?: (sort: SmartTableSort | null) => void;
  /** Labels for the built-in column ⋮ menu (sort / hide). Defaults to English. */
  menuLabels?: Partial<SmartTableMenuLabels>;
  className?: string;
};

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1; // nulls sort last
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean")
    return a === b ? 0 : a ? 1 : -1;
  return String(a).localeCompare(String(b));
}

export function SmartTable<T>({
  columns,
  rows,
  getRowKey,
  renderLeading,
  leadingHeader,
  renderAction,
  onRowClick,
  emptyMessage = "No data",
  minWidth = "48rem",
  responsive,
  cardTitleKey,
  dense,
  pagination,
  sortState,
  onSortChange,
  menuLabels,
  className,
}: SmartTableProps<T>) {
  const controlled = !!onSortChange;
  const [internalSort, setInternalSort] = useState<SortState | null>(null);
  const sort = controlled ? (sortState ?? null) : internalSort;
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());

  const labels: SmartTableMenuLabels = {
    sortAsc: menuLabels?.sortAsc ?? "Sort ascending",
    sortDesc: menuLabels?.sortDesc ?? "Sort descending",
    hideColumn: menuLabels?.hideColumn ?? "Hide column",
    showAllColumns: menuLabels?.showAllColumns ?? "Show all columns",
  };

  const visibleColumns = columns.filter((col) => !hidden.has(col.key));
  const anyHidden = columns.some((col) => hidden.has(col.key));

  const sortedRows = useMemo(() => {
    // In controlled mode the server returns already-sorted rows.
    if (controlled || !sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortAccessor) return rows;
    const accessor = col.sortAccessor;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort(
      (a, b) => factor * compareValues(accessor(a), accessor(b))
    );
  }, [controlled, rows, sort, columns]);

  // The sort state key for a column: its server `sortField` when controlled,
  // else its client `key`.
  const columnSortKey = (col: SmartColumn<T>) =>
    controlled ? col.sortField : col.key;
  const columnSortable = (col: SmartColumn<T>) =>
    controlled ? !!col.sortField : !!col.sortAccessor;
  const columnActiveDir = (col: SmartColumn<T>): "asc" | "desc" | null => {
    const key = columnSortKey(col);
    return key && sort?.key === key ? sort.dir : null;
  };
  const sortColumn = (col: SmartColumn<T>, dir: "asc" | "desc") => {
    const key = columnSortKey(col);
    if (!key) return;
    const next: SortState | null =
      sort && sort.key === key && sort.dir === dir ? null : { key, dir };
    if (controlled) onSortChange!(next);
    else setInternalSort(next);
  };
  const hideColumn = (key: string) =>
    setHidden((prev) => new Set(prev).add(key));
  const showAllColumns = () => setHidden(new Set());

  const template = [
    renderLeading ? "2.75rem" : null,
    ...visibleColumns.map((col) => col.width ?? "minmax(0, 1fr)"),
    renderAction ? "3rem" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const gridStyle: CSSProperties = { gridTemplateColumns: template, minWidth };

  const table = (
    <div
      className={cn(
        "bg-card text-card-foreground w-full overflow-x-auto rounded-xl border shadow-sm",
        responsive && "hidden md:block"
      )}
    >
      <div role="table" className="w-full">
        {/* Header */}
        <div
          role="row"
          data-slot="smart-table-header"
          className="bg-muted/40 grid items-stretch"
          style={gridStyle}
        >
          {renderLeading && (
            <div className="text-muted-foreground flex items-center justify-center py-3.5">
              {leadingHeader}
            </div>
          )}
          {visibleColumns.map((col, i) => {
            const sortable = columnSortable(col);
            const hideable = col.hideable !== false;
            const activeDir = columnActiveDir(col);
            const hasMenu =
              col.headerMenu != null || sortable || hideable || anyHidden;
            return (
              <div
                key={col.key}
                role="columnheader"
                aria-sort={
                  activeDir
                    ? activeDir === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
                className={cn(
                  "text-foreground/70 flex items-center gap-2 px-4 py-3.5 text-sm font-medium",
                  i < visibleColumns.length - 1 && "border-border/60 border-r",
                  col.align === "right" && "flex-row-reverse"
                )}
              >
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate",
                    // flex-row-reverse only mirrors the *order* of the header
                    // parts; the label still sits in a flex-1 box and stays
                    // left-aligned inside it, so a right-aligned numeric column
                    // rendered its header hard left while every value under it
                    // sat hard right. DataTable already does this.
                    col.align === "right" && "text-right",
                  )}
                >
                  {col.header}
                </span>
                {activeDir &&
                  (activeDir === "asc" ? (
                    <ArrowUp className="text-muted-foreground size-3.5 shrink-0" />
                  ) : (
                    <ArrowDown className="text-muted-foreground size-3.5 shrink-0" />
                  ))}
                {col.headerMenu != null ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Column options"
                      className="text-muted-foreground/60 hover:text-foreground hover:bg-muted focus-visible:ring-ring/50 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2"
                    >
                      <EllipsisVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {col.headerMenu}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : hasMenu ? (
                  <SmartTableHeaderMenu
                    sortable={sortable}
                    sortDir={activeDir}
                    onSort={(dir) => sortColumn(col, dir)}
                    hideable={hideable}
                    canHide={visibleColumns.length > 1}
                    onHide={() => hideColumn(col.key)}
                    anyHidden={anyHidden}
                    onShowAll={showAllColumns}
                    labels={labels}
                  />
                ) : null}
              </div>
            );
          })}
          {renderAction && <div className="py-3.5" />}
        </div>

        {/* Body */}
        <div role="rowgroup">
          {sortedRows.length === 0 ? (
            <div className="text-muted-foreground border-border/70 border-t px-4 py-10 text-center text-sm">
              {emptyMessage}
            </div>
          ) : (
            sortedRows.map((row) => (
              <div
                key={getRowKey(row)}
                role="row"
                data-slot="smart-table-row"
                className={cn(
                  "border-border/70 hover:bg-muted/40 grid items-center border-t transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                style={gridStyle}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {renderLeading && (
                  <div
                    role="cell"
                    className="flex items-center justify-center py-4"
                  >
                    {renderLeading(row)}
                  </div>
                )}
                {visibleColumns.map((col) => (
                  <div
                    key={col.key}
                    role="cell"
                    className={cn(
                      "min-w-0 px-4 py-4 text-sm",
                      col.align === "right" && "text-right",
                      col.className
                    )}
                  >
                    {col.render(row)}
                  </div>
                ))}
                {renderAction && (
                  <div
                    role="cell"
                    className="flex items-center justify-center py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderAction(row)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {pagination && (
        <SmartTablePagination
          {...pagination}
          className="border-border/70 border-t px-4 py-3"
        />
      )}
    </div>
  );

  if (!responsive) {
    return (
      <div data-slot="smart-table" className={className}>
        {table}
      </div>
    );
  }

  return (
    <div data-slot="smart-table" className={className}>
      {table}
      <CardListTable
        className="md:hidden"
        columns={visibleColumns}
        rows={sortedRows}
        getRowKey={getRowKey}
        titleKey={cardTitleKey}
        renderAction={renderAction}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
        dense={dense}
      />
      {pagination && (
        <SmartTablePagination {...pagination} className="px-1 pt-1 md:hidden" />
      )}
    </div>
  );
}
