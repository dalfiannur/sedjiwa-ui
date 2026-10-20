import { describe, expect, it } from "vitest";
import {
  moveColumn,
  normalizeColumnState,
  setColumnVisible,
} from "./column-state";

const KEYS = ["id", "name", "phone", "status"];

describe("normalizeColumnState", () => {
  it("defaults to the declared order with nothing hidden", () => {
    expect(normalizeColumnState(KEYS, null)).toEqual({
      order: KEYS,
      hidden: [],
    });
  });

  it("drops unknown and duplicate keys", () => {
    expect(
      normalizeColumnState(KEYS, {
        order: ["phone", "gone", "phone", "id", "name", "status"],
        hidden: ["gone", "name", "name"],
      }),
    ).toEqual({ order: ["phone", "id", "name", "status"], hidden: ["name"] });
  });

  it("slots a newly declared column in after its declared predecessor", () => {
    // Stored before "phone" existed; the user had moved status to the front.
    expect(
      normalizeColumnState(KEYS, { order: ["status", "id", "name"] }).order,
    ).toEqual(["status", "id", "name", "phone"]);
    expect(
      normalizeColumnState(KEYS, { order: ["name", "id"] }).order,
    ).toEqual(["name", "phone", "status", "id"]);
    // A new first column has no predecessor and goes to the front.
    expect(
      normalizeColumnState(KEYS, { order: ["status", "name", "phone"] }).order,
    ).toEqual(["id", "status", "name", "phone"]);
  });

  it("never leaves every column hidden", () => {
    expect(normalizeColumnState(KEYS, { hidden: KEYS }).hidden).toEqual([]);
  });

  it("tolerates malformed stored values", () => {
    expect(
      normalizeColumnState(KEYS, { order: "nope", hidden: 3 } as never),
    ).toEqual({ order: KEYS, hidden: [] });
  });
});

describe("moveColumn", () => {
  const state = { order: KEYS, hidden: [] };

  it("swaps with the neighbouring column", () => {
    expect(moveColumn(state, "name", -1).order).toEqual([
      "name",
      "id",
      "phone",
      "status",
    ]);
    expect(moveColumn(state, "name", 1).order).toEqual([
      "id",
      "phone",
      "name",
      "status",
    ]);
  });

  it("skips over hidden columns", () => {
    const s = { order: KEYS, hidden: ["name"] };
    expect(moveColumn(s, "phone", -1).order).toEqual([
      "phone",
      "name",
      "id",
      "status",
    ]);
  });

  it("returns the same state at the edges", () => {
    expect(moveColumn(state, "id", -1)).toBe(state);
    expect(moveColumn(state, "status", 1)).toBe(state);
  });
});

describe("setColumnVisible", () => {
  const state = { order: KEYS, hidden: [] };

  it("hides and shows a column", () => {
    const hidden = setColumnVisible(state, "phone", false);
    expect(hidden.hidden).toEqual(["phone"]);
    expect(setColumnVisible(hidden, "phone", true).hidden).toEqual([]);
  });

  it("refuses to hide the last visible column", () => {
    const s = { order: KEYS, hidden: ["id", "name", "phone"] };
    expect(setColumnVisible(s, "status", false)).toBe(s);
  });
});
