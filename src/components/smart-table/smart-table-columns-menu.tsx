import { type ReactNode, useId } from "react";
import { ChevronDown, ChevronUp, Columns3, RotateCcw } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import {
  moveColumn,
  setColumnVisible,
  type SmartTableColumnState,
} from "./column-state";

export type SmartTableColumnsMenuLabels = {
  trigger: string;
  moveUp: string;
  moveDown: string;
  reset: string;
};

export type SmartTableColumnsMenuProps = {
  /** The table's columns (a `SmartColumn[]` fits as-is). */
  columns: readonly {
    key: string;
    header: ReactNode;
    hideable?: boolean;
    reorderable?: boolean;
  }[];
  columnState: SmartTableColumnState;
  onColumnStateChange: (state: SmartTableColumnState) => void;
  /** Shows a Reset button when set (e.g. `useSmartTableColumns().reset`). */
  onReset?: () => void;
  labels?: Partial<SmartTableColumnsMenuLabels>;
  align?: "start" | "center" | "end";
  className?: string;
};

/**
 * A "Columns" button whose popover lists every column of a controlled
 * `SmartTable`: a checkbox to show/hide it and up/down buttons to reorder.
 * Place it wherever the page's toolbar is; it shares state with the table
 * through `columnState` / `onColumnStateChange`.
 *
 * A popover rather than a dropdown menu: each row holds three controls, and a
 * menu's roving focus only gives one per row.
 */
export function SmartTableColumnsMenu({
  columns,
  columnState,
  onColumnStateChange,
  onReset,
  labels: labelsProp,
  align = "end",
  className,
}: SmartTableColumnsMenuProps) {
  const id = useId();
  const labels: SmartTableColumnsMenuLabels = {
    trigger: labelsProp?.trigger ?? "Columns",
    moveUp: labelsProp?.moveUp ?? "Move up",
    moveDown: labelsProp?.moveDown ?? "Move down",
    reset: labelsProp?.reset ?? "Reset",
  };
  const byKey = new Map(columns.map((col) => [col.key, col]));
  const ordered = columnState.order.filter((key) => byKey.has(key));
  const visible = ordered.filter((key) => !columnState.hidden.includes(key));
  const update = (next: SmartTableColumnState) => {
    if (next !== columnState) onColumnStateChange(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-slot="smart-table-columns-trigger"
          className={className}
        >
          <Columns3 />
          {labels.trigger}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-64 p-2">
        <ul data-slot="smart-table-columns-list" className="flex flex-col">
          {ordered.map((key) => {
            const col = byKey.get(key)!;
            const shown = !columnState.hidden.includes(key);
            const name = typeof col.header === "string" ? col.header : key;
            // Moves step among visible columns (see moveColumn), so a hidden
            // column has no position to step from.
            const pos = visible.indexOf(key);
            const reorderable = col.reorderable !== false && shown;
            const checkboxId = `${id}-${key}`;
            return (
              <li
                key={key}
                data-slot="smart-table-columns-item"
                data-state={shown ? "visible" : "hidden"}
                className="hover:bg-muted/60 flex items-center gap-2 rounded-md px-2 py-1"
              >
                <Checkbox
                  id={checkboxId}
                  checked={shown}
                  disabled={
                    col.hideable === false ||
                    (shown && visible.length <= 1)
                  }
                  onCheckedChange={(checked) =>
                    update(setColumnVisible(columnState, key, checked === true))
                  }
                />
                <label
                  htmlFor={checkboxId}
                  className={cn(
                    "min-w-0 flex-1 truncate text-sm",
                    !shown && "text-muted-foreground",
                  )}
                >
                  {col.header}
                </label>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  aria-label={`${labels.moveUp}: ${name}`}
                  disabled={!reorderable || pos <= 0}
                  onClick={() => update(moveColumn(columnState, key, -1))}
                >
                  <ChevronUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  aria-label={`${labels.moveDown}: ${name}`}
                  disabled={!reorderable || pos >= visible.length - 1}
                  onClick={() => update(moveColumn(columnState, key, 1))}
                >
                  <ChevronDown />
                </Button>
              </li>
            );
          })}
        </ul>
        {onReset && (
          <div className="border-border/70 mt-1 border-t pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={onReset}
            >
              <RotateCcw />
              {labels.reset}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
