import {
  ArrowDown,
  ArrowUp,
  Check,
  EllipsisVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

export type SmartTableMenuLabels = {
  sortAsc: string;
  sortDesc: string;
  hideColumn: string;
  showAllColumns: string;
};

const triggerClass =
  "text-muted-foreground/60 hover:text-foreground hover:bg-muted focus-visible:ring-ring/50 data-[state=open]:bg-muted data-[state=open]:text-foreground -mr-1 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2";

export function SmartTableHeaderMenu({
  sortable,
  sortDir,
  onSort,
  hideable,
  canHide,
  onHide,
  anyHidden,
  onShowAll,
  labels,
}: {
  sortable: boolean;
  /** The active sort direction if this column is the one being sorted, else null. */
  sortDir: "asc" | "desc" | null;
  onSort: (dir: "asc" | "desc") => void;
  hideable: boolean;
  /** False when this is the last visible column (can't hide everything). */
  canHide: boolean;
  onHide: () => void;
  anyHidden: boolean;
  onShowAll: () => void;
  labels: SmartTableMenuLabels;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Column options" className={triggerClass}>
        <EllipsisVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortable && (
          <>
            <DropdownMenuItem onClick={() => onSort("asc")}>
              <ArrowUp />
              {labels.sortAsc}
              {sortDir === "asc" && <Check className="ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort("desc")}>
              <ArrowDown />
              {labels.sortDesc}
              {sortDir === "desc" && <Check className="ml-auto" />}
            </DropdownMenuItem>
          </>
        )}
        {sortable && (hideable || anyHidden) && <DropdownMenuSeparator />}
        {hideable && (
          <DropdownMenuItem disabled={!canHide} onClick={onHide}>
            <EyeOff />
            {labels.hideColumn}
          </DropdownMenuItem>
        )}
        {anyHidden && (
          <DropdownMenuItem onClick={onShowAll}>
            <Eye />
            {labels.showAllColumns}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
