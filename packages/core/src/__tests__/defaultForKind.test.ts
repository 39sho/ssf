import { describe, expect, it } from "vitest";
import type { FieldKind } from "../fieldNode";
import { defaultForKind } from "../fieldNode";

describe("defaultForKind", () => {
  it("returns empty string for 'string'", () => {
    expect(defaultForKind("string")).toBe("");
  });

  it("returns 0 for 'number'", () => {
    expect(defaultForKind("number")).toBe(0);
  });

  it("returns false for 'boolean'", () => {
    expect(defaultForKind("boolean")).toBe(false);
  });

  it("returns null for 'enum'", () => {
    expect(defaultForKind("enum")).toBeNull();
  });

  it("returns empty object for 'object'", () => {
    expect(defaultForKind("object")).toEqual({});
  });

  it("returns empty array for 'array'", () => {
    expect(defaultForKind("array")).toEqual([]);
  });

  it("covers every FieldKind", () => {
    const allKinds: FieldKind[] = [
      "string",
      "number",
      "boolean",
      "enum",
      "object",
      "array",
    ];
    for (const kind of allKinds) {
      expect(defaultForKind(kind)).toBeDefined();
    }
  });
});
