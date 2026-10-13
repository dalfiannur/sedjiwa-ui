import * as React from "react";
import { Check, CheckCheck, CircleAlert, Clock } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  chatBubbleMetaVariants,
  chatBubbleRowVariants,
  chatBubbleSurfaceVariants,
  type ChatBubbleVariants,
} from "./chat-bubble.variants";

export type ChatBubbleListProps = React.ComponentProps<"div"> & {
  /** Names the conversation, e.g. "Percakapan dengan Minerva Barnett". */
  "aria-label": string;
};

/** The thread.
 *
 *  `role="log"` rather than a list: a conversation grows at the end, and a log
 *  is the role that tells assistive tech to announce what arrives without
 *  dragging the reader back to the top. */
export function ChatBubbleList({ className, ...props }: ChatBubbleListProps) {
  return (
    <div
      data-slot="chat-bubble-list"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

export type ChatBubbleProps = Omit<React.ComponentProps<"div">, "title"> &
  ChatBubbleVariants & {
    /** Who wrote it. Always announced; shown on screen only when
     *  `showAuthor` is set.
     *
     *  Required, and deliberately so. On screen the author is carried by
     *  colour and which side the bubble sits on — neither of which exists for
     *  a screen reader, which would otherwise hear an unattributed run of
     *  sentences and have no way to tell the two speakers apart. */
    author: string;
    avatar?: React.ReactNode;
    /** Pass it pre-formatted; a time's shape belongs to the caller's locale. */
    time?: React.ReactNode;
    /** Trailing slot inside the bubble, usually an overflow menu trigger. */
    actions?: React.ReactNode;
    showAuthor?: boolean;
    /** Class for the visible author line, e.g. a per-author colour in a group
     *  chat (`text-label-rose-text`). */
    authorClassName?: string;
    /** Delivery state of an outgoing message, drawn as ticks after the time.
     *  The state is also written out for assistive tech. `failed` turns the
     *  bubble itself into a failure surface. Ignored on incoming messages. */
    status?: ChatBubbleStatus;
    /** Override the announced wording of `status`. */
    statusLabel?: string;
    /** A follow-up in a run from the same author: the visible author line
     *  and the avatar are dropped (the avatar's space is kept, so bubbles
     *  stay aligned) and the corner tightens. The author is still announced. */
    continued?: boolean;
  };

export type ChatBubbleStatus = "pending" | "sent" | "delivered" | "read" | "failed";

const STATUS_LABEL: Record<ChatBubbleStatus, string> = {
  pending: "mengirim…",
  sent: "terkirim",
  delivered: "sampai",
  read: "dibaca",
  failed: "gagal",
};

const STATUS_ICON: Record<ChatBubbleStatus, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  pending: Clock,
  sent: Check,
  delivered: CheckCheck,
  read: CheckCheck,
  failed: CircleAlert,
};

export function ChatBubble({
  className,
  side = "incoming",
  author,
  avatar,
  time,
  actions,
  showAuthor = false,
  authorClassName,
  appearance,
  status,
  statusLabel,
  continued = false,
  children,
  ...props
}: ChatBubbleProps) {
  const statusShown = side === "outgoing" && status != null ? status : undefined;
  const failed = statusShown === "failed";
  const StatusIcon = statusShown ? STATUS_ICON[statusShown] : null;
  return (
    <div
      data-slot="chat-bubble"
      data-side={side}
      data-status={statusShown}
      data-continued={continued || undefined}
      className={cn(chatBubbleRowVariants({ side }), className)}
      {...props}
    >
      {/* The avatar is decoration beside a name that is already announced. */}
      {side === "incoming" && avatar != null && (
        <span
          data-slot="chat-bubble-avatar"
          aria-hidden="true"
          className={cn("shrink-0", continued && "invisible")}
        >
          {avatar}
        </span>
      )}

      <div
        data-slot="chat-bubble-surface"
        // Through cn: the compound variants replace the side's own fill and
        // corner, and only tailwind-merge knows the later class must win.
        className={cn(chatBubbleSurfaceVariants({ side, appearance, continued, failed }))}
      >
        <span
          data-slot="chat-bubble-author"
          className={showAuthor && !continued ? cn("text-xs font-semibold", authorClassName) : "sr-only"}
        >
          {author}
        </span>

        <div data-slot="chat-bubble-body" className="min-w-0 break-words">
          {children}
        </div>

        {(time != null || actions != null || StatusIcon != null) && (
          <div data-slot="chat-bubble-meta" className={cn(chatBubbleMetaVariants({ side, failed }))}>
            {time}
            {StatusIcon && statusShown && (
              <span data-slot="chat-bubble-status" className="inline-flex items-center">
                <StatusIcon
                  aria-hidden="true"
                  className="size-3.5"
                  strokeWidth={statusShown === "read" ? 2.8 : 2.2}
                />
                <span className="sr-only">{statusLabel ?? STATUS_LABEL[statusShown]}</span>
              </span>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
