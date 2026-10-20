export { SmartTable } from "./smart-table";
export type {
  SmartTableProps,
  SmartColumn,
  SmartTableSort,
} from "./smart-table";
export type { SmartTableMenuLabels } from "./smart-table-header-menu";
export { SmartTableColumnsMenu } from "./smart-table-columns-menu";
export type {
  SmartTableColumnsMenuProps,
  SmartTableColumnsMenuLabels,
} from "./smart-table-columns-menu";
export { useSmartTableColumns } from "./use-smart-table-columns";
export type { UseSmartTableColumnsOptions } from "./use-smart-table-columns";
export type { SmartTableColumnState } from "./column-state";

// Also exported standalone. The accessibility here — nav aria-label,
// aria-current, labelled prev/next, aria-hidden ellipsis, a polite live region
// — is the part that is easy to get wrong, and keeping it internal pushed apps
// that need pagination outside a table into rebuilding it worse.
export {
  SmartTablePagination,
  SmartTablePagination as Pagination,
} from "./smart-table-pagination";
export type {
  SmartTablePaginationProps,
  SmartTablePaginationProps as PaginationProps,
  SmartTablePaginationInfo,
  SmartTablePaginationInfo as PaginationInfo,
} from "./smart-table-pagination";
