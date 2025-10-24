import { z } from "zod";

export const expertSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  category: z.string(),
  group: z.string().optional(),
});

export const contentSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

export type Expert = z.infer<typeof expertSchema>;
export type ContentSection = z.infer<typeof contentSectionSchema>;
