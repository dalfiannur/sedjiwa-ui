import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInputOrder } from "./use-input-order";

describe("useInputOrder", () => {
  it("throws when used outside <InputOrderProvider>", () => {
    expect(() => renderHook(() => useInputOrder(1))).toThrow(
      /useInputOrder must be used inside <InputOrderProvider>/,
    );
  });
});
