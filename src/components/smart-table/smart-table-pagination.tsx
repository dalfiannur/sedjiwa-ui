import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

export type SmartTablePaginationInfo = {
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
};

export type SmartTablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Optional left-side summary (e.g. localized "Showing 1–10 of 57"). */
  renderSummary?: (info: SmartTablePaginationInfo) => ReactNode;
};

/** Compact page list with ellipses, e.g. `[1, "gap", 4, 5, 6, "gap", 20]`. */
function pageItems(current: number, count: number): Array<number | "gap"> {
  if (count <= 7) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  const items: Array<number | "gap"> = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(count - 1, current + 1);
  if (left > 2) items.push("gap");
  for (let i = left; i <= right; i++) items.push(i);
  if (right < count - 1) items.push("gap");
  items.push(count);
  return items;
}

const btn =
  "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:ring-ring/50 outline-none focus-visible:ring-2";

export function SmartTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  renderSummary,
  className,
}: SmartTablePaginationProps & { className?: string }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const items = pageItems(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      data-slot="smart-table-pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
    >
      {/* Live region: paging swaps the rows silently otherwise, so a screen
          reader user gets no confirmation that the page changed or what range
          they are now on. The kit asks for this to be announced politely.

          The app's own summary is what gets announced when it supplies one —
          it is already the localized sentence. The sr-only fallback keeps the
          announcement working when it does not, and is English to match the
          aria-labels this component already hardcodes. */}
      <div className="text-muted-foreground text-sm" aria-live="polite" aria-atomic="true">
        {renderSummary ? (
          renderSummary({ from, to, total, page, pageCount })
        ) : (
          <span className="sr-only">
            Showing {from}–{to} of {total}, page {page} of {pageCount}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          className={cn(btn, "text-muted-foreground hover:bg-muted hover:text-foreground")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </button>
        {items.map((item, i) =>
          item === "gap" ? (
            <span
              key={`gap-${i}`}
              className="text-muted-foreground px-1 text-sm"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                btn,
                item === page
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          aria-label="Next page"
          className={cn(btn, "text-muted-foreground hover:bg-muted hover:text-foreground")}
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
