import * as React from "react";

type Direction = "next" | "prev";

type Registry = Map<number, HTMLElement>;

type InputOrderContextValue = {
  register: (order: number, el: HTMLElement) => void;
  unregister: (order: number, el: HTMLElement) => void;
  step: (direction: Direction, fromOrder: number, event: React.KeyboardEvent) => void;
};

const InputOrderContext = React.createContext<InputOrderContextValue | null>(null);

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
  const onLastFieldRef = React.useRef(onLastField);
  const onSubmitRef = React.useRef(onSubmit);
  React.useEffect(() => {
    onLastFieldRef.current = onLastField;
    onSubmitRef.current = onSubmit;
  });

  const value = React.useMemo<InputOrderContextValue>(
    () => ({
      register(order, el) {
        registryRef.current.set(order, el);
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
        const cursor = idx + delta;
        while (cursor >= 0 && cursor < sorted.length) {
          const [, el] = sorted[cursor];
          event.preventDefault();
          el.focus();
          return;
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
  _options?: UseInputOrderOptions,
): UseInputOrderReturn {
  const ctx = React.useContext(InputOrderContext);
  if (!ctx) {
    throw new Error("useInputOrder must be used inside <InputOrderProvider>");
  }

  const elRef = React.useRef<HTMLElement | null>(null);

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
      if (event.key === "Tab" && !event.shiftKey) {
        ctx.step("next", order, event);
      }
    },
    [ctx, order],
  );

  return { ref, onKeyDown };
}
