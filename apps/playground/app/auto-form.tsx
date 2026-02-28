/**
 * SSF field components and AutoForm instance.
 *
 * Each field component maps a FieldNode kind to a React component using
 * shadcn/ui primitives. `createAutoForm` wires them together so you can
 * render any Zod schema as a form with `<AutoForm schema={...} />`.
 */

import type { FormActionsProps, StringFieldNode } from "@ssf/core";
import {
  type ArrayFieldComponentProps,
  type BooleanFieldComponentProps,
  createAutoForm,
  type EnumFieldComponentProps,
  type NumberFieldComponentProps,
  type ObjectFieldComponentProps,
  type StringFieldComponentProps,
} from "@ssf/react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert SSF error strings to the shape expected by shadcn FieldError. */
function toFieldErrors(errors: readonly string[]) {
  return errors.map((msg) => ({ message: msg }));
}

/** Map `format` metadata (email, date, etc.) to an HTML input type. */
function inputTypeForFormat(node: StringFieldNode): string {
  switch (node.format) {
    case "email":
      return "email";
    case "uri":
    case "url":
      return "url";
    case "date":
      return "date";
    case "time":
      return "time";
    case "date-time":
      return "datetime-local";
    case "password":
      return "password";
    default:
      return "text";
  }
}

function RequiredMark({ required }: { required: boolean }) {
  if (!required) return null;
  return (
    <span className="text-destructive ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

function labelFor(node: { title?: string; name: string; required: boolean }) {
  return (
    <>
      {node.title ?? node.name}
      <RequiredMark required={node.required} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Field components — one per FieldNode kind
// ---------------------------------------------------------------------------

function StringField({ fieldNode, field }: StringFieldComponentProps) {
  const isInvalid = field.isTouched && field.errors.length > 0;
  const isTextarea = fieldNode.format === "textarea";

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={`form-field-${fieldNode.name}`}>
        {labelFor(fieldNode)}
      </FieldLabel>
      {fieldNode.description && !isTextarea && (
        <FieldDescription>{fieldNode.description}</FieldDescription>
      )}
      {isTextarea ? (
        <Textarea
          id={`form-field-${fieldNode.name}`}
          name={fieldNode.name}
          value={field.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={isInvalid}
          placeholder={fieldNode.description}
          className="min-h-25"
        />
      ) : (
        <Input
          id={`form-field-${fieldNode.name}`}
          name={fieldNode.name}
          type={inputTypeForFormat(fieldNode)}
          value={field.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={isInvalid}
          autoComplete="off"
        />
      )}
      {isInvalid && <FieldError errors={toFieldErrors(field.errors)} />}
    </Field>
  );
}

function NumberField({ fieldNode, field }: NumberFieldComponentProps) {
  const isInvalid = field.isTouched && field.errors.length > 0;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={`form-field-${fieldNode.name}`}>
        {labelFor(fieldNode)}
      </FieldLabel>
      {fieldNode.description && (
        <FieldDescription>{fieldNode.description}</FieldDescription>
      )}
      <Input
        id={`form-field-${fieldNode.name}`}
        name={fieldNode.name}
        type="number"
        value={field.value}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={toFieldErrors(field.errors)} />}
    </Field>
  );
}

function BooleanField({ fieldNode, field }: BooleanFieldComponentProps) {
  const isInvalid = field.isTouched && field.errors.length > 0;
  return (
    <Field orientation="horizontal" data-invalid={isInvalid}>
      <div className="flex flex-1 flex-col gap-1.5">
        <FieldLabel htmlFor={`form-field-${fieldNode.name}`}>
          {labelFor(fieldNode)}
        </FieldLabel>
        {fieldNode.description && (
          <FieldDescription>{fieldNode.description}</FieldDescription>
        )}
        {isInvalid && <FieldError errors={toFieldErrors(field.errors)} />}
      </div>
      <Switch
        id={`form-field-${fieldNode.name}`}
        name={fieldNode.name}
        checked={field.value}
        onCheckedChange={field.handleChange}
        aria-invalid={isInvalid}
      />
    </Field>
  );
}

function EnumField({ fieldNode, field }: EnumFieldComponentProps) {
  const isInvalid = field.isTouched && field.errors.length > 0;
  const options = fieldNode.options;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={`form-field-${fieldNode.name}`}>
        {labelFor(fieldNode)}
      </FieldLabel>
      {fieldNode.description && (
        <FieldDescription>{fieldNode.description}</FieldDescription>
      )}
      <Select
        value={field.value != null ? String(field.value) : undefined}
        onValueChange={(v) => field.handleChange(v)}
      >
        <SelectTrigger
          id={`form-field-${fieldNode.name}`}
          className="w-full"
          aria-invalid={isInvalid}
        >
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={String(opt)} value={String(opt)}>
              {String(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={toFieldErrors(field.errors)} />}
    </Field>
  );
}

function ObjectField({ fieldNode, children }: ObjectFieldComponentProps) {
  if (fieldNode.path.length === 0) {
    return <FieldGroup>{children}</FieldGroup>;
  }

  return (
    <fieldset className="border-border rounded-lg border p-4">
      <legend className="text-sm font-medium px-1">
        {labelFor(fieldNode)}
      </legend>
      {fieldNode.description && (
        <FieldDescription>{fieldNode.description}</FieldDescription>
      )}
      <FieldGroup>{children}</FieldGroup>
    </fieldset>
  );
}

function ArrayField({
  fieldNode,
  items,
  onPush,
  onRemove,
}: ArrayFieldComponentProps) {
  return (
    <fieldset className="border-border space-y-3 rounded-lg border p-4">
      <legend className="text-sm font-medium px-1">
        {labelFor(fieldNode)}
      </legend>
      {fieldNode.description && (
        <FieldDescription>{fieldNode.description}</FieldDescription>
      )}
      {items.length === 0 && (
        <p className="text-muted-foreground text-sm italic">
          No items yet. Click below to add one.
        </p>
      )}
      {items.map((item, index) => (
        <div key={item.key} className="flex items-start gap-2">
          <div className="flex-1">{item.rendered}</div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mt-6 shrink-0"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPush()}
      >
        <Plus className="size-4 mr-1" />
        Add
      </Button>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// AutoForm instance — wire field components to createAutoForm
// ---------------------------------------------------------------------------

export const AutoForm = createAutoForm({
  string: StringField,
  number: NumberField,
  boolean: BooleanField,
  enum: EnumField,
  object: ObjectField,
  array: ArrayField,
});

// ---------------------------------------------------------------------------
// FormActions — submit / reset buttons
// ---------------------------------------------------------------------------

export function FormActions({ isSubmitting, reset }: FormActionsProps) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={reset}
        disabled={isSubmitting}
      >
        Reset
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );
}
