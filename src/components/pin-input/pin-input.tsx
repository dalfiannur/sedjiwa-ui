import * as React from "react";
import { cn } from "../../lib/cn";
import {
  fieldSurfaceVariants,
  type FieldSurfaceVariants,
} from "../../lib/field-surface.variants";
import {
  pinInputBoxVariants,
  pinInputGroupVariants,
} from "./pin-input.variants";

const DEFAULT_LENGTH = 6;
const DEFAULT_BOX_LABEL = "Digit";

export type PinInputType = "numeric" | "alphanumeric";

export type PinInputProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue"
> & {
  /** How many boxes. Defaults to `6`. */
  length?: number;
  /** Controlled code. Shorter than `length` leaves the tail empty. */
  value?: string;
  /** Uncontrolled initial code. */
  defaultValue?: string;
  /** Fires on every edit with the code so far. */
  onValueChange?: (value: string) => void;
  /** Fires once every box holds a character. */
  onComplete?: (value: string) => void;
  /** What the boxes accept. Defaults to `"numeric"`. */
  type?: PinInputType;
  /** Uppercase letters as they are typed. Ignored in numeric mode. Defaults to `true`. */
  uppercase?: boolean;
  /** Render the boxes as password fields. */
  mask?: boolean;
  /**
   * Offer the SMS code to the first box. Leave it off for codes that do not
   * arrive by SMS — an authenticator code has nothing to autofill from.
   */
  oneTimeCode?: boolean;
  /**
   * Base for each box's accessible name; the index is appended, so the boxes
   * announce as "Digit 1", "Digit 2" and so on. A box with no name of its own
   * is announced as a bare "edit text", which tells the user nothing about
   * where in the code they are.
   */
  boxLabel?: string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  disabled?: boolean;
  /** Class for the individual boxes. */
  boxClassName?: string;
};

function allowedPattern(type: PinInputType): RegExp {
  return type === "numeric" ? /[0-9]/ : /[a-zA-Z0-9]/;
}

function toChars(value: string, length: number): string[] {
  const chars = value.split("").slice(0, length);
  return Array.from({ length }, (_, i) => chars[i] ?? "");
}

export function PinInput({
  length = DEFAULT_LENGTH,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  type = "numeric",
  uppercase = true,
  mask = false,
  oneTimeCode = false,
  boxLabel = DEFAULT_BOX_LABEL,
  size = "default",
  state = "default",
  disabled = false,
  className,
  boxClassName,
  ...props
}: PinInputProps) {
  const isControlled = value !== undefined;
  // Held as an array, not as the joined string it reports. Round-tripping
  // through a string closes any gap the user left — clearing the third box of
  // "1234" would re-read as "124" and shunt the 4 left one place.
  //
  // A controlled `value` cannot express a gap either, which is a real limit of
  // taking the code as a string; it is the caller's own state, so the caller
  // already knows what it put there.
  const [internalChars, setInternalChars] = React.useState<string[]>(() =>
    toChars(defaultValue ?? "", length),
  );
  const chars = isControlled ? toChars(value, length) : internalChars;

  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const pattern = allowedPattern(type);

  const focusBox = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), length - 1);
    refs.current[clamped]?.focus();
  };

  const commit = (next: string[]) => {
    const joined = next.join("");
    if (!isControlled) setInternalChars(next);
    onValueChange?.(joined);
    if (next.every((c) => c !== "")) onComplete?.(joined);
  };

  const normalize = (char: string): string =>
    type === "alphanumeric" && uppercase ? char.toUpperCase() : char;

  const setCharAt = (index: number, char: string): string[] => {
    const next = [...chars];
    next[index] = char;
    return next;
  };

  const handleChange =
    (index: number): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      const raw = e.target.value;
      // Exactly one character means the keystroke landed on an empty box or
      // replaced the selection a focused box always carries — an edit. Two
      // means it was appended to a character that was not selected, which only
      // happens past the end of a full code: overflow, and dropped.
      const incoming = raw.length === 1 ? raw : "";

      if (!incoming || !pattern.test(incoming)) {
        // The box is controlled by `chars`, and a rejected keystroke changes
        // nothing there — so React has no re-render to schedule and would leave
        // the stray character sitting in the DOM, where `maxLength` then blocks
        // the next (valid) one. Put the box back by hand.
        e.target.value = chars[index] ?? "";
        return;
      }

      commit(setCharAt(index, normalize(incoming)));
      if (index < length - 1) focusBox(index + 1);
    };

  const handleKeyDown =
    (index: number): React.KeyboardEventHandler<HTMLInputElement> =>
    (e) => {
      if (e.key === "Backspace") {
        // Handled here rather than through `onChange` so that both cases are
        // one rule: a full box empties, an empty box eats the one before it.
        e.preventDefault();
        if (chars[index]) {
          commit(setCharAt(index, ""));
        } else if (index > 0) {
          commit(setCharAt(index - 1, ""));
          focusBox(index - 1);
        }
        return;
      }
      if (e.key === "Delete") {
        e.preventDefault();
        commit(setCharAt(index, ""));
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusBox(index - 1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        focusBox(index + 1);
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        focusBox(0);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        focusBox(length - 1);
      }
    };

  const handlePaste =
    (index: number): React.ClipboardEventHandler<HTMLInputElement> =>
    (e) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .split("")
        // People copy codes with the spaces and dashes they were shown in.
        .filter((c) => pattern.test(c))
        .map(normalize);
      if (pasted.length === 0) return;

      const next = [...chars];
      for (let i = 0; i < pasted.length && index + i < length; i++) {
        next[index + i] = pasted[i]!;
      }
      commit(next);
      focusBox(index + pasted.length);
    };

  return (
    <div
      role="group"
      data-slot="pin-input"
      data-state={state}
      className={cn(pinInputGroupVariants({ size }), className)}
      {...props}
    >
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          data-slot="pin-input-box"
          data-state={state}
          type={mask ? "password" : "text"}
          inputMode={type === "numeric" ? "numeric" : "text"}
          autoComplete={oneTimeCode && index === 0 ? "one-time-code" : "off"}
          // Deliberately no `maxLength={1}`. The box is already pinned to one
          // character by `chars[index]`, and the attribute would only get in
          // the way: a browser enforces it by value length alone, so a full box
          // refuses the keystroke that was meant to replace its contents.
          disabled={disabled}
          aria-label={`${boxLabel} ${index + 1}`}
          aria-invalid={state === "error" ? true : undefined}
          value={char}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          onPaste={handlePaste(index)}
          // Selecting on focus is what makes a filled box replaceable: type a
          // digit and it overwrites rather than being refused by `maxLength`.
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            fieldSurfaceVariants({ size, state }),
            pinInputBoxVariants({ size }),
            boxClassName,
          )}
        />
      ))}
    </div>
  );
}
PinInput.displayName = "PinInput";
