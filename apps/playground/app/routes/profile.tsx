/**
 * Profile form — enum (select), format-driven widgets (email, textarea).
 *
 * Demonstrates how `.meta({ format: "..." })` drives widget selection.
 */

import z from "zod";
import { FormCard } from "@/form-card";

const schema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters.")
    .max(20, "At most 20 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores.")
    .default("")
    .meta({ title: "Username", description: "Your public display name." }),
  email: z.email("Please enter a valid email.").default("").meta({
    title: "Email",
    format: "email",
  }),
  role: z.enum(["viewer", "editor", "admin"]).default("viewer").meta({
    title: "Role",
    description: "Access level for this user.",
  }),
  bio: z
    .string()
    .max(200, "At most 200 characters.")
    .default("")
    .meta({ title: "Bio", format: "textarea" }),
  publicProfile: z.boolean().default(true).meta({
    title: "Public Profile",
    description: "Make your profile visible to everyone.",
  }),
});

export default function ProfilePage() {
  return (
    <FormCard
      title="Profile"
      description="Adds enum (select) and format-driven widgets (email, textarea)."
      features={["enum", "format: email", "format: textarea"]}
      schema={schema}
    />
  );
}
