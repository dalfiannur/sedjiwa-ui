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
  className,
}: CardListTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div
        data-slot="card-list-table"
        className={cn(
          "text-muted-foreground py-6 text-center text-sm",
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

  return (
    <div
      data-slot="card-list-table"
      className={cn("flex flex-col gap-3", className)}
    >
      {rows.map((row) => (
        <Card
          key={getRowKey(row)}
          data-slot="card-list-table-item"
          className={cn("gap-4 py-4", onRowClick && "cursor-pointer")}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
        >
          {titleColumn && (
            <div className="text-card-foreground px-6 font-medium">
              {titleColumn.render(row)}
            </div>
          )}
          <dl className="grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-4 gap-y-2 px-6 text-sm">
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
            <div className="px-6" onClick={(e) => e.stopPropagation()}>
              {renderAction(row)}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
