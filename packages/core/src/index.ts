// FieldNode tree, path utilities & defaults

// Re-export Standard Schema types so consumers don't need @standard-schema/spec directly
export type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
} from "@standard-schema/spec";
export type {
  ArrayFieldNode,
  BooleanFieldNode,
  EnumFieldNode,
  FieldKey,
  FieldKind,
  FieldNode,
  FieldPath,
  NumberFieldNode,
  ObjectFieldNode,
  StringFieldNode,
} from "./fieldNode";
export {
  cloneArrayItem,
  defaultForKind,
  extractDefaults,
  pathToString,
} from "./fieldNode";
// Schema → FieldNode conversion
export { toFieldNode } from "./toFieldNode";
// Error utility
export { flattenErrors } from "./types";
// Internal runtime assertion (exported for advanced consumers)
export { assertNever } from "./utils";
// Recursive tree walker
export type { ArrayItem, FieldVisitor } from "./walk";
export { walkFieldNode } from "./walk";
