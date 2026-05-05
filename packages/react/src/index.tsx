// Re-export core types & utilities that React consumers commonly need
export type {
  ArrayFieldNode,
  BooleanFieldNode,
  EnumFieldNode,
  FieldKind,
  FieldNode,
  NumberFieldNode,
  ObjectFieldNode,
  StringFieldNode,
} from "@39sho/ssf-core";
export { cloneArrayItem, extractDefaults } from "@39sho/ssf-core";

// Re-export peer-dependency type for convenience
export type { AnyFieldApi } from "@tanstack/react-form";

// React components
export { AutoFields } from "./AutoFields";
export { getSsfFormOptions } from "./getSsfFormOptions";

// React-specific types
export type {
  ArrayFieldComponentProps,
  ArrayItem,
  AutoFieldsProps,
  BooleanFieldComponentProps,
  EnumFieldComponentProps,
  FieldComponentName,
  NumberFieldComponentProps,
  ObjectFieldComponentProps,
  TextFieldComponentProps,
} from "./types";
export { FIELD_KIND_TO_COMPONENT_NAME } from "./types";
