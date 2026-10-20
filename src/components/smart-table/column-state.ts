/**
 * Which columns a SmartTable shows, and in what order. Both lists hold column
 * `key`s; `order` always lists every column, hidden ones included, so a column
 * that is shown again comes back where it was.
 */
export type SmartTableColumnState = {
  order: string[];
  hidden: string[];
};

function knownUnique(value: unknown, known: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const key of value) {
    if (typeof key === "string" && known.has(key) && !out.includes(key)) {
      out.push(key);
    }
  }
  return out;
}

/**
 * Reconciles a (possibly stale, possibly hand-edited) stored state with the
 * columns the table declares now. Unknown keys are dropped; a column declared
 * since the state was saved is slotted in after the column declared before it,
 * so adding a column to an app does not throw it to the far end of every
 * user's saved layout.
 */
export function normalizeColumnState(
  keys: readonly string[],
  state: Partial<SmartTableColumnState> | null | undefined,
): SmartTableColumnState {
  const known = new Set(keys);
  const order = knownUnique(state?.order, known);
  keys.forEach((key, i) => {
    if (order.includes(key)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const idx = order.indexOf(keys[j]!);
      if (idx !== -1) {
        at = idx + 1;
        break;
      }
    }
    order.splice(at, 0, key);
  });
  let hidden = knownUnique(state?.hidden, known);
  // Hiding everything leaves no header to bring a column back from.
  if (hidden.length >= keys.length) hidden = [];
  return { order, hidden };
}

/**
 * Moves `key` one place left (`-1`) or right (`1`) among the *visible*
 * columns, so a step never lands behind a hidden one and looks like a no-op.
 */
export function moveColumn(
  state: SmartTableColumnState,
  key: string,
  delta: -1 | 1,
): SmartTableColumnState {
  const visible = state.order.filter((k) => !state.hidden.includes(k));
  const from = visible.indexOf(key);
  const neighbour = visible[from + delta];
  if (from === -1 || neighbour === undefined) return state;
  const order = [...state.order];
  const a = order.indexOf(key);
  const b = order.indexOf(neighbour);
  order[a] = neighbour;
  order[b] = key;
  return { ...state, order };
}

export function setColumnVisible(
  state: SmartTableColumnState,
  key: string,
  visible: boolean,
): SmartTableColumnState {
  const isHidden = state.hidden.includes(key);
  if (visible) {
    return isHidden
      ? { ...state, hidden: state.hidden.filter((k) => k !== key) }
      : state;
  }
  if (isHidden || state.hidden.length + 1 >= state.order.length) return state;
  return { ...state, hidden: [...state.hidden, key] };
}
