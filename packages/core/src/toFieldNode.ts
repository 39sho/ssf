import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import type { JSONSchema7, JSONSchema7TypeName } from "json-schema";

import type { ArrayFieldNode, FieldNode, FieldPath } from "./fieldNode";
import { pathToString } from "./fieldNode";
import { assertNever } from "./utils";

// ---------------------------------------------------------------------------
// JSON Schema Draft-07 target — used when requesting the JSON Schema
// representation from a Standard Schema provider (Zod, Valibot, etc.).
// We always request Draft-07 because our internal types (`JSONSchema7`) match
// this draft and we validate/extract fields accordingly.
// ---------------------------------------------------------------------------

const JSON_SCHEMA_TARGET: StandardJSONSchemaV1.Target = "draft-07";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Narrow a `JSONSchema7Definition` (`JSONSchema7 | boolean`) to `JSONSchema7`. */
function isSchema(value: unknown): value is JSONSchema7 {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Build a human-readable location string for warning messages.
 * e.g. `at "speakers[0].name"` or `at root`.
 */
function locationLabel(path: FieldPath): string {
  const p = pathToString(path);
  return p ? `at "${p}"` : "at root";
}

// ---------------------------------------------------------------------------
// Unsupported keyword detection
// ---------------------------------------------------------------------------

/**
 * JSON Schema keywords that affect the **structure or type** of a value but
 * are not yet handled by SSF. When any of these appear in a schema we emit
 * a one-time warning so the user knows why a field may be missing or
 * incomplete. Pure *validation* constraints (minLength, pattern, …) are
 * intentionally omitted — they don't change the rendered form structure.
 */
const UNSUPPORTED_STRUCTURAL_KEYWORDS = new Set<string>([
  // Composition — could change the type/shape of a value
  "oneOf",
  "anyOf",
  "allOf",
  "not",
  // Conditional
  "if",
  "then",
  "else",
  // Reference
  "$ref",
  // Other structural
  "patternProperties",
  "additionalProperties",
  "dependencies",
  "propertyNames",
]);

/**
 * Emit a warning for each unsupported structural keyword found in `schema`.
 * We only warn — the field is still built from whatever we *can* interpret.
 */
function warnUnsupportedKeywords(schema: JSONSchema7, path: FieldPath): void {
  for (const key of Object.keys(schema)) {
    if (UNSUPPORTED_STRUCTURAL_KEYWORDS.has(key)) {
      console.warn(
        `[ssf] Unsupported JSON Schema keyword "${key}" ${locationLabel(path)}. ` +
          "This keyword is ignored; the field may not render as expected.",
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Kind inference
// ---------------------------------------------------------------------------

/** JSON Schema type names that map to a FieldKind (everything except "null"). */
type SupportedType = Exclude<JSONSchema7TypeName, "null">;

function isSupportedType(v: JSONSchema7TypeName): v is SupportedType {
  return v !== "null";
}

/**
 * Map a JSON Schema type name to the corresponding `FieldKind`.
 * "integer" is treated as "number" since the form renders a number input
 * either way.
 */
function typeToKind(type: SupportedType): FieldNode["kind"] {
  if (type === "integer") return "number";
  return type;
}

/**
 * Determine the `FieldKind` from a JSON Schema.
 *
 * Priority:
 * 1. `const` → treat as a single-option enum
 * 2. `enum` → "enum"
 * 3. `type` (string or first entry if array) → mapped kind
 * 4. otherwise → "unknown" (the caller will skip the field with a warning)
 */
function inferKind(schema: JSONSchema7): FieldNode["kind"] | "unknown" {
  // `const` is a single-value enumeration
  if (schema.const !== undefined) return "enum";
  // `enum` takes priority over `type`
  if (schema.enum) return "enum";

  const { type } = schema;
  if (typeof type === "string" && isSupportedType(type))
    return typeToKind(type);
  if (Array.isArray(type)) {
    const first = type.find(isSupportedType);
    if (first) return typeToKind(first);
  }
  return "unknown";
}

// ---------------------------------------------------------------------------
// Per-kind builders
// ---------------------------------------------------------------------------

interface BaseNode {
  name: string;
  path: FieldPath;
  title?: string;
  description?: string;
  defaultValue?: unknown;
  format?: string;
  required: boolean;
  readOnly: boolean;
}

function buildStringNode(base: BaseNode): FieldNode {
  return { ...base, kind: "string" };
}

function buildNumberNode(base: BaseNode): FieldNode {
  return { ...base, kind: "number" };
}

function buildBooleanNode(base: BaseNode): FieldNode {
  return { ...base, kind: "boolean" };
}

function buildEnumNode(base: BaseNode, schema: JSONSchema7): FieldNode {
  return {
    ...base,
    kind: "enum",
    // `const` → single-option array, `enum` → the array as-is
    options: schema.const !== undefined ? [schema.const] : (schema.enum ?? []),
  };
}

function buildObjectNode(
  base: BaseNode,
  schema: JSONSchema7,
): FieldNode | undefined {
  const requiredKeys = new Set(schema.required ?? []);
  const properties: FieldNode[] = [];
  for (const [key, value] of Object.entries(schema.properties ?? {})) {
    if (!isSchema(value)) continue;
    const child = buildNode(
      value,
      key,
      [...base.path, key],
      requiredKeys.has(key),
    );
    if (child) properties.push(child);
  }
  return { ...base, kind: "object", properties };
}

function buildArrayNode(
  base: BaseNode,
  schema: JSONSchema7,
): FieldNode | undefined {
  const rawItem = schema.items;

  // Tuple validation (items is an array of schemas) is not supported.
  if (Array.isArray(rawItem)) {
    console.warn(
      `[ssf] Tuple-style "items" (array of schemas) is not supported ` +
        `${locationLabel(base.path)}. Only single-schema "items" is handled.`,
    );
    return undefined;
  }

  const itemSchema: JSONSchema7 = isSchema(rawItem) ? rawItem : {};
  const item = buildNode(itemSchema, "0", [...base.path, 0], false);
  if (!item) return undefined;
  return { ...base, kind: "array", item } satisfies ArrayFieldNode;
}

// ---------------------------------------------------------------------------
// FieldNode tree builder
// ---------------------------------------------------------------------------

/**
 * Recursively convert a single JSON Schema node into a `FieldNode`.
 *
 * Returns `undefined` when the schema cannot be represented (unsupported
 * type, broken items, etc.) — the caller simply omits that field.
 */
function buildNode(
  schema: JSONSchema7,
  name: string,
  path: FieldPath,
  required: boolean,
): FieldNode | undefined {
  warnUnsupportedKeywords(schema, path);

  const kind = inferKind(schema);
  if (kind === "unknown") {
    console.warn(
      `[ssf] Could not determine field type ${locationLabel(path)}. Skipping.`,
    );
    return undefined;
  }

  const base: BaseNode = {
    name,
    path,
    title: schema.title,
    description: schema.description,
    defaultValue: schema.default,
    format: schema.format,
    required,
    readOnly: schema.readOnly ?? false,
  };

  switch (kind) {
    case "string":
      return buildStringNode(base);
    case "number":
      return buildNumberNode(base);
    case "boolean":
      return buildBooleanNode(base);
    case "enum":
      return buildEnumNode(base, schema);
    case "object":
      return buildObjectNode(base, schema);
    case "array":
      return buildArrayNode(base, schema);
    default:
      return assertNever(kind);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert a Standard Schema (that also exposes JSON Schema via
 * `StandardJSONSchemaV1`) into a `FieldNode` tree suitable for form rendering.
 *
 * The function requests a **JSON Schema Draft-07** representation from the
 * schema provider and maps it to a `FieldNode` tree. Unsupported keywords
 * are reported via `console.warn`.
 *
 * Returns `undefined` if the root schema cannot be converted.
 *
 * @example
 * ```ts
 * import z from "zod";
 * import { toFieldNode } from "@39sho/ssf-core";
 *
 * const schema = z.object({ name: z.string().default("") });
 * const root = toFieldNode(schema);
 * ```
 */
export function toFieldNode(
  schema: StandardJSONSchemaV1,
): FieldNode | undefined {
  const raw = schema["~standard"].jsonSchema.input({
    target: JSON_SCHEMA_TARGET,
  });
  if (!isSchema(raw)) {
    console.warn(
      "[ssf] Could not extract a valid JSON Schema from the provided schema.",
    );
    return undefined;
  }
  return buildNode(raw, "", [], false);
}
