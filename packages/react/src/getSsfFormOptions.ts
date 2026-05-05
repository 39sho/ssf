import type { ObjectFieldNode } from "@39sho/ssf-core";
import { extractDefaults, toFieldNode } from "@39sho/ssf-core";
import type { StandardJSONSchemaV1 } from "@standard-schema/spec";

/**
 * Convert a Standard JSON Schema into the data SSF needs for form generation.
 *
 * Returns `undefined` for both fields when the root schema is not an object.
 *
 * @example
 * ```ts
 * const { rootNode, defaultValues } = getSsfFormOptions(schema);
 * const form = useForm({ defaultValues, ... });
 * ```
 */
/**
 * Strip `undefined` values from the default-values object before passing
 * it to TanStack Form. When an `input[type="number"]` is empty, the HTML
 * API produces `NaN`; React controlled-component handling can cause an
 * infinite re-render loop if the initial value is `undefined` for a number
 * field. Removing `undefined` defaults lets the field start empty and
 * avoids that edge case.
 */
function omitUndefinedValues(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

export function getSsfFormOptions<TInput = unknown, TOutput = TInput>(
  schema: StandardJSONSchemaV1<TInput, TOutput>,
): {
  rootNode: ObjectFieldNode | undefined;
  defaultValues: TInput | undefined;
} {
  const rootNode = toFieldNode(schema);
  if (!rootNode || rootNode.kind !== "object") {
    return { rootNode: undefined, defaultValues: undefined };
  }
  const defaults = extractDefaults(rootNode) as Record<string, unknown>;
  return {
    rootNode,
    defaultValues: omitUndefinedValues(defaults) as TInput,
  };
}
