import { describe, expect, it } from "vitest";
import type { FieldNode } from "../fieldNode";
import { extractDefaults } from "../fieldNode";

// ---------------------------------------------------------------------------
// Helper: build minimal FieldNode objects for testing
// ---------------------------------------------------------------------------

function str(name: string, defaultValue?: unknown): FieldNode {
  return {
    kind: "string",
    name,
    path: [name],
    required: false,
    readOnly: false,
    defaultValue,
  };
}

function num(name: string, defaultValue?: unknown): FieldNode {
  return {
    kind: "number",
    name,
    path: [name],
    required: false,
    readOnly: false,
    defaultValue,
  };
}

function bool(name: string, defaultValue?: unknown): FieldNode {
  return {
    kind: "boolean",
    name,
    path: [name],
    required: false,
    readOnly: false,
    defaultValue,
  };
}

function obj(
  name: string,
  properties: FieldNode[],
  defaultValue?: unknown,
): FieldNode {
  return {
    kind: "object",
    name,
    path: name ? [name] : [],
    required: false,
    readOnly: false,
    properties,
    defaultValue,
  };
}

function arr(name: string, item: FieldNode, defaultValue?: unknown): FieldNode {
  return {
    kind: "array",
    name,
    path: [name],
    required: false,
    readOnly: false,
    item,
    defaultValue,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("extractDefaults", () => {
  it("extracts defaults from a flat object", () => {
    const node = obj("", [
      str("name", ""),
      num("age", 0),
      bool("active", true),
    ]);
    expect(extractDefaults(node)).toEqual({
      name: "",
      age: 0,
      active: true,
    });
  });

  it("returns undefined for leaf nodes without defaults", () => {
    expect(extractDefaults(str("x"))).toBeUndefined();
    expect(extractDefaults(num("y"))).toBeUndefined();
    expect(extractDefaults(bool("z"))).toBeUndefined();
  });

  it("returns leaf default values", () => {
    expect(extractDefaults(str("x", "hello"))).toBe("hello");
    expect(extractDefaults(num("y", 42))).toBe(42);
    expect(extractDefaults(bool("z", false))).toBe(false);
  });

  it("returns object defaultValue when no child has defaults", () => {
    const fallback = { foo: "bar" };
    const node = obj("", [str("name"), num("age")], fallback);
    expect(extractDefaults(node)).toEqual(fallback);
  });

  it("prefers child defaults over object defaultValue", () => {
    const node = obj("", [str("name", "John")], { name: "SHOULD_NOT_USE" });
    expect(extractDefaults(node)).toEqual({ name: "John" });
  });

  it("extracts defaults from nested objects", () => {
    const node = obj("", [
      str("title", "Event"),
      obj("location", [str("venue", "Hall A"), str("city", "Tokyo")]),
    ]);
    expect(extractDefaults(node)).toEqual({
      title: "Event",
      location: { venue: "Hall A", city: "Tokyo" },
    });
  });

  it("returns empty array as default for array nodes", () => {
    const node = arr("tags", str("0", ""));
    expect(extractDefaults(node)).toEqual([]);
  });

  it("returns provided array default when set", () => {
    const node = arr("tags", str("0", ""), ["a", "b"]);
    expect(extractDefaults(node)).toEqual(["a", "b"]);
  });

  it("omits children without defaults from the result", () => {
    const node = obj("", [
      str("name", "John"),
      str("bio"), // no default
      num("age", 0),
    ]);
    expect(extractDefaults(node)).toEqual({ name: "John", age: 0 });
  });
});
