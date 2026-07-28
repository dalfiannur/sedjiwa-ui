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

  const titleColumn = titleKey
    ? columns.find((col) => col.key === titleKey)
    : undefined;
  const bodyColumns = titleColumn
    ? columns.filter((col) => col.key !== titleColumn.key)
    : columns;

  const pad = dense ? "px-4" : "px-6";

  return (
    <div
      data-slot="card-list-table"
      data-dense={dense ? "" : undefined}
      className={cn("flex flex-col", dense ? "gap-2" : "gap-3", className)}
    >
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
