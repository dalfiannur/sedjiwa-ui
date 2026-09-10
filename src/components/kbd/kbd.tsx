import * as React from "react";
import { cn } from "../../lib/cn";
import { isMac } from "../../lib/platform";
import { kbdGroupVariants, kbdVariants, type KbdVariants } from "./kbd.variants";

/** Modifiers always print in this order, whatever order the shortcut was written in. */
const MODIFIER_ORDER = ["ctrl", "meta", "alt", "shift"] as const;
type Modifier = (typeof MODIFIER_ORDER)[number];

/** Vocabulary shared with `useKeyboardShortcut` — the same tokens it binds. */
const MODIFIER_TOKENS: Record<string, Modifier | "mod"> = {
  mod: "mod",
  ctrl: "ctrl",
  control: "ctrl",
  cmd: "meta",
  command: "meta",
  meta: "meta",
  win: "meta",
  alt: "alt",
  option: "alt",
  opt: "alt",
  shift: "shift",
};

const MODIFIER_GLYPHS: Record<Modifier, { mac: string; other: string }> = {
  ctrl: { mac: "⌃", other: "Ctrl" },
  meta: { mac: "⌘", other: "Win" },
  alt: { mac: "⌥", other: "Alt" },
  shift: { mac: "⇧", other: "Shift" },
};

/** Spoken form. `⌘` announced as a glyph is noise; "Command" is a word. */
const MODIFIER_NAMES: Record<Modifier, { mac: string; other: string }> = {
  ctrl: { mac: "Control", other: "Control" },
  meta: { mac: "Command", other: "Windows" },
  alt: { mac: "Option", other: "Alt" },
  shift: { mac: "Shift", other: "Shift" },
};

/** Keys worth drawing or spelling rather than printing raw. */
const KEY_LABELS: Record<string, string> = {
  esc: "Esc",
  escape: "Esc",
  enter: "Enter",
  return: "Enter",
  space: "Space",
  spacebar: "Space",
  tab: "Tab",
  backspace: "⌫",
  del: "Del",
  delete: "Del",
  up: "↑",
  arrowup: "↑",
  down: "↓",
  arrowdown: "↓",
  left: "←",
  arrowleft: "←",
  right: "→",
  arrowright: "→",
  home: "Home",
  end: "End",
  pageup: "PgUp",
  pagedown: "PgDn",
  plus: "+",
  add: "+",
};

/** Spoken form for the glyph-drawn keys above. */
const KEY_NAMES: Record<string, string> = {
  "⌫": "Backspace",
  "↑": "Arrow up",
  "↓": "Arrow down",
  "←": "Arrow left",
  "→": "Arrow right",
};

type ParsedShortcut = { caps: string[]; spoken: string[] };

function parseShortcut(keys: string, mac: boolean): ParsedShortcut {
  const found = new Set<Modifier>();
  const plain: string[] = [];

  for (const raw of keys.split("+")) {
    const token = raw.trim().toLowerCase();
    if (!token) continue;
    const modifier = MODIFIER_TOKENS[token];
    if (modifier === "mod") {
      found.add(mac ? "meta" : "ctrl");
    } else if (modifier) {
      found.add(modifier);
    } else {
      plain.push(token);
    }
  }

  const caps: string[] = [];
  const spoken: string[] = [];
  for (const modifier of MODIFIER_ORDER) {
    if (!found.has(modifier)) continue;
    caps.push(mac ? MODIFIER_GLYPHS[modifier].mac : MODIFIER_GLYPHS[modifier].other);
    spoken.push(mac ? MODIFIER_NAMES[modifier].mac : MODIFIER_NAMES[modifier].other);
  }
  for (const key of plain) {
    const cap = KEY_LABELS[key] ?? (key.length === 1 ? key.toUpperCase() : key);
    caps.push(cap);
    spoken.push(KEY_NAMES[cap] ?? cap);
  }

  return { caps, spoken };
}

export type KbdProps = Omit<React.ComponentProps<"kbd">, "children"> & {
  /**
   * A shortcut in the same notation `useKeyboardShortcut` binds — `"mod+k"`,
   * `"alt+shift+f"`. `mod` resolves to Cmd on a Mac and Ctrl everywhere else,
   * so one string renders correctly on both.
   */
  keys?: string;
  size?: KbdVariants["size"];
  children?: React.ReactNode;
  /** Class for the wrapper around a multi-key shortcut. */
  groupClassName?: string;
};

export function Kbd({
  keys,
  size = "default",
  className,
  groupClassName,
  children,
  "aria-label": ariaLabel,
  ...props
}: KbdProps) {
  // Read at render rather than at module load: a test (or a server render
  // followed by hydration) can change the answer between the two.
  const mac = isMac();

  if (keys === undefined) {
    return (
      <kbd
        data-slot="kbd"
        aria-label={ariaLabel}
        className={cn(kbdVariants({ size }), className)}
        {...props}
      >
        {children}
      </kbd>
    );
  }

  const { caps, spoken } = parseShortcut(keys, mac);

  return (
    <span
      data-slot="kbd-group"
      role="img"
      // The caps are drawn, not read: "⌘ K" announced glyph by glyph tells the
      // user nothing. The group speaks the whole shortcut in words instead.
      aria-label={ariaLabel ?? spoken.join(" ")}
      className={cn(kbdGroupVariants({ size }), groupClassName)}
    >
      {caps.map((cap, i) => (
        <kbd
          key={`${cap}-${i}`}
          data-slot="kbd"
          aria-hidden="true"
          className={cn(kbdVariants({ size }), className)}
          {...props}
        >
          {cap}
        </kbd>
      ))}
    </span>
  );
}
Kbd.displayName = "Kbd";
