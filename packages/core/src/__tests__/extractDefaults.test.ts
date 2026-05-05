import { describe, expect, it } from "vitest";
import { extractDefaults } from "../fieldNode";
import { arr, bool, num, obj, str } from "./helpers";

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

  it("returns object with undefined values when no child has defaults", () => {
    const node = obj("", [str("name"), num("age")]);
    expect(extractDefaults(node)).toEqual({
      name: undefined,
      age: undefined,
    });
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

  it("includes children without defaults as undefined", () => {
    const node = obj("", [
      str("name", "John"),
      str("bio"), // no default
      num("age", 0),
    ]);
    expect(extractDefaults(node)).toEqual({
      name: "John",
      bio: undefined,
      age: 0,
    });
  });
});
