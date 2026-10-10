/** Formats a count for an 18px badge: anything past 99 is "99+". Shared by
 *  `NavRail` and `BottomNav`. */
export function formatNavCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}
