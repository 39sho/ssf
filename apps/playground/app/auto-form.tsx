/**
 * SSF field components and form action buttons.
 *
 * Each field component maps a FieldNode kind to a React component using
 * shadcn/ui primitives. Components use `useFieldContext` from TanStack Form
 * to access the field API, and receive `fieldNode` metadata via props.
 */

import type {
  ArrayFieldComponentProps,
  ArrayItem,
  BooleanFieldComponentProps,
  EnumFieldComponentProps,
  NumberFieldComponentProps,
  ObjectFieldComponentProps,
  TextFieldComponentProps,
} from "@39sho/ssf-react";
import { extractDefaults } from "@39sho/ssf-react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
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
import { useFieldContext } from "@/form-context";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasMessage(v: unknown): v is { message: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    "message" in v &&
    typeof (v as { message: unknown }).message === "string"
  );
}

/** Convert mixed validation errors into the shape expected by shadcn FieldError. */
export function toFieldErrors(errors: readonly unknown[]) {
  const out: { message: string }[] = [];
  for (const err of errors) {
    if (typeof err === "string") {
      out.push({ message: err });
    } else if (hasMessage(err)) {
      out.push({ message: err.message });
    }
  }
  return out;
}

/** Map `format` metadata (email, date, etc.) to an HTML input type. */
function inputTypeForFormat(
  node: TextFieldComponentProps["fieldNode"],
): string {
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

function LabelText({
  title,
  name,
  required,
}: {
  title?: string;
  name: string;
  required: boolean;
}) {
  return (
    <>
      {title ?? name}
      {required && (
        <span className="text-destructive ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Field components — one per FieldNode kind
// ---------------------------------------------------------------------------

export function TextField({ fieldNode }: TextFieldComponentProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.errors.length > 0;
  const isTextarea = fieldNode.format === "textarea";

  return (
    <Field data-invalid={isInvalid} className="gap-1">
      <FieldLabel htmlFor={`form-field-${fieldNode.name}`}>
        <LabelText
          title={fieldNode.title}
          name={fieldNode.name}
          required={fieldNode.required}
        />
      </FieldLabel>
      {fieldNode.description && !isTextarea && (
        <FieldDescription>{fieldNode.description}</FieldDescription>
      )}
      {isTextarea ? (
        <Textarea
          id={`form-field-${fieldNode.name}`}
          name={fieldNode.name}
          value={field.state.value}
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
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={isInvalid}
          autoComplete="off"
        />
      )}
      {isInvalid && (
        <FieldError errors={toFieldErrors(field.state.meta.errors)} />
      )}
    </Field>
  );
}

export function NumberField({ fieldNode }: NumberFieldComponentProps) {
  const field = useFieldContext<number | undefined>();
  const isInvalid = field.state.meta.errors.length > 0;

  return (
    <Field data-invalid={isInvalid} className="gap-1">
      <FieldLabel htmlFor={`form-field-${fieldNode.name}`}>
        <LabelText
          title={fieldNode.title}
          name={fieldNode.name}
          required={fieldNode.required}
        />
      </FieldLabel>
      {fieldNode.description && (
        <FieldDescription>{fieldNode.description}</FieldDescription>
      )}
      <Input
        id={`form-field-${fieldNode.name}`}
        name={fieldNode.name}
        type="number"
        /*
         * HTML `input[type="number"]` returns `NaN` for an empty value via
         * `valueAsNumber`, which breaks React controlled-component behaviour.
         * We coerce the empty string back to `undefined` so the form value
         * stays consistent.
         */
        value={field.state.value ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          field.handleChange(val === "" ? undefined : Number(val));
        }}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
      />
      {isInvalid && (
        <FieldError errors={toFieldErrors(field.state.meta.errors)} />
      )}
    </Field>
  );
}

export function BooleanField({ fieldNode }: BooleanFieldComponentProps) {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.errors.length > 0;

  return (
    <Field orientation="horizontal" data-invalid={isInvalid} className="gap-1">
      <div className="flex flex-1 flex-col gap-1.5">
        <FieldLabel htmlFor={`form-field-${fieldNode.name}`}>
          <LabelText
            title={fieldNode.title}
            name={fieldNode.name}
            required={fieldNode.required}
          />
        </FieldLabel>
        {fieldNode.description && (
          <FieldDescription>{fieldNode.description}</FieldDescription>
        )}
        {isInvalid && (
          <FieldError errors={toFieldErrors(field.state.meta.errors)} />
        )}
      </div>
      <Switch
        id={`form-field-${fieldNode.name}`}
        name={fieldNode.name}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
        aria-invalid={isInvalid}
      />
    </Field>
  );
}

export function EnumField({ fieldNode }: EnumFieldComponentProps) {
  const field = useFieldContext<string | number | boolean>();
  const isInvalid = field.state.meta.errors.length > 0;
  const options = fieldNode.options;

  return (
    <Field data-invalid={isInvalid} className="gap-1">
      <FieldLabel htmlFor={`form-field-${fieldNode.name}`}>
        <LabelText
          title={fieldNode.title}
          name={fieldNode.name}
          required={fieldNode.required}
        />
      </FieldLabel>
      {fieldNode.description && (
        <FieldDescription>{fieldNode.description}</FieldDescription>
      )}
      <Select
        /*
         * shadcn/ui Select only accepts string values. We normalise enum
         * values (string | number | boolean) to strings for the UI, and
         * pass the string back to the form state (the schema validator
         * will coerce it to the correct type on submit if needed).
         */
        value={
          field.state.value != null ? String(field.state.value) : undefined
        }
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
          {options.map((opt: string | number | boolean) => (
            <SelectItem key={String(opt)} value={String(opt)}>
              {String(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && (
        <FieldError errors={toFieldErrors(field.state.meta.errors)} />
      )}
    </Field>
  );
}

export function ObjectField({
  fieldNode,
  children,
}: ObjectFieldComponentProps) {
  return (
    <FieldSet className="border rounded-md p-4">
      <FieldLegend>
        <LabelText
          title={fieldNode.title}
          name={fieldNode.name}
          required={fieldNode.required}
        />
      </FieldLegend>
      {fieldNode.description && (
        <FieldDescription>{fieldNode.description}</FieldDescription>
      )}
      <FieldGroup>{children}</FieldGroup>
    </FieldSet>
  );
}

export function ArrayField({ fieldNode, items }: ArrayFieldComponentProps) {
  const field = useFieldContext<unknown[]>();

  return (
    <FieldSet className="border rounded-md p-4">
      <FieldLegend>
        <LabelText
          title={fieldNode.title}
          name={fieldNode.name}
          required={fieldNode.required}
        />
      </FieldLegend>
      {fieldNode.description && (
        <FieldDescription>{fieldNode.description}</FieldDescription>
      )}
      {items.length === 0 && (
        <p className="text-muted-foreground text-sm italic">
          No items yet. Click below to add one.
        </p>
      )}
      {items.map((item: ArrayItem<React.ReactNode>, index: number) => (
        <div key={item.key} className="flex items-start gap-2">
          <div className="flex-1">{item.rendered}</div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mt-6 shrink-0"
            onClick={() => field.removeValue(index)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => field.pushValue(extractDefaults(fieldNode.item) ?? {})}
      >
        <Plus className="size-4 mr-1" />
        Add
      </Button>
    </FieldSet>
  );
}

// ---------------------------------------------------------------------------
// FormActions — submit / reset buttons
// ---------------------------------------------------------------------------

export function FormActions({
  isSubmitting,
  reset,
}: {
  isSubmitting: boolean;
  reset: () => void;
}) {
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
