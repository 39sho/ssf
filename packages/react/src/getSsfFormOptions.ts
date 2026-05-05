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
  const defaultValues = extractDefaults(rootNode) as TInput;
  return { rootNode, defaultValues };
}
