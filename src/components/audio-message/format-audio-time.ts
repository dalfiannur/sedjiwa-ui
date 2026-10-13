/** `m:ss`. Non-finite durations (a WebM recording before it has played) read
 *  as 0:00 rather than "NaN:NaN". */
export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
