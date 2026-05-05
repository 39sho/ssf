// ---------------------------------------------------------------------------
// Error flattening
// ---------------------------------------------------------------------------

/** Type guard: check if a value is an object with a string `message` property. */
function hasMessage(v: unknown): v is { message: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    "message" in v &&
    typeof v.message === "string"
  );
}

/**
 * Convert an array of mixed validation errors (strings, objects with
 * `.message`, etc.) into a flat string array. Works with TanStack Form's
 * `ValidationError` (`unknown`) type.
 */
export function flattenErrors(errors: readonly unknown[]): string[] {
  const out: string[] = [];
  for (const err of errors) {
    if (typeof err === "string") {
      out.push(err);
    } else if (hasMessage(err)) {
      out.push(err.message);
    }
  }
  return out;
}
