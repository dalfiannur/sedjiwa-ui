import * as React from "react";
import { cn } from "../../lib/cn";
import {
  avatarGroupVariants,
  type AvatarGroupVariants,
} from "./avatar-group.variants";

export type AvatarGroupProps = React.ComponentProps<"div"> &
  AvatarGroupVariants & {
    /** How many faces to show before the rest collapse into a counter. */
    max?: number;
    /** Everyone represented, including those with no avatar rendered. Defaults
     *  to the number of children. Pass it when the list is paged or truncated
     *  server-side — the counter and the spoken name both come from here. */
    total?: number;
    /** The name for the whole stack. */
    formatLabel?: (total: number) => string;
    /** The counter chip's text. */
    formatOverflow?: (hidden: number) => string;
  };

/** A stack of faces with a counter for the rest.
 *
 *  Display only, and `role="img"` says so. Three portraits plus "+15" means
 *  "eighteen people" to someone looking at it and nothing at all to a screen
 *  reader, so the group carries one whole name and the faces are hidden
 *  beneath it. A list of avatars people can click is a different component —
 *  build that as a real list, not this. */
export function AvatarGroup({
  className,
  size,
  max = 3,
  total,
  formatLabel = (n) => `${n} orang`,
  formatOverflow = (n) => `+${n}`,
  children,
  ...props
}: AvatarGroupProps) {
  const faces = React.Children.toArray(children);
  const shown = faces.slice(0, Math.max(0, max));
  const count = total ?? faces.length;
  // Counted against what is on screen, not against the children: with `total`
  // given, the hidden remainder includes people who were never passed at all.
  const hidden = Math.max(0, count - shown.length);

  return (
    <div
      data-slot="avatar-group"
      role="img"
      aria-label={formatLabel(count)}
      className={cn(avatarGroupVariants({ size }), className)}
      {...props}
    >
      {/* Rendered bare, with no per-face wrapper. `role="img"` above already
          takes the whole subtree out of the accessibility tree, and a wrapper
          would become the direct child that `[&>*]` styles — a `contents` span
          generates no box, so the ring and the size would land on nothing. */}
      {shown}

      {hidden > 0 && (
        <span
          data-slot="avatar-group-overflow"
          aria-hidden="true"
          // --primary as text on --card is 4.66:1 — it passes, with nothing to
          // spare. Do not dim it.
          className="bg-card text-primary border-primary/30 flex items-center justify-center rounded-full border font-semibold tabular-nums"
        >
          {formatOverflow(hidden)}
        </span>
      )}
    </div>
  );
}
