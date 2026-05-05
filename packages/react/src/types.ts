import type {
  ArrayFieldNode,
  ArrayItem,
  FieldKind,
  ObjectFieldNode,
} from "@39sho/ssf-core";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { ComponentType, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Component name convention: kind -> registered component name
// ---------------------------------------------------------------------------

export const FIELD_KIND_TO_COMPONENT_NAME = {
  string: "TextField",
  number: "NumberField",
  boolean: "BooleanField",
  enum: "EnumField",
  object: "ObjectField",
  array: "ArrayField",
} as const satisfies Record<FieldKind, string>;

export type FieldComponentName =
  (typeof FIELD_KIND_TO_COMPONENT_NAME)[FieldKind];

// ---------------------------------------------------------------------------
// FieldComponentProps — per-kind props passed to user-supplied components
// ---------------------------------------------------------------------------

export interface TextFieldComponentProps {
  fieldNode: {
    kind: "string";
    name: string;
    title?: string;
    description?: string;
    required: boolean;
    format?: string;
  };
}

export interface NumberFieldComponentProps {
  fieldNode: {
    kind: "number";
    name: string;
    title?: string;
    description?: string;
    required: boolean;
  };
}

export interface BooleanFieldComponentProps {
  fieldNode: {
    kind: "boolean";
    name: string;
    title?: string;
    description?: string;
    required: boolean;
  };
}

export interface EnumFieldComponentProps {
  fieldNode: {
    kind: "enum";
    name: string;
    title?: string;
    description?: string;
    required: boolean;
    options: readonly (string | number | boolean)[];
  };
}

export interface ObjectFieldComponentProps {
  fieldNode: ObjectFieldNode;
  /** Pre-rendered child fields (recursively rendered by AutoFields). */
  children: ReactNode;
}

export interface ArrayFieldComponentProps {
  fieldNode: ArrayFieldNode;
  /** Pre-rendered items with stable keys (one entry per array element). */
  items: readonly ArrayItem<ReactNode>[];
}

// ---------------------------------------------------------------------------
// ArrayItem — re-exported from core for consumer convenience
// ---------------------------------------------------------------------------

export type { ArrayItem } from "@39sho/ssf-core";

// ---------------------------------------------------------------------------
// AutoFieldsProps
// ---------------------------------------------------------------------------

/** Minimal form API surface required by AutoFields (useAppForm result). */
export interface FormApiLike {
  AppField: ComponentType<{
    name: string;
    mode?: "array";
    children: (field: AnyFieldApi) => ReactNode;
  }>;
}

export interface AutoFieldsProps {
  /**
   * A TanStack Form instance returned from `useAppForm`.
   * AutoFields only needs `form.AppField` to bind each field.
   */
  form: FormApiLike;
  /** Pre-built FieldNode tree from `getSsfFormOptions(schema).rootNode`. */
  rootNode: ObjectFieldNode;
}

export type { AnyFieldApi } from "@tanstack/react-form";
