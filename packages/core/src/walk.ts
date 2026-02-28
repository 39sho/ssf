import type {
  ArrayFieldNode,
  BooleanFieldNode,
  EnumFieldNode,
  FieldNode,
  NumberFieldNode,
  ObjectFieldNode,
  StringFieldNode,
} from "./fieldNode";
import { pathToString } from "./fieldNode";

// ---------------------------------------------------------------------------
// ArrayItem — keyed render output for array elements
// ---------------------------------------------------------------------------

/**
 * A rendered array item paired with a stable `key` derived from the item's
 * field path (e.g. `"speakers[0]"`).  Framework bindings pass these to the
 * user-supplied array component so it can use `key` directly — no need to
 * fall back to array indices.
 */
export interface ArrayItem<R> {
  /** Stable key derived from `pathToString(itemNode.path)`. */
  key: string;
  /** The rendered output for this array element. */
  rendered: R | null;
}

// ---------------------------------------------------------------------------
// FieldVisitor — framework-agnostic callback interface
// ---------------------------------------------------------------------------

/**
 * Callbacks invoked by `walkFieldNode` for each kind of field.
 *
 * `R` is the render output type — `JSX.Element | null` for React,
 * `VNode | null` for Vue, etc.
 *
 * Each callback receives the `fieldName` (dot/bracket path string for form
 * library binding, e.g. `"address.city"` or `"items[0]"`).
 */
export interface FieldVisitor<R> {
  string(node: StringFieldNode, fieldName: string): R | null;
  number(node: NumberFieldNode, fieldName: string): R | null;
  boolean(node: BooleanFieldNode, fieldName: string): R | null;
  enum(node: EnumFieldNode, fieldName: string): R | null;
  /**
   * @param children — pre-rendered child fields (recursively walked).
   */
  object(
    node: ObjectFieldNode,
    fieldName: string,
    children: (R | null)[],
  ): R | null;
  /**
   * @param walkItem — call this for each array element to recursively render
   *   the item. Returns an `ArrayItem<R>` with a stable key and the rendered
   *   output. The `itemNode` has the correct index-based path already set.
   */
  array(
    node: ArrayFieldNode,
    fieldName: string,
    walkItem: (itemNode: FieldNode) => ArrayItem<R>,
  ): R | null;
}

// ---------------------------------------------------------------------------
// walkFieldNode
// ---------------------------------------------------------------------------

/**
 * Recursively walk a `FieldNode` tree, invoking the appropriate visitor
 * callback for each node. This keeps the recursive rendering logic in core
 * so that framework bindings (React, Vue, etc.) only need to provide a flat
 * set of callbacks.
 */
export function walkFieldNode<R>(
  node: FieldNode,
  visitor: FieldVisitor<R>,
): R | null {
  const fieldName = pathToString(node.path);

  switch (node.kind) {
    case "string":
      return visitor.string(node, fieldName);
    case "number":
      return visitor.number(node, fieldName);
    case "boolean":
      return visitor.boolean(node, fieldName);
    case "enum":
      return visitor.enum(node, fieldName);

    case "object": {
      const children = node.properties.map((child) =>
        walkFieldNode(child, visitor),
      );
      return visitor.object(node, fieldName, children);
    }

    case "array":
      return visitor.array(node, fieldName, (itemNode) => ({
        key: pathToString(itemNode.path),
        rendered: walkFieldNode(itemNode, visitor),
      }));
  }
}
