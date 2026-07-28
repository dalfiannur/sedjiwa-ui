import { Fragment, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Card } from "../card";
import type { Column } from "../data-table";

export type CardListTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (item: T) => string;
  titleKey?: string;
  renderAction?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
  emptyMessage?: ReactNode;
  dense?: boolean;
  /**
   * How each record's fields are laid out inside its card.
   * - `"row"` (default): one field per line, label beside value.
   * - `"column"`: each field is its own column (label above value), laid
   *   out side-by-side like a mini table for that record.
   */
  orientation?: "row" | "column";
  /**
   * Column orientation only: render the column labels once as a shared
   * header row above the cards (table-style), with each card's values
   * aligned into the same columns below. When enabled, `titleKey` is
   * ignored — every column becomes an aligned table column.
   */
  showHeader?: boolean;
  className?: string;
};

export function CardListTable<T>({
  columns,
  rows,
  getRowKey,
  titleKey,
  renderAction,
  onRowClick,
  emptyMessage = "No data",
  dense,
  orientation = "row",
  showHeader,
  className,
}: CardListTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div
        data-slot="card-list-table"
        className={cn(
          "text-muted-foreground text-center text-sm",
          dense ? "py-4" : "py-6",
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  const pad = dense ? "px-4" : "px-6";
  const isColumn = orientation === "column";
  const tableMode = isColumn && showHeader;

  // In table mode every column is an aligned grid column (titleKey ignored).
  const titleColumn =
    !tableMode && titleKey
      ? columns.find((col) => col.key === titleKey)
      : undefined;
  const bodyColumns = titleColumn
    ? columns.filter((col) => col.key !== titleColumn.key)
    : columns;

  const gridStyle = tableMode
    ? { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }
    : undefined;

  return (
    <div
      data-slot="card-list-table"
      data-dense={dense ? "" : undefined}
      data-orientation={orientation}
      className={cn("flex flex-col", dense ? "gap-2" : "gap-3", className)}
    >
      {tableMode && (
        <div
          data-slot="card-list-table-header"
          className={cn(
            "text-muted-foreground grid gap-x-4 border border-transparent text-xs font-medium",
            pad
          )}
          style={gridStyle}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn("min-w-0", col.align === "right" && "text-right")}
            >
              {col.header}
            </div>
          ))}
        </div>
      )}

      {rows.map((row) => (
        <Card
          key={getRowKey(row)}
          data-slot="card-list-table-item"
          className={cn(
            dense ? "gap-2 py-3" : "gap-4 py-4",
            onRowClick && "cursor-pointer"
          )}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
        >
          {titleColumn && (
            <div className={cn("text-card-foreground font-medium", pad)}>
              {titleColumn.render(row)}
            </div>
          )}

          {tableMode ? (
            <div
              className={cn("grid items-center gap-x-4 text-sm", pad)}
              style={gridStyle}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className={cn(
                    "min-w-0",
                    col.align === "right" && "text-right",
                    col.className
                  )}
                >
                  {col.render(row)}
                </div>
              ))}
            </div>
          ) : isColumn ? (
            <dl
              className={cn(
                "flex flex-wrap text-sm",
                dense ? "gap-x-4 gap-y-2" : "gap-x-6 gap-y-3",
                pad
              )}
            >
              {bodyColumns.map((col) => (
                <div
                  key={col.key}
                  className={cn(
                    "flex min-w-0 flex-col gap-0.5",
                    col.align === "right" && "items-end text-right"
                  )}
                >
                  <dt className="text-muted-foreground text-xs">{col.header}</dt>
                  <dd className={col.className}>{col.render(row)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <dl
              className={cn(
                "grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-4 text-sm",
                dense ? "gap-y-1" : "gap-y-2",
                pad
              )}
            >
              {bodyColumns.map((col) => (
                <Fragment key={col.key}>
                  <dt className="text-muted-foreground">{col.header}</dt>
                  <dd
                    className={cn(
                      col.align === "right" && "text-right",
                      col.className
                    )}
                  >
                    {col.render(row)}
                  </dd>
                </Fragment>
              ))}
            </dl>
          )}

          {renderAction && (
            <div className={pad} onClick={(e) => e.stopPropagation()}>
              {renderAction(row)}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
