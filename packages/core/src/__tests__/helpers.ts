import type {
  ArrayFieldNode,
  FieldNode,
  ObjectFieldNode,
  StringFieldNode,
} from "../fieldNode";

// ---------------------------------------------------------------------------
// Minimal FieldNode factories for testing
// ---------------------------------------------------------------------------

export function str(
  name: string,
  defaultValue?: unknown,
  path: (string | number)[] = [name],
): StringFieldNode {
  return {
    kind: "string",
    name,
    path,
    required: false,
    readOnly: false,
    defaultValue,
  };
}

export function num(name: string, defaultValue?: unknown): FieldNode {
  return {
    kind: "number",
    name,
    path: [name],
    required: false,
    readOnly: false,
    defaultValue,
  };
}

export function bool(name: string, defaultValue?: unknown): FieldNode {
  return {
    kind: "boolean",
    name,
    path: [name],
    required: false,
    readOnly: false,
    defaultValue,
  };
}

export function obj(
  name: string,
  properties: FieldNode[],
  defaultValue?: unknown,
  path: (string | number)[] = name ? [name] : [],
): ObjectFieldNode {
  return {
    kind: "object",
    name,
    path,
    required: false,
    readOnly: false,
    properties,
    defaultValue,
  };
}

export function arr(
  name: string,
  item: FieldNode,
  defaultValue?: unknown,
  path: (string | number)[] = [name],
): ArrayFieldNode {
  return {
    kind: "array",
    name,
    path,
    required: false,
    readOnly: false,
    item,
    defaultValue,
  };
}
