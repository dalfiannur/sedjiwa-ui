import * as React from "react";

export type KeyboardShortcutEvent = "keydown" | "keyup";

export type KeyboardShortcutTarget =
  | Window
  | Document
  | HTMLElement
  | null
  | React.RefObject<HTMLElement | null>;

export type UseKeyboardShortcutOptions = {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  allowInInputs?: boolean;
  target?: KeyboardShortcutTarget;
  event?: KeyboardShortcutEvent;
};

export type KeyboardShortcutHandler = (event: KeyboardEvent) => void;

type Combo = {
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
};

const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  escape: "escape",
  return: "enter",
  enter: "enter",
  space: " ",
  spacebar: " ",
  plus: "+",
  add: "+",
  del: "delete",
  delete: "delete",
  backspace: "backspace",
  tab: "tab",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  arrowup: "arrowup",
  arrowdown: "arrowdown",
  arrowleft: "arrowleft",
  arrowright: "arrowright",
  home: "home",
  end: "end",
  pageup: "pageup",
  pagedown: "pagedown",
};

function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

function normalizeKey(token: string): string {
  const lower = token.toLowerCase();
  return KEY_ALIASES[lower] ?? lower;
}

function parseShortcut(shortcut: string): Combo {
  const tokens = shortcut
    .split("+")
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) {
    throw new Error(`[useKeyboardShortcut] empty shortcut: "${shortcut}"`);
  }

  let ctrl = false;
  let meta = false;
  let alt = false;
  let shift = false;
  let key: string | null = null;
  const mac = isMac();

  for (const raw of tokens) {
    const t = raw.toLowerCase();
    if (t === "mod") {
      if (mac) meta = true;
      else ctrl = true;
    } else if (t === "ctrl" || t === "control") {
      ctrl = true;
    } else if (t === "cmd" || t === "command" || t === "meta" || t === "win") {
      meta = true;
    } else if (t === "alt" || t === "option" || t === "opt") {
      alt = true;
    } else if (t === "shift") {
      shift = true;
    } else {
      if (key !== null) {
        throw new Error(
          `[useKeyboardShortcut] shortcut "${shortcut}" must contain exactly one non-modifier key`,
        );
      }
      key = normalizeKey(t);
    }
  }

  if (key === null) {
    throw new Error(
      `[useKeyboardShortcut] shortcut "${shortcut}" must contain a non-modifier key`,
    );
  }

  return { ctrl, meta, alt, shift, key };
}

function matches(combo: Combo, event: KeyboardEvent): boolean {
  if (event.ctrlKey !== combo.ctrl) return false;
  if (event.metaKey !== combo.meta) return false;
  if (event.altKey !== combo.alt) return false;
  if (event.shiftKey !== combo.shift) return false;
  return event.key.toLowerCase() === combo.key;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

function resolveTarget(target: KeyboardShortcutTarget | undefined): EventTarget | null {
  if (target === undefined) {
    return typeof window === "undefined" ? null : window;
  }
  if (target === null) return null;
  if (target instanceof Window || target instanceof Document || target instanceof HTMLElement) {
    return target;
  }
  return target.current;
}

export function useKeyboardShortcut(
  shortcut: string | ReadonlyArray<string>,
  handler: KeyboardShortcutHandler,
  options?: UseKeyboardShortcutOptions,
): void {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    allowInInputs = false,
    target,
    event: eventName = "keydown",
  } = options ?? {};

  const handlerRef = React.useRef(handler);
  React.useEffect(() => {
    handlerRef.current = handler;
  });

  const shortcutKey = React.useMemo(
    () => (Array.isArray(shortcut) ? shortcut.join("|") : (shortcut as string)),
    [shortcut],
  );

  const combos = React.useMemo<Combo[]>(() => {
    const list = Array.isArray(shortcut) ? shortcut : [shortcut as string];
    return list.map(parseShortcut);
    // shortcutKey is the stable identity for the array contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcutKey]);

  React.useEffect(() => {
    if (!enabled) return;
    const node = resolveTarget(target);
    if (!node) return;

    const listener = (ev: Event) => {
      const keyboardEvent = ev as KeyboardEvent;
      if (!allowInInputs && isEditableTarget(keyboardEvent.target)) return;
      for (const combo of combos) {
        if (matches(combo, keyboardEvent)) {
          if (preventDefault) keyboardEvent.preventDefault();
          if (stopPropagation) keyboardEvent.stopPropagation();
          handlerRef.current(keyboardEvent);
          return;
        }
      }
    };

    node.addEventListener(eventName, listener);
    return () => {
      node.removeEventListener(eventName, listener);
    };
  }, [enabled, allowInInputs, preventDefault, stopPropagation, eventName, target, combos]);
}
