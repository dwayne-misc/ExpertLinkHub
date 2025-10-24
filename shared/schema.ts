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
  type: z.string().optional(),
  imageUrl: z.string().optional(),
  secondaryContent: z.string().optional(),
});

export type Expert = z.infer<typeof expertSchema>;
export type ContentSection = z.infer<typeof contentSectionSchema>;
