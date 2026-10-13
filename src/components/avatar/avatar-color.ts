/** Fallback tints for `AvatarFallback colorKey`.
 *
 *  Drawn from the label palette, whose six fill/text pairs are already gated
 *  at 4.5:1 in every theme — an arbitrary hue derived from a name could not
 *  be. Written out in full rather than assembled from the name, because
 *  Tailwind only generates classes it can find spelled out in the source. */
const AVATAR_COLORS = [
  "bg-label-blue text-label-blue-text",
  "bg-label-amber text-label-amber-text",
  "bg-label-violet text-label-violet-text",
  "bg-label-teal text-label-teal-text",
  "bg-label-rose text-label-rose-text",
  "bg-label-lime text-label-lime-text",
] as const;

/** Stable, non-cryptographic string hash: the same key always lands on the
 *  same colour, so a contact keeps its colour across every list and header. */
export function avatarColorIndex(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % AVATAR_COLORS.length;
}

export function avatarColorClass(key: string): string {
  return AVATAR_COLORS[avatarColorIndex(key)] ?? AVATAR_COLORS[0];
}
