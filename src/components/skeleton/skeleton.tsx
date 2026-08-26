import * as React from "react";
import { cn } from "../../lib/cn";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // A skeleton stands in for content that is not there yet; there is
      // nothing here to announce, and without this the placeholder shapes sit
      // in the accessibility tree as generic nodes while loading. Pair it with
      // aria-busy on the region that is loading.
      aria-hidden="true"
      className={cn(
        "bg-accent animate-pulse rounded-md",
        // The pulse is decoration, so it goes when reduced motion is asked
        // for. It is Tailwind's own animation rather than a tw-animate-css
        // enter/exit one, so the custom-property rule in base.css does not
        // reach it — this has to be said here.
        "motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
