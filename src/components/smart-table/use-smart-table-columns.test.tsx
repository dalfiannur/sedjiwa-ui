import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSmartTableColumns } from "./use-smart-table-columns";

const COLUMNS = [{ key: "id" }, { key: "name" }, { key: "phone" }];
const STORAGE = "sedjiwa-ui:smart-table:orders";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("useSmartTableColumns", () => {
  it("starts from the declared columns", () => {
    const { result } = renderHook(() => useSmartTableColumns(COLUMNS));
    expect(result.current.columnState).toEqual({
      order: ["id", "name", "phone"],
      hidden: [],
    });
  });

  it("persists changes under storageKey and restores them on mount", () => {
    const first = renderHook(() =>
      useSmartTableColumns(COLUMNS, { storageKey: "orders" }),
    );
    act(() =>
      first.result.current.setColumnState({
        order: ["phone", "id", "name"],
        hidden: ["id"],
      }),
    );
    expect(JSON.parse(localStorage.getItem(STORAGE)!)).toEqual({
      order: ["phone", "id", "name"],
      hidden: ["id"],
    });

    const second = renderHook(() =>
      useSmartTableColumns(COLUMNS, { storageKey: "orders" }),
    );
    expect(second.result.current.columnState).toEqual({
      order: ["phone", "id", "name"],
      hidden: ["id"],
    });
  });

  it("reset returns to defaultState and clears storage", () => {
    const { result } = renderHook(() =>
      useSmartTableColumns(COLUMNS, {
        storageKey: "orders",
        defaultState: { hidden: ["phone"] },
      }),
    );
    expect(result.current.columnState.hidden).toEqual(["phone"]);
    act(() =>
      result.current.setColumnState({ order: ["id", "name", "phone"], hidden: [] }),
    );
    act(() => result.current.reset());
    expect(result.current.columnState.hidden).toEqual(["phone"]);
    expect(localStorage.getItem(STORAGE)).toBeNull();
  });

  it("ignores corrupt stored JSON and storage that throws", () => {
    localStorage.setItem(STORAGE, "{not json");
    const { result } = renderHook(() =>
      useSmartTableColumns(COLUMNS, { storageKey: "orders" }),
    );
    expect(result.current.columnState.order).toEqual(["id", "name", "phone"]);

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    act(() =>
      result.current.setColumnState({ order: ["name", "id", "phone"], hidden: [] }),
    );
    expect(result.current.columnState.order).toEqual(["name", "id", "phone"]);
  });
});
