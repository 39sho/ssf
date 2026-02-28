/**
 * Event Registration form — nested object, array of objects, date format.
 *
 * Full showcase of all field kinds SSF supports.
 */

import z from "zod";
import { FormCard } from "@/form-card";

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
  return (
    <FormCard
      title="Event Registration"
      description="Full showcase: nested objects, repeatable arrays, and all field kinds."
      features={["nested object", "array of objects", "date format"]}
      schema={schema}
    />
  );
}
