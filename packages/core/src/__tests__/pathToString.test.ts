import { describe, expect, it } from "vitest";
import { pathToString } from "../fieldNode";

describe("pathToString", () => {
  it("returns empty string for empty path", () => {
    expect(pathToString([])).toBe("");
  });

  it("returns the key for a single string segment", () => {
    expect(pathToString(["name"])).toBe("name");
  });

  it("joins string segments with dots", () => {
    expect(pathToString(["address", "city"])).toBe("address.city");
  });

  it("wraps numeric segments in brackets", () => {
    expect(pathToString(["items", 0])).toBe("items[0]");
  });

  it("handles multiple numeric segments", () => {
    expect(pathToString(["matrix", 1, 2])).toBe("matrix[1][2]");
  });

  it("handles mixed string and numeric segments", () => {
    expect(pathToString(["speakers", 0, "name"])).toBe("speakers[0].name");
  });

  it("handles deeply nested mixed path", () => {
    expect(pathToString(["a", "b", 0, "c", 1, "d"])).toBe("a.b[0].c[1].d");
  });

  it("handles path starting with a numeric index", () => {
    expect(pathToString([0, "name"])).toBe("[0].name");
  });
});
