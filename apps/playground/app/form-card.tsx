import type {
  FormActionsProps,
  StandardJSONSchemaV1,
  StandardSchemaV1,
} from "@39sho/ssf-core";
import { useState } from "react";
import { AutoForm, FormActions } from "@/auto-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FormCardProps {
  title: string;
  description: string;
  features: string[];
  schema: StandardSchemaV1<unknown, unknown> &
    StandardJSONSchemaV1<unknown, unknown>;
}

export function FormCard({
  title,
  description,
  features,
  schema,
}: FormCardProps) {
  const [submitted, setSubmitted] = useState<unknown>(null);

  const handleSubmit = async (data: unknown) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitted(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {features.map((f) => (
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
          <AutoForm
            schema={schema}
            onSubmit={async (value: unknown) => {
              await handleSubmit(value);
            }}
            formActions={(props: FormActionsProps) => (
              <FormActions {...props} />
            )}
          />
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
