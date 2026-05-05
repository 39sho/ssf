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

  it("returns kind defaults for leaf nodes without explicit defaults", () => {
    expect(extractDefaults(str("x"))).toBe("");
    expect(extractDefaults(num("y"))).toBe(0);
    expect(extractDefaults(bool("z"))).toBe(false);
  });

  it("returns leaf default values when explicitly set", () => {
    expect(extractDefaults(str("x", "hello"))).toBe("hello");
    expect(extractDefaults(num("y", 42))).toBe(42);
    expect(extractDefaults(bool("z", false))).toBe(false);
  });

  it("returns object with kind defaults when no child has explicit defaults", () => {
    const node = obj("", [str("name"), num("age")]);
    expect(extractDefaults(node)).toEqual({
      name: "",
      age: 0,
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

  it("fills missing child defaults with kind defaults", () => {
    const node = obj("", [
      str("name", "John"),
      str("bio"), // no explicit default → falls back to ""
      num("age", 0),
    ]);
    expect(extractDefaults(node)).toEqual({
      name: "John",
      bio: "",
      age: 0,
    });
  });
});
