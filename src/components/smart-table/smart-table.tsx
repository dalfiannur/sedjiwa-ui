import type { CSSProperties, ReactNode } from "react";
import { EllipsisVertical } from "lucide-react";
import { cn } from "../../lib/cn";
import { CardListTable } from "../card-list-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";

export type SmartColumn<T> = {
  key: string;
  header: ReactNode;
  render: (item: T) => ReactNode;
  align?: "left" | "right";
  /** Grid track for this column (e.g. `"1fr"`, `"minmax(0,1.5fr)"`, `"9rem"`). Defaults to `minmax(0,1fr)`. */
  width?: string;
  className?: string;
  /** Dropdown content for the column header's ⋮ menu. When set, the ⋮ becomes an interactive trigger. */
  headerMenu?: ReactNode;
};

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
  className?: string;
};

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
  className,
}: SmartTableProps<T>) {
  const template = [
    renderLeading ? "2.75rem" : null,
    ...columns.map((col) => col.width ?? "minmax(0, 1fr)"),
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
          {columns.map((col, i) => (
            <div
              key={col.key}
              role="columnheader"
              className={cn(
                "text-foreground/70 flex items-center gap-2 px-4 py-3.5 text-sm font-medium",
                i < columns.length - 1 && "border-border/60 border-r",
                col.align === "right" && "flex-row-reverse"
              )}
            >
              <span className="min-w-0 flex-1 truncate">{col.header}</span>
              {col.headerMenu ? (
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
              ) : (
                <EllipsisVertical
                  aria-hidden
                  className="text-muted-foreground/40 size-4 shrink-0"
                />
              )}
            </div>
          ))}
          {renderAction && <div className="py-3.5" />}
        </div>

        {/* Body */}
        <div role="rowgroup">
          {rows.length === 0 ? (
            <div className="text-muted-foreground border-border/70 border-t px-4 py-10 text-center text-sm">
              {emptyMessage}
            </div>
          ) : (
            rows.map((row) => (
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
                {columns.map((col) => (
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
        columns={columns}
        rows={rows}
        getRowKey={getRowKey}
        titleKey={cardTitleKey}
        renderAction={renderAction}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
        dense={dense}
      />
    </div>
  );
}
