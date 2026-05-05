/**
 * Basic form — string, number, boolean fields.
 *
 * The simplest schema to demonstrate SSF's core functionality.
 */

import { AutoFields, getSsfFormOptions } from "@39sho/ssf-react";
import { revalidateLogic, useStore } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { FormActions } from "@/auto-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppForm } from "@/form-context";

const schema = z.object({
  name: z.string().min(1, "Name is required.").default("").meta({
    title: "Name",
  }),
  age: z
    .number()
    .min(0, "Must be 0 or greater.")
    .max(150, "Please enter a valid age.")
    .meta({ title: "Age" }),
  subscribe: z.boolean().default(false).meta({
    title: "Subscribe",
    description: "Receive occasional updates via email.",
  }),
});

export default function BasicPage() {
  const [submitted, setSubmitted] = useState<unknown>(null);

  const { rootNode, defaultValues } = getSsfFormOptions(schema);

  const form = useAppForm({
    defaultValues,
    /*
     * `onDynamic` runs validation on every field change so errors surface
     * immediately. `revalidateLogic()` ensures that changing one field also
     * re-validates any fields that depend on it (e.g. cross-field rules).
     * This combination gives the best UX for real-time schema validation.
     */
    validators: {
      onDynamic: schema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubmitted(value);
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  if (!rootNode) {
    return (
      <Card>
        <CardContent>
          <p className="text-destructive">Schema must be an object.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic</CardTitle>
          <CardDescription>
            Simple form with text, number, and boolean fields.
          </CardDescription>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["string", "number", "boolean"].map((f) => (
              <span
                key={f}
                className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs font-medium"
              >
                {f}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.AppForm>
              <AutoFields form={form} rootNode={rootNode} />
            </form.AppForm>
            <FormActions
              isSubmitting={isSubmitting}
              reset={() => form.reset()}
            />
          </form>
        </CardContent>
      </Card>

      {submitted != null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submitted Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted overflow-auto rounded-md p-4 text-sm">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
