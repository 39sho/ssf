// ---------------------------------------------------------------------------
// FieldApi — thin abstraction over the underlying form library's field state
// ---------------------------------------------------------------------------

export interface FieldApi<TValue = unknown> {
  /** Current field value. */
  readonly value: TValue;
  /** Flat list of validation error messages. */
  readonly errors: readonly string[];
  /** Whether the user has interacted with this field. */
  readonly isTouched: boolean;
  /** Whether the value differs from the initial value. */
  readonly isDirty: boolean;
  /** Whether async validation is in progress. */
  readonly isValidating: boolean;
  /** Update the field value. */
  handleChange(value: TValue): void;
  /** Notify that the field lost focus. */
  handleBlur(): void;
}

// ---------------------------------------------------------------------------
// FieldValueMap — maps FieldKind to its primary value type
// ---------------------------------------------------------------------------

/** Maps a FieldKind to its primary value type. */
export interface FieldValueMap {
  string: string;
  number: number;
  boolean: boolean;
  enum: unknown;
  object: Record<string, unknown>;
  array: unknown[];
}

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

// ---------------------------------------------------------------------------
// FormActionsProps
// ---------------------------------------------------------------------------

/** State passed to the `formActions` render prop. */
export interface FormActionsProps {
  /** Whether the form is currently submitting. */
  isSubmitting: boolean;
  /** Reset the form to its default values. */
  reset: () => void;
}
