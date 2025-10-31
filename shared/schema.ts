import { z } from "zod";

export const expertSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  credentials: z.string().optional(),
  email: z.string().email(),
  city: z.string().optional(),
  state: z.string().optional(),
  category: z.string(),
  group: z.string().optional(),
  specialty: z.string().optional(),
});

export const contentSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  order: z.number(),
  type: z.string().optional(),
  imageUrl: z.string().optional(),
  secondaryContent: z.string().optional(),
});

export type Expert = z.infer<typeof expertSchema>;
export type ContentSection = z.infer<typeof contentSectionSchema>;
