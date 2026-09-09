import * as React from "react";
import { cn } from "../../lib/cn";
import {
  buttonGroupVariants,
  type ButtonGroupVariants,
} from "./button-group.variants";

export type ButtonGroupProps = React.ComponentProps<"div"> &
  ButtonGroupVariants & {
    /** Names the set. A group of icon buttons is a set of related actions, and
     *  without a name a screen reader reads three unexplained buttons in a row
     *  — each labelled, none of them placed. */
    "aria-label": string;
  };

/** Buttons welded into one control: a mail toolbar, a view switcher, a
 *  split action. It only supplies the frame and the seams; the children stay
 *  ordinary Buttons, so variant, size and disabled all behave as they do
 *  anywhere else. */
export function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: ButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      data-orientation={orientation}
      role="group"
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}
