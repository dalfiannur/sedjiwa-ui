// Every SmartTable row is its own grid, so tracks can't size to content (the
// rows would stop lining up). Instead the table measures how wide each header
// needs to be and folds that in here as an explicit floor, shared by all rows.

const DEFAULT_TRACK = "minmax(0, 1fr)";
const MINMAX = /^minmax\(\s*([^,]+?)\s*,\s*(.+?)\s*\)$/;
const FLEX = /^[\d.]+fr$/;
const CONTENT = /^(auto|min-content|max-content|fit-content\(.*\))$/;

/** A length usable inside `max()`; keywords and bare `0` aren't. */
const isLength = (value: string) => value !== "0" && !CONTENT.test(value);

/** The column's grid track, never narrower than `floor` px (0 = not measured). */
export function floorTrack(track: string | undefined, floor: number): string {
  const value = track?.trim() || DEFAULT_TRACK;
  if (!floor) return value;
  const px = `${floor}px`;
  const minmax = MINMAX.exec(value);
  if (minmax) {
    const [, min, max] = minmax;
    return `minmax(${isLength(min!) ? `max(${min}, ${px})` : px}, ${max})`;
  }
  if (FLEX.test(value)) return `minmax(${px}, ${value})`;
  if (CONTENT.test(value)) return value;
  return `max(${value}, ${px})`;
}

/** The narrowest the floored track can get, for the grid's overall min width. */
export function trackMinimum(track: string | undefined, floor: number): string {
  const value = track?.trim() || DEFAULT_TRACK;
  const px = `${floor}px`;
  const minmax = MINMAX.exec(value);
  const min = minmax ? minmax[1]! : FLEX.test(value) ? "0" : value;
  if (!isLength(min)) return px;
  return floor ? `max(${min}, ${px})` : min;
}

/** `minWidth`, raised so the floored columns still fit without overlapping. */
export function gridMinWidth(
  minWidth: string,
  minimums: string[],
  measured: boolean,
): string {
  if (!measured) return minWidth;
  return `max(${minWidth}, calc(${minimums.join(" + ")}))`;
}
