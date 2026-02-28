import type {
  ArrayItem,
  FieldApi,
  FieldKind,
  FieldNode,
  FieldValueMap,
  FormActionsProps,
} from "@39sho/ssf-core";
import type { ComponentType } from "react";

// ---------------------------------------------------------------------------
// FieldComponentProps — per-kind props passed to user-supplied components
// ---------------------------------------------------------------------------

/** Extracts the FieldNode subtype for a given kind. */
type FieldNodeFor<K extends FieldKind> = Extract<FieldNode, { kind: K }>;

/** Base props shared across every field component. */
interface BaseFieldComponentProps<K extends FieldKind> {
  fieldNode: FieldNodeFor<K>;
  field: FieldApi<FieldValueMap[K]>;
}

export interface StringFieldComponentProps
  extends BaseFieldComponentProps<"string"> {}

export interface NumberFieldComponentProps
  extends BaseFieldComponentProps<"number"> {}

export interface BooleanFieldComponentProps
  extends BaseFieldComponentProps<"boolean"> {}

export interface EnumFieldComponentProps
  extends BaseFieldComponentProps<"enum"> {}

export interface ObjectFieldComponentProps {
  fieldNode: FieldNodeFor<"object">;
  /**
   * Field API for this object. `undefined` for the root object since it is
   * not bound to a TanStack Form field.
   */
  field?: FieldApi<FieldValueMap["object"]>;
  /** Pre-rendered child fields (recursively rendered by AutoForm). */
  children: React.ReactNode;
}

export interface ArrayFieldComponentProps
  extends BaseFieldComponentProps<"array"> {
  /** Pre-rendered items with stable keys (one entry per array element). */
  items: readonly ArrayItem<React.ReactNode>[];
  /** Append a new item with optional initial value. */
  onPush: (value?: unknown) => void;
  /** Remove the item at given index. */
  onRemove: (index: number) => void;
}

/** Union of all field component props, keyed by kind. */
export interface FieldComponentPropsMap {
  string: StringFieldComponentProps;
  number: NumberFieldComponentProps;
  boolean: BooleanFieldComponentProps;
  enum: EnumFieldComponentProps;
  object: ObjectFieldComponentProps;
  array: ArrayFieldComponentProps;
}

// ---------------------------------------------------------------------------
// FieldComponents — user-supplied component map
// ---------------------------------------------------------------------------

/**
 * A mapping from FieldKind to the React component that should render it.
 *
 * All entries are optional — kinds without a matching component are skipped.
 */
export type FieldComponents = {
  [K in FieldKind]?: ComponentType<FieldComponentPropsMap[K]>;
};

// ---------------------------------------------------------------------------
// AutoFormProps
// ---------------------------------------------------------------------------

export interface AutoFormProps<TInput, TOutput = TInput> {
  /**
   * A Standard Schema that supports both validation and JSON Schema generation.
   * Typically a Zod, Valibot, or ArkType schema.
   */
  schema: import("@standard-schema/spec").StandardSchemaV1<TInput, TOutput> &
    import("@standard-schema/spec").StandardJSONSchemaV1<TInput, TOutput>;
  /** Component map for rendering each field kind. */
  components: FieldComponents;
  /** Called with the validated output value on successful submit. */
  onSubmit: (value: TOutput) => void | Promise<void>;
  /**
   * Optional render prop for the form action buttons (submit, reset, etc.).
   * If omitted, a default submit button is rendered.
   */
  formActions?: (props: FormActionsProps) => React.ReactNode;
}

/** Props accepted by an AutoForm component created via `createAutoForm`. */
export type CreateAutoFormProps<TInput, TOutput = TInput> = Omit<
  AutoFormProps<TInput, TOutput>,
  "components"
>;
