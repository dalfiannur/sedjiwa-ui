import { useCallback, useMemo, useState } from "react";
import {
  normalizeColumnState,
  type SmartTableColumnState,
} from "./column-state";

export type UseSmartTableColumnsOptions = {
  /**
   * Remember the layout in localStorage under this key (namespaced, so plain
   * names like `"users"` are fine). Omit to keep it for the page's lifetime only.
   */
  storageKey?: string;
  /** Layout before the user changes anything, and what `reset` returns to. */
  defaultState?: Partial<SmartTableColumnState>;
};

const PREFIX = "sedjiwa-ui:smart-table:";

// Storage can be missing (SSR), blocked (private mode, sandboxed iframes) or
// full; a column layout is a convenience, so every failure just means "none".
function readStored(key: string | undefined): unknown {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStored(key: string | undefined, state: SmartTableColumnState | null) {
  if (!key) return;
  try {
    if (state) window.localStorage.setItem(PREFIX + key, JSON.stringify(state));
    else window.localStorage.removeItem(PREFIX + key);
  } catch {
    // see readStored
  }
}

/**
 * Column visibility + order for a controlled `SmartTable`, optionally
 * persisted. Pass the result's `columnState` / `setColumnState` to both
 * `SmartTable` and `SmartTableColumnsMenu` so they stay in step.
 */
export function useSmartTableColumns(
  columns: readonly { key: string }[],
  { storageKey, defaultState }: UseSmartTableColumnsOptions = {},
) {
  const [raw, setRaw] = useState<Partial<SmartTableColumnState> | null>(
    () =>
      (readStored(storageKey) as Partial<SmartTableColumnState> | null) ??
      defaultState ??
      null,
  );

  const signature = columns.map((c) => c.key).join("\u0000");
  const columnState = useMemo(
    () => normalizeColumnState(signature ? signature.split("\u0000") : [], raw),
    [signature, raw],
  );

  const setColumnState = useCallback(
    (next: SmartTableColumnState) => {
      setRaw(next);
      writeStored(storageKey, next);
    },
    [storageKey],
  );

  const reset = useCallback(() => {
    setRaw(defaultState ?? null);
    writeStored(storageKey, null);
  }, [storageKey, defaultState]);

  return { columnState, setColumnState, reset };
}
