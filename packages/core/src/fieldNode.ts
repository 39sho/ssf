// ---------------------------------------------------------------------------
// Path types — represent the location of a field within the form tree.
//
// A FieldPath like `["speakers", 0, "name"]` describes the nesting from
// root → "speakers" property → first array element → "name" property.
// `pathToString` converts it to the dot/bracket notation used by form
// libraries: `"speakers[0].name"`.
// ---------------------------------------------------------------------------

/** A single segment of a field path — property name or array index. */
export type FieldKey = string | number;

/** Full path from root to a field, expressed as a sequence of keys. */
export type FieldPath = readonly FieldKey[];

/**
 * Convert a `FieldPath` to the dot/bracket string notation used by form
 * libraries (e.g. TanStack Form, React Hook Form).
 *
 * @example
 * ```ts
 * pathToString(["speakers", 0, "name"]) // → "speakers[0].name"
 * pathToString([])                       // → ""
 * ```
 */
export function pathToString(path: FieldPath): string {
  if (path.length === 0) return "";
  let out = "";
  for (const segment of path) {
    if (typeof segment === "number") {
      out += `[${segment}]`;
      continue;
    }
    if (out.length === 0) {
      out += segment;
    } else {
      out += `.${segment}`;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// FieldKind — the six primitive categories of form fields.
//
// Every JSON Schema type maps to one of these kinds. "integer" becomes
// "number" (the form renders a number input either way), and schemas with
// `enum` or `const` become "enum" regardless of their declared type.
// ---------------------------------------------------------------------------

export type FieldKind =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "object"
  | "array";

// ---------------------------------------------------------------------------
// FieldNode — discriminated union describing form structure.
//
// A FieldNode tree is the **render plan** for a form. Each node carries
// everything a UI component needs: the kind of widget, metadata (label,
// description, format), default value, and structural children (for objects
// and arrays). The tree is built from JSON Schema by `toFieldNode()` and
// walked by `walkFieldNode()`.
// ---------------------------------------------------------------------------

interface BaseFieldNode<K extends FieldKind> {
  kind: K;
  /** Property key in the parent object (empty string for root). */
  name: string;
  /** Full path from root — used for form field binding and key generation. */
  path: FieldPath;
  /** Human-readable label derived from JSON Schema `title`. */
  title?: string;
  /** Help text derived from JSON Schema `description`. */
  description?: string;
  /** Default value derived from JSON Schema `default`. */
  defaultValue?: unknown;
  /**
   * Hint derived from JSON Schema `format` (e.g. `"email"`, `"uri"`,
   * `"date"`, `"textarea"`). UI components can use this to pick the
   * appropriate widget (e.g. `<input type="email">` for `"email"`).
   */
  format?: string;
  /** Whether this field is required by the parent object schema. */
  required: boolean;
  /**
   * Whether this field is read-only, derived from JSON Schema `readOnly`.
   * UI components can use this to disable editing.
   */
  readOnly: boolean;
}

export interface StringFieldNode extends BaseFieldNode<"string"> {}

export interface NumberFieldNode extends BaseFieldNode<"number"> {}

export interface BooleanFieldNode extends BaseFieldNode<"boolean"> {}

export interface EnumFieldNode extends BaseFieldNode<"enum"> {
  /** The set of valid values. Derived from JSON Schema `enum` or `const`. */
  options: readonly unknown[];
}

export interface ObjectFieldNode extends BaseFieldNode<"object"> {
  /** Child fields corresponding to the object's `properties`. */
  properties: readonly FieldNode[];
}

export interface ArrayFieldNode extends BaseFieldNode<"array"> {
  /**
   * Schema for a single array element. At build time the item's path
   * contains a placeholder index (`0`); at render time the framework
   * binding replaces it with the actual index.
   */
  item: FieldNode;
}

export type FieldNode =
  | StringFieldNode
  | NumberFieldNode
  | BooleanFieldNode
  | EnumFieldNode
  | ObjectFieldNode
  | ArrayFieldNode;

// ---------------------------------------------------------------------------
// FieldNode utilities
// ---------------------------------------------------------------------------

/**
 * Return a sensible empty/zero-value default for a given field kind.
 *
 * Used as a last-resort fallback when `extractDefaults` finds no explicit
 * default. The values are intentionally "empty" rather than `undefined` so
 * that form libraries always receive a concrete initial value.
 *
 * | Kind      | Default |
 * |-----------|---------|
 * | string    | `""`    |
 * | number    | `0`     |
 * | boolean   | `false` |
 * | enum      | `null`  |
 * | object    | `{}`    |
 * | array     | `[]`    |
 */
export function defaultForKind(kind: FieldKind): unknown {
  switch (kind) {
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "enum":
      return null;
    case "object":
      return {};
    case "array":
      return [];
  }
}

/**
 * Recursively extract default values from a `FieldNode` tree.
 *
 * For **leaf** nodes (string, number, boolean, enum) the node's
 * `defaultValue` is returned as-is (may be `undefined`).
 *
 * For **object** nodes the defaults of all children are merged into a
 * single object. If no child has a default, the object node's own
 * `defaultValue` is used as a fallback.
 *
 * For **array** nodes the node's `defaultValue` is returned, falling back
 * to an empty array `[]`.
 *
 * @example
 * ```ts
 * // Given a FieldNode tree from: z.object({ name: z.string().default("") })
 * extractDefaults(root) // → { name: "" }
 * ```
 */
export function extractDefaults(node: FieldNode): unknown {
  switch (node.kind) {
    case "object": {
      const obj: Record<string, unknown> = {};
      for (const child of node.properties) {
        const val = extractDefaults(child);
        if (val !== undefined) {
          obj[child.name] = val;
        }
      }
      // Prefer assembled child defaults over the object-level fallback.
      return Object.keys(obj).length > 0 ? obj : node.defaultValue;
    }
    case "array":
      return node.defaultValue ?? [];
    default:
      return node.defaultValue;
  }
}
