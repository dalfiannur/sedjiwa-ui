import * as React from "react";

type Direction = "next" | "prev";

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

export function InputOrderProvider(_props: InputOrderProviderProps): React.ReactElement {
  throw new Error("InputOrderProvider not implemented yet");
}

export type UseInputOrderOptions = {
  onEnter?: (event: React.KeyboardEvent) => void;
};

export type UseInputOrderReturn = {
  ref: React.RefCallback<HTMLElement>;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function useInputOrder(
  _order: number,
  _options?: UseInputOrderOptions,
): UseInputOrderReturn {
  const ctx = React.useContext(InputOrderContext);
  if (!ctx) {
    throw new Error("useInputOrder must be used inside <InputOrderProvider>");
  }
  return {
    ref: () => {},
    onKeyDown: () => {},
  };
}
