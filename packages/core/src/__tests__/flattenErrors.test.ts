import { describe, expect, it } from "vitest";
import { flattenErrors } from "../types";

describe("flattenErrors", () => {
  it("returns empty array for empty input", () => {
    expect(flattenErrors([])).toEqual([]);
  });

  it("passes through string errors unchanged", () => {
    expect(flattenErrors(["required", "too short"])).toEqual([
      "required",
      "too short",
    ]);
  });

  it("extracts .message from objects", () => {
    expect(
      flattenErrors([{ message: "Field is required" }, { message: "Invalid" }]),
    ).toEqual(["Field is required", "Invalid"]);
  });

  it("handles a mix of strings and message objects", () => {
    expect(
      flattenErrors(["required", { message: "must be email" }, "too short"]),
    ).toEqual(["required", "must be email", "too short"]);
  });

  it("skips values that are neither strings nor message objects", () => {
    expect(
      flattenErrors([42, null, undefined, true, { foo: "bar" }, "valid"]),
    ).toEqual(["valid"]);
  });

  it("skips objects with non-string message properties", () => {
    expect(flattenErrors([{ message: 123 }, { message: null }])).toEqual([]);
  });
});
