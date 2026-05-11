import * as React from "react";

type Direction = "next" | "prev";

type Registry = Map<number, HTMLElement>;

type InputOrderContextValue = {
  register: (order: number, el: HTMLElement) => void;
  unregister: (order: number, el: HTMLElement) => void;
  step: (direction: Direction, fromOrder: number, event: React.KeyboardEvent) => void;
};

const InputOrderContext = React.createContext<InputOrderContextValue | null>(null);

function isSkippable(el: HTMLElement): boolean {
  if ((el as HTMLInputElement).disabled) return true;
  if (el.getAttribute("aria-disabled") === "true") return true;
  if (el.tabIndex === -1) return true;
  return false;
}

function shouldSkipEnter(event: React.KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  if (target.tagName === "TEXTAREA") return true;
  if (target.tagName === "BUTTON") return true;
  if (target.getAttribute("aria-expanded") === "true") return true;
  if (target.getAttribute("data-input-order-enter") === "ignore") return true;
  return false;
}

export type InputOrderProviderProps = {
  onLastField?: "submit" | "wrap" | "none";
  onSubmit?: (event: React.SyntheticEvent) => void;
  children: React.ReactNode;
};

export function InputOrderProvider({
  onLastField = "submit",
  onSubmit,
  children,
}: InputOrderProviderProps) {
  const registryRef = React.useRef<Registry>(new Map());
  const seenDuplicates = React.useRef<Set<number>>(new Set());
  const onLastFieldRef = React.useRef(onLastField);
  const onSubmitRef = React.useRef(onSubmit);
  React.useEffect(() => {
    onLastFieldRef.current = onLastField;
    onSubmitRef.current = onSubmit;
  });

  const value = React.useMemo<InputOrderContextValue>(
    () => ({
      register(order, el) {
        const reg = registryRef.current;
        const existing = reg.get(order);
        if (existing && existing !== el) {
          if (
            process.env.NODE_ENV !== "production" &&
            !seenDuplicates.current.has(order)
          ) {
            seenDuplicates.current.add(order);
            console.warn("[useInputOrder] duplicate order %d", order);
          }
        }
        reg.set(order, el);
      },
      unregister(order, el) {
        const reg = registryRef.current;
        if (reg.get(order) === el) reg.delete(order);
      },
      step(direction, fromOrder, event) {
        const sorted = [...registryRef.current.entries()].sort(
          ([a], [b]) => a - b,
        );
        const idx = sorted.findIndex(([o]) => o === fromOrder);
        if (idx === -1) return;
        const delta = direction === "next" ? 1 : -1;
        let cursor = idx + delta;
        while (cursor >= 0 && cursor < sorted.length) {
          const [, el] = sorted[cursor];
          if (!isSkippable(el)) {
            event.preventDefault();
            el.focus();
            return;
          }
          cursor += delta;
        }
        // out-of-range handled in later tasks
      },
    }),
    [],
  );

  return (
    <InputOrderContext.Provider value={value}>{children}</InputOrderContext.Provider>
  );
}

export type UseInputOrderOptions = {
  onEnter?: (event: React.KeyboardEvent) => void;
};

export type UseInputOrderReturn = {
  ref: React.RefCallback<HTMLElement>;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function useInputOrder(
  order: number,
  options?: UseInputOrderOptions,
): UseInputOrderReturn {
  const ctx = React.useContext(InputOrderContext);
  if (!ctx) {
    throw new Error("useInputOrder must be used inside <InputOrderProvider>");
  }

  const elRef = React.useRef<HTMLElement | null>(null);
  const optionsRef = React.useRef(options);
  React.useEffect(() => {
    optionsRef.current = options;
  });

  const ref = React.useCallback<React.RefCallback<HTMLElement>>(
    (el) => {
      if (el) {
        elRef.current = el;
        ctx.register(order, el);
      } else if (elRef.current) {
        ctx.unregister(order, elRef.current);
        elRef.current = null;
      }
    },
    [ctx, order],
  );

  const onKeyDown = React.useCallback<(e: React.KeyboardEvent) => void>(
    (event) => {
      if (event.defaultPrevented) return;
      if (event.key === "Tab") {
        ctx.step(event.shiftKey ? "prev" : "next", order, event);
        return;
      }
      if (event.key === "Enter") {
        if (shouldSkipEnter(event)) return;
        const onEnter = optionsRef.current?.onEnter;
        if (onEnter) {
          event.preventDefault();
          onEnter(event);
          return;
        }
        ctx.step("next", order, event);
      }
    },
    [ctx, order],
  );

  return { ref, onKeyDown };
}
