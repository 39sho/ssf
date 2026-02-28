import type { FieldApi, FieldNode, FieldVisitor } from "@39sho/ssf-core";
import {
  defaultForKind,
  extractDefaults,
  flattenErrors,
  toFieldNode,
  walkFieldNode,
} from "@39sho/ssf-core";
import {
  type AnyFieldApi,
  revalidateLogic,
  useForm,
  useStore,
} from "@tanstack/react-form";
import { type JSX, useMemo } from "react";
import type {
  AutoFormProps,
  CreateAutoFormProps,
  FieldComponents,
} from "./types";

// ---------------------------------------------------------------------------
// TanStack AnyFieldApi → core FieldApi adapter
// ---------------------------------------------------------------------------

function createFieldApi<TValue>(raw: AnyFieldApi): FieldApi<TValue> {
  return {
    get value(): TValue {
      return raw.state.value;
    },
    get errors() {
      return flattenErrors(raw.state.meta.errors);
    },
    get isTouched() {
      return raw.state.meta.isTouched;
    },
    get isDirty() {
      return raw.state.meta.isDirty;
    },
    get isValidating() {
      return raw.state.meta.isValidating;
    },
    handleChange(value: TValue) {
      raw.handleChange(value);
    },
    handleBlur() {
      raw.handleBlur();
    },
  };
}

// ---------------------------------------------------------------------------
// React visitor — maps each field kind to the user-supplied component
// via TanStack Form's Field binding.
// ---------------------------------------------------------------------------

/** TanStack's `form.Field` component, typed loosely. */
type FormField = React.ComponentType<{
  name: string;
  children: (field: AnyFieldApi) => React.ReactNode;
}>;

function createReactVisitor(
  components: FieldComponents,
  Field: FormField,
): FieldVisitor<JSX.Element | null> {
  return {
    string(node, fieldName) {
      const C = components.string;
      if (!C) return null;
      return (
        <Field key={fieldName} name={fieldName}>
          {(raw: AnyFieldApi) => (
            <C fieldNode={node} field={createFieldApi(raw)} />
          )}
        </Field>
      );
    },
    number(node, fieldName) {
      const C = components.number;
      if (!C) return null;
      return (
        <Field key={fieldName} name={fieldName}>
          {(raw: AnyFieldApi) => (
            <C fieldNode={node} field={createFieldApi(raw)} />
          )}
        </Field>
      );
    },
    boolean(node, fieldName) {
      const C = components.boolean;
      if (!C) return null;
      return (
        <Field key={fieldName} name={fieldName}>
          {(raw: AnyFieldApi) => (
            <C fieldNode={node} field={createFieldApi(raw)} />
          )}
        </Field>
      );
    },
    enum(node, fieldName) {
      const C = components.enum;
      if (!C) return null;
      return (
        <Field key={fieldName} name={fieldName}>
          {(raw: AnyFieldApi) => (
            <C fieldNode={node} field={createFieldApi(raw)} />
          )}
        </Field>
      );
    },

    object(node, fieldName, children) {
      const C = components.object;
      if (!C) return null;

      if (node.path.length === 0) {
        return <C fieldNode={node}>{children}</C>;
      }

      return (
        <Field key={fieldName} name={fieldName}>
          {(raw: AnyFieldApi) => (
            <C fieldNode={node} field={createFieldApi(raw)}>
              {children}
            </C>
          )}
        </Field>
      );
    },

    array(node, fieldName, walkItem) {
      const C = components.array;
      if (!C) return null;

      return (
        <Field key={fieldName} name={fieldName}>
          {(raw: AnyFieldApi) => {
            const arr: unknown[] = Array.isArray(raw.state.value)
              ? raw.state.value
              : [];

            const items = arr.map((_, index) => {
              const itemNode: FieldNode = {
                ...node.item,
                name: String(index),
                path: [...node.path, index],
              };
              return walkItem(itemNode);
            });

            return (
              <C
                fieldNode={node}
                field={createFieldApi(raw)}
                items={items}
                onPush={(value?: unknown) => {
                  raw.pushValue(
                    value ??
                      extractDefaults(node.item) ??
                      defaultForKind(node.item.kind),
                  );
                }}
                onRemove={(index: number) => {
                  raw.removeValue(index);
                }}
              />
            );
          }}
        </Field>
      );
    },
  };
}

// ---------------------------------------------------------------------------
// AutoForm
// ---------------------------------------------------------------------------

/**
 * Create an AutoForm component with a pre-configured component map.
 *
 * ```tsx
 * const AutoForm = createAutoForm({ string: StringField, number: NumberField });
 * <AutoForm schema={schema} onSubmit={handleSubmit} />
 * ```
 */
export function createAutoForm(components: FieldComponents) {
  return function BoundAutoForm<TInput, TOutput = TInput>(
    props: CreateAutoFormProps<TInput, TOutput>,
  ): JSX.Element {
    return <AutoForm {...props} components={components} />;
  };
}

export function AutoForm<TInput, TOutput = TInput>({
  schema,
  components,
  onSubmit,
  formActions,
}: AutoFormProps<TInput, TOutput>): JSX.Element {
  const rootNode = useMemo(() => toFieldNode(schema), [schema]);

  // extractDefaults returns `unknown` since the FieldNode tree is untyped at
  // runtime. We know it matches TInput because it was derived from the same
  // schema, so the cast is sound.
  const defaultValues = useMemo(
    () => (rootNode ? (extractDefaults(rootNode) as TInput) : undefined),
    [rootNode],
  );

  const form = useForm({
    defaultValues: defaultValues as TInput,
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: schema,
      onDynamic: schema,
    },
    onSubmit: async ({ value }) => {
      // After Standard Schema validation, `value` is the validated output.
      // TanStack types it as TInput but our schema guarantees TOutput.
      await onSubmit(value as unknown as TOutput);
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  if (!rootNode || rootNode.kind !== "object") {
    return <div>AutoForm: root schema must be an object.</div>;
  }

  const visitor = createReactVisitor(components, form.Field);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      {walkFieldNode(rootNode, visitor)}
      {formActions ? (
        formActions({
          isSubmitting,
          reset: () => form.reset(),
        })
      ) : (
        <button type="submit">Submit</button>
      )}
    </form>
  );
}
