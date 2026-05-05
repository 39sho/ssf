import type { FieldVisitor } from "@39sho/ssf-core";
import { cloneArrayItem, walkFieldNode } from "@39sho/ssf-core";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { ComponentType, JSX } from "react";
import type { AutoFieldsProps } from "./types";
import { FIELD_KIND_TO_COMPONENT_NAME } from "./types";

// ---------------------------------------------------------------------------
// Helper: resolve a component from the field API by kind
// ---------------------------------------------------------------------------

/**
 * TanStack Form's `createFormHook` attaches user-registered components
 * directly onto the `field` object (e.g. `field.TextField`). Because the
 * exact component names are user-defined, we use a dynamic property lookup
 * here. The cast is safe at runtime because `createFormHook` guarantees
 * the components exist on the field API when used with `AppField`.
 */
function getComponent(
  field: AnyFieldApi,
  kind: keyof typeof FIELD_KIND_TO_COMPONENT_NAME,
): ComponentType<any> | undefined {
  const name = FIELD_KIND_TO_COMPONENT_NAME[kind];
  const extended = field as AnyFieldApi & Record<string, ComponentType<any>>;
  return extended[name];
}

// ---------------------------------------------------------------------------
// React visitor — maps each field kind to the user-supplied component
// via TanStack Form's AppField binding.
// ---------------------------------------------------------------------------

function createReactVisitor(
  form: AutoFieldsProps["form"],
): FieldVisitor<JSX.Element | null> {
  return {
    string(node, fieldName) {
      return (
        <form.AppField key={fieldName} name={fieldName}>
          {(field: AnyFieldApi) => {
            const C = getComponent(field, "string");
            if (!C) return null;
            return <C fieldNode={node} />;
          }}
        </form.AppField>
      );
    },

    number(node, fieldName) {
      return (
        <form.AppField key={fieldName} name={fieldName}>
          {(field: AnyFieldApi) => {
            const C = getComponent(field, "number");
            if (!C) return null;
            return <C fieldNode={node} />;
          }}
        </form.AppField>
      );
    },

    boolean(node, fieldName) {
      return (
        <form.AppField key={fieldName} name={fieldName}>
          {(field: AnyFieldApi) => {
            const C = getComponent(field, "boolean");
            if (!C) return null;
            return <C fieldNode={node} />;
          }}
        </form.AppField>
      );
    },

    enum(node, fieldName) {
      return (
        <form.AppField key={fieldName} name={fieldName}>
          {(field: AnyFieldApi) => {
            const C = getComponent(field, "enum");
            if (!C) return null;
            return <C fieldNode={node} />;
          }}
        </form.AppField>
      );
    },

    object(node, fieldName, children) {
      return (
        <form.AppField key={fieldName} name={fieldName}>
          {(field: AnyFieldApi) => {
            const C = getComponent(field, "object");
            if (!C) return null;
            return <C fieldNode={node}>{children}</C>;
          }}
        </form.AppField>
      );
    },

    array(node, fieldName, walkItem) {
      return (
        <form.AppField key={fieldName} name={fieldName} mode="array">
          {(field: AnyFieldApi) => {
            const C = getComponent(field, "array");
            if (!C) return null;

            const arr: unknown[] = Array.isArray(field.state.value)
              ? field.state.value
              : [];

            const items = arr.map((_, index) =>
              walkItem(cloneArrayItem(node, index)),
            );

            return <C fieldNode={node} items={items} />;
          }}
        </form.AppField>
      );
    },
  };
}

// ---------------------------------------------------------------------------
// AutoFields
// ---------------------------------------------------------------------------

/**
 * Recursively render fields from a FieldNode tree using TanStack Form's
 * `AppField` mechanism. The root object is rendered as a flat list of
 * children so that consumers own the `<form>` wrapper and any root-level
 * layout.
 *
 * This component expects `useAppForm` (not raw `useForm`) and that the
 * corresponding `fieldComponents` have been registered via
 * `createFormHook` with the standard SSF names:
 *   TextField, NumberField, BooleanField, EnumField, ObjectField, ArrayField
 */
export function AutoFields({
  form,
  rootNode,
}: AutoFieldsProps): JSX.Element | null {
  const visitor = createReactVisitor(form);

  // Render the root object's children directly — do not invoke
  // ObjectField for the root so that consumers remain in control
  // of the outer wrapper.
  const children = rootNode.properties.map((child) =>
    walkFieldNode(child, visitor),
  );

  return <>{children}</>;
}
