import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { DataTable } from "../data-table";
import type { Column } from "../data-table";
import { CardListTable } from "../card-list-table";

export type ResponsiveTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (item: T) => string;
  renderAction?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
  emptyMessage?: ReactNode;
  /** Column key rendered as each mobile card's header (CardListTable `titleKey`). */
  cardTitleKey?: string;
  /** Compact spacing for the mobile cards. */
  dense?: boolean;
  className?: string;
};

/**
 * Renders a full `DataTable` on desktop (`md` and up) and stacks into
 * `CardListTable` cards on smaller screens — driven by a single set of
 * `Column<T>` / `rows` props.
 */
export function ResponsiveTable<T>({
  columns,
  rows,
  getRowKey,
  renderAction,
  onRowClick,
  emptyMessage,
  cardTitleKey,
  dense,
  className,
}: ResponsiveTableProps<T>) {
  return (
    <div data-slot="responsive-table" className={className}>
      <DataTable
        className="hidden md:block"
        columns={columns}
        rows={rows}
        getRowKey={getRowKey}
        renderAction={renderAction}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
      />
      <CardListTable
        className={cn("md:hidden")}
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
