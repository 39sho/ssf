/**
 * Profile form — enum (select), format-driven widgets (email, textarea).
 *
 * Demonstrates how `.meta({ format: "..." })` drives widget selection.
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
  username: z
    .string()
    .min(3, "At least 3 characters.")
    .max(20, "At most 20 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores.")
    .meta({ title: "Username", description: "Your public display name." }),
  email: z.email("Please enter a valid email.").meta({
    title: "Email",
    format: "email",
  }),
  role: z.enum(["viewer", "editor", "admin"]).meta({
    title: "Role",
    description: "Access level for this user.",
  }),
  bio: z
    .string()
    .max(200, "At most 200 characters.")
    .meta({ title: "Bio", format: "textarea" }),
  publicProfile: z.boolean().meta({
    title: "Public Profile",
    description: "Make your profile visible to everyone.",
    default: true,
  }),
});

export default function ProfilePage() {
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
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>
            Adds enum (select) and format-driven widgets (email, textarea).
          </CardDescription>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["enum", "format: email", "format: textarea"].map((f) => (
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
