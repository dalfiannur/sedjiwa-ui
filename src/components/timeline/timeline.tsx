import * as React from "react";
import { cn } from "../../lib/cn";
import {
  timelineConnectorVariants,
  timelineContentVariants,
  timelineDotVariants,
  timelineItemVariants,
  timelineVariants,
  type TimelineVariants,
} from "./timeline.variants";

export type TimelineStatus = "default" | "success" | "warning" | "error";

type TimelineContextValue = {
  size: NonNullable<TimelineVariants["size"]>;
};

const TimelineContext = React.createContext<TimelineContextValue>({
  size: "default",
});

export type TimelineRootProps = Omit<React.ComponentProps<"ol">, "size"> & {
  size?: TimelineVariants["size"];
};

function TimelineRoot({
  size = "default",
  className,
  children,
  ...props
}: TimelineRootProps) {
  const ctx = React.useMemo(() => ({ size: size ?? "default" }), [size]);
  return (
    <TimelineContext.Provider value={ctx}>
      <ol
        data-slot="timeline"
        data-size={size}
        className={cn(timelineVariants({ size }), className)}
        {...props}
      >
        {children}
      </ol>
    </TimelineContext.Provider>
  );
}
TimelineRoot.displayName = "Timeline.Root";

export type TimelineItemProps = React.ComponentProps<"li"> & {
  /** Suppresses the connector — set on the final event. */
  last?: boolean;
  /** Shifts the connector to line up with a wider, icon-bearing dot. */
  hasIcon?: boolean;
};

function TimelineItem({
  last = false,
  hasIcon = false,
  className,
  children,
  ...props
}: TimelineItemProps) {
  const { size } = React.useContext(TimelineContext);
  return (
    <li
      data-slot="timeline-item"
      data-last={last ? "true" : undefined}
      className={cn(timelineItemVariants({ size, last }), className)}
      {...props}
    >
      {last ? null : (
        <span
          data-slot="timeline-connector"
          aria-hidden="true"
          className={cn(timelineConnectorVariants({ hasIcon }))}
        />
      )}
      {children}
    </li>
  );
}
TimelineItem.displayName = "Timeline.Item";

export type TimelineDotProps = React.ComponentProps<"span"> & {
  status?: TimelineStatus;
};

function TimelineDot({
  status = "default",
  className,
  children,
  ...props
}: TimelineDotProps) {
  const hasIcon = children !== undefined && children !== null;
  return (
    <span
      data-slot="timeline-dot"
      data-status={status}
      data-has-icon={hasIcon ? "true" : undefined}
      // Decorative: the status is already spelled out in the title beside it.
      aria-hidden="true"
      className={cn(timelineDotVariants({ status, hasIcon }), className)}
      {...props}
    >
      {children}
    </span>
  );
}
TimelineDot.displayName = "Timeline.Dot";

export type TimelineContentProps = React.ComponentProps<"div"> & {
  hasIcon?: boolean;
};

function TimelineContent({
  hasIcon = false,
  className,
  ...props
}: TimelineContentProps) {
  return (
    <div
      data-slot="timeline-content"
      className={cn(timelineContentVariants({ hasIcon }), className)}
      {...props}
    />
  );
}
TimelineContent.displayName = "Timeline.Content";

export type TimelineEvent = {
  title: React.ReactNode;
  description?: React.ReactNode;
  timestamp?: React.ReactNode;
  status?: TimelineStatus;
  /** Replaces the dot. Decorative — the title still has to say what happened. */
  icon?: React.ReactNode;
  key?: string;
};

export type TimelineProps = TimelineRootProps & {
  items: TimelineEvent[];
};

/**
 * An activity trail — what happened to this record, in order.
 *
 * `status` colours the dot and nothing else. A row whose meaning lives only in
 * the colour of its marker is unreadable to a third of the reasons people miss
 * colour, so the title has to carry it: write "Ditolak", not a red dot beside
 * "Diproses".
 */
function Timeline({ items, ...rootProps }: TimelineProps) {
  if (items.length === 0) return null;

  return (
    <TimelineRoot {...rootProps}>
      {items.map((event, index) => {
        const hasIcon = event.icon !== undefined && event.icon !== null;
        return (
          <TimelineItem
            key={event.key ?? index}
            last={index === items.length - 1}
            hasIcon={hasIcon}
          >
            <TimelineDot status={event.status ?? "default"}>
              {event.icon}
            </TimelineDot>
            <TimelineContent hasIcon={hasIcon}>
              <div
                data-slot="timeline-title"
                className="text-foreground font-medium"
              >
                {event.title}
              </div>
              {event.description !== undefined ? (
                <div
                  data-slot="timeline-description"
                  className="text-muted-foreground mt-0.5"
                >
                  {event.description}
                </div>
              ) : null}
              {event.timestamp !== undefined ? (
                <div
                  data-slot="timeline-timestamp"
                  className="text-muted-foreground mt-1 text-xs tabular-nums"
                >
                  {event.timestamp}
                </div>
              ) : null}
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </TimelineRoot>
  );
}
Timeline.displayName = "Timeline";

export {
  Timeline,
  TimelineRoot,
  TimelineItem,
  TimelineDot,
  TimelineContent,
};
