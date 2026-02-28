/**
 * Basic form — string, number, boolean fields.
 *
 * The simplest schema to demonstrate SSF's core functionality.
 */

import z from "zod";
import { FormCard } from "@/form-card";

const schema = z.object({
  name: z.string().min(1, "Name is required.").default("").meta({
    title: "Name",
  }),
  age: z
    .number()
    .min(0, "Must be 0 or greater.")
    .max(150, "Please enter a valid age.")
    .default(0)
    .meta({ title: "Age" }),
  subscribe: z.boolean().default(false).meta({
    title: "Subscribe",
    description: "Receive occasional updates via email.",
  }),
});

export default function BasicPage() {
  return (
    <FormCard
      title="Basic"
      description="Simple form with text, number, and boolean fields."
      features={["string", "number", "boolean"]}
      schema={schema}
    />
  );
}
