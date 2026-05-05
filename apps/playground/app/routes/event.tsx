/**
 * Event Registration form — nested object, array of objects, date format.
 *
 * Full showcase of all field kinds SSF supports.
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
  eventName: z.string().min(1, "Event name is required.").default("").meta({
    title: "Event Name",
  }),
  date: z.string().min(1, "Date is required.").default("").meta({
    title: "Date",
    format: "date",
  }),
  category: z
    .enum(["conference", "workshop", "meetup", "webinar"])
    .default("conference")
    .meta({
      title: "Category",
    }),
  location: z
    .object({
      venue: z.string().min(1, "Venue is required.").default("").meta({
        title: "Venue",
      }),
      city: z.string().min(1, "City is required.").default("").meta({
        title: "City",
      }),
    })
    .meta({
      title: "Location",
      description: "Where the event takes place.",
    }),
  speakers: z
    .array(
      z.object({
        name: z.string().min(1, "Speaker name is required.").default("").meta({
          title: "Name",
        }),
        topic: z.string().default("").meta({
          title: "Topic",
        }),
      }),
    )
    .default([])
    .meta({
      title: "Speakers",
      description: "Add speakers and their topics.",
    }),
  online: z.boolean().default(false).meta({
    title: "Online Event",
    description: "This event has a virtual attendance option.",
  }),
});

export default function EventPage() {
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
          <CardTitle className="text-lg">Event Registration</CardTitle>
          <CardDescription>
            Full showcase: nested objects, repeatable arrays, and all field
            kinds.
          </CardDescription>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["nested object", "array of objects", "date format"].map((f) => (
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
