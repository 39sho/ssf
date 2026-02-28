import { describe, expect, it } from "vitest";
import type {
  ArrayFieldNode,
  FieldNode,
  ObjectFieldNode,
  StringFieldNode,
} from "../fieldNode";
import type { ArrayItem, FieldVisitor } from "../walk";
import { walkFieldNode } from "../walk";

// ---------------------------------------------------------------------------
// Helper: build minimal FieldNode objects for testing
// ---------------------------------------------------------------------------

function str(
  name: string,
  path: (string | number)[] = [name],
): StringFieldNode {
  return { kind: "string", name, path, required: false, readOnly: false };
}

function obj(
  name: string,
  properties: FieldNode[],
  path: (string | number)[] = name ? [name] : [],
): ObjectFieldNode {
  return {
    kind: "object",
    name,
    path,
    required: false,
    readOnly: false,
    properties,
  };
}

function arr(
  name: string,
  item: FieldNode,
  path: (string | number)[] = [name],
): ArrayFieldNode {
  return { kind: "array", name, path, required: false, readOnly: false, item };
}

// ---------------------------------------------------------------------------
// A simple visitor that collects field names as strings (for easy assertion).
// ---------------------------------------------------------------------------

function createCollectorVisitor(): {
  visitor: FieldVisitor<string>;
  collected: string[];
} {
  const collected: string[] = [];

  const visitor: FieldVisitor<string> = {
    string(_node, fieldName) {
      collected.push(`string:${fieldName}`);
      return `string:${fieldName}`;
    },
    number(_node, fieldName) {
      collected.push(`number:${fieldName}`);
      return `number:${fieldName}`;
    },
    boolean(_node, fieldName) {
      collected.push(`boolean:${fieldName}`);
      return `boolean:${fieldName}`;
    },
    enum(_node, fieldName) {
      collected.push(`enum:${fieldName}`);
      return `enum:${fieldName}`;
    },
    object(_node, fieldName, _children) {
      const label = `object:${fieldName || "(root)"}`;
      collected.push(label);
      return label;
    },
    array(_node, fieldName, _walkItem) {
      collected.push(`array:${fieldName}`);
      return `array:${fieldName}`;
    },
  };

  return { visitor, collected };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("walkFieldNode", () => {
  it("visits a single string node", () => {
    const { visitor, collected } = createCollectorVisitor();
    const result = walkFieldNode(str("name"), visitor);

    expect(result).toBe("string:name");
    expect(collected).toEqual(["string:name"]);
  });

  it("visits an object with children in order", () => {
    const { visitor, collected } = createCollectorVisitor();
    const root = obj("", [str("first"), str("last")]);
    walkFieldNode(root, visitor);

    expect(collected).toEqual(["string:first", "string:last", "object:(root)"]);
  });

  it("passes pre-rendered children to the object visitor", () => {
    const children: (string | null)[] = [];
    const visitor: FieldVisitor<string> = {
      string(_n, fn) {
        return fn;
      },
      number(_n, fn) {
        return fn;
      },
      boolean(_n, fn) {
        return fn;
      },
      enum(_n, fn) {
        return fn;
      },
      object(_n, _fn, c) {
        children.push(...c);
        return "obj";
      },
      array(_n, fn, _wi) {
        return fn;
      },
    };

    const root = obj("", [str("a"), str("b")]);
    walkFieldNode(root, visitor);

    expect(children).toEqual(["a", "b"]);
  });

  it("visits nested objects recursively", () => {
    const { visitor, collected } = createCollectorVisitor();
    const root = obj("", [
      str("title"),
      obj("address", [str("city", ["address", "city"])], ["address"]),
    ]);
    walkFieldNode(root, visitor);

    expect(collected).toEqual([
      "string:title",
      "string:address.city",
      "object:address",
      "object:(root)",
    ]);
  });

  it("visits an array node and provides walkItem callback", () => {
    const items: ArrayItem<string>[] = [];
    const visitor: FieldVisitor<string> = {
      string(_n, fn) {
        return fn;
      },
      number(_n, fn) {
        return fn;
      },
      boolean(_n, fn) {
        return fn;
      },
      enum(_n, fn) {
        return fn;
      },
      object(_n, _fn, _c) {
        return "obj";
      },
      array(node, fieldName, walkItem) {
        // Simulate 2 array elements
        for (let i = 0; i < 2; i++) {
          const itemNode: FieldNode = {
            ...node.item,
            name: String(i),
            path: [...node.path, i],
          };
          items.push(walkItem(itemNode));
        }
        return `array:${fieldName}`;
      },
    };

    const root = arr("tags", str("0", ["tags", 0]));
    const result = walkFieldNode(root, visitor);

    expect(result).toBe("array:tags");
    expect(items).toHaveLength(2);
    expect(items[0]?.key).toBe("tags[0]");
    expect(items[0]?.rendered).toBe("tags[0]");
    expect(items[1]?.key).toBe("tags[1]");
    expect(items[1]?.rendered).toBe("tags[1]");
  });

  it("walkItem provides stable keys from pathToString", () => {
    const keys: string[] = [];
    const visitor: FieldVisitor<string> = {
      string(_n, fn) {
        return fn;
      },
      number(_n, fn) {
        return fn;
      },
      boolean(_n, fn) {
        return fn;
      },
      enum(_n, fn) {
        return fn;
      },
      object(_n, fn, _c) {
        return fn;
      },
      array(node, _fn, walkItem) {
        for (let i = 0; i < 3; i++) {
          const itemNode: FieldNode = {
            ...node.item,
            name: String(i),
            path: [...node.path, i],
          };
          keys.push(walkItem(itemNode).key);
        }
        return "arr";
      },
    };

    walkFieldNode(
      arr(
        "speakers",
        obj("0", [str("name", ["speakers", 0, "name"])], ["speakers", 0]),
      ),
      visitor,
    );

    expect(keys).toEqual(["speakers[0]", "speakers[1]", "speakers[2]"]);
  });

  it("returns null when the visitor returns null", () => {
    const visitor: FieldVisitor<string> = {
      string() {
        return null;
      },
      number() {
        return null;
      },
      boolean() {
        return null;
      },
      enum() {
        return null;
      },
      object() {
        return null;
      },
      array() {
        return null;
      },
    };

    expect(walkFieldNode(str("x"), visitor)).toBeNull();
  });

  it("computes fieldName from pathToString for all kinds", () => {
    const fieldNames: string[] = [];
    const visitor: FieldVisitor<string> = {
      string(_n, fn) {
        fieldNames.push(fn);
        return fn;
      },
      number(_n, fn) {
        fieldNames.push(fn);
        return fn;
      },
      boolean(_n, fn) {
        fieldNames.push(fn);
        return fn;
      },
      enum(_n, fn) {
        fieldNames.push(fn);
        return fn;
      },
      object(_n, fn, _c) {
        fieldNames.push(fn);
        return fn;
      },
      array(_n, fn, _wi) {
        fieldNames.push(fn);
        return fn;
      },
    };

    walkFieldNode(str("x", ["a", "b"]), visitor);
    expect(fieldNames).toEqual(["a.b"]);
  });
});
