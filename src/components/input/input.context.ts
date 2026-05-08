import * as React from "react";

export type InputContextValue = {
  size: "sm" | "default" | "lg";
  state: "default" | "error" | "success" | "warning";
  loading: boolean;
  disabled: boolean;
  readOnly: boolean;
  ariaProps: {
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  };
};

export const InputContext = React.createContext<InputContextValue | null>(null);

export function useInputContext(componentName: string): InputContextValue {
  const ctx = React.useContext(InputContext);
  if (!ctx) {
    throw new Error(
      `<Input.${componentName}> must be rendered inside <Input.Root>.`,
    );
  }
  return ctx;
}
