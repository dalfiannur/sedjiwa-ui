import * as React from "react";
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
  };

export function ChatBubble({
  className,
  side = "incoming",
  author,
  avatar,
  time,
  actions,
  showAuthor = false,
  children,
  ...props
}: ChatBubbleProps) {
  return (
    <div
      data-slot="chat-bubble"
      data-side={side}
      className={cn(chatBubbleRowVariants({ side }), className)}
      {...props}
    >
      {/* The avatar is decoration beside a name that is already announced. */}
      {side === "incoming" && avatar != null && (
        <span data-slot="chat-bubble-avatar" aria-hidden="true" className="shrink-0">
          {avatar}
        </span>
      )}

      <div data-slot="chat-bubble-surface" className={chatBubbleSurfaceVariants({ side })}>
        <span
          data-slot="chat-bubble-author"
          className={showAuthor ? "text-xs font-semibold" : "sr-only"}
        >
          {author}
        </span>

        <div data-slot="chat-bubble-body" className="min-w-0 break-words">
          {children}
        </div>

        {(time != null || actions != null) && (
          <div data-slot="chat-bubble-meta" className={chatBubbleMetaVariants({ side })}>
            {time}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
