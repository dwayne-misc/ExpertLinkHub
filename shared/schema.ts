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
  url: z.string().optional(),
});

export const contentSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  order: z.number(),
  type: z.string().optional(),
  imageUrl: z.string().optional(),
  secondaryContent: z.string().optional(),
});

export const expertCategorySchema = z.object({
  category: z.string(),
  specialties: z.array(z.string()),
  topLine: z.string(),
});

export const expertSubmissionSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  url: z.string().optional().or(z.literal("")),
  credentials: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  category: z.string().min(1, "Category is required"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
});

export type Expert = z.infer<typeof expertSchema>;
export type ContentSection = z.infer<typeof contentSectionSchema>;
export type ExpertCategory = z.infer<typeof expertCategorySchema>;
export type ExpertSubmission = z.infer<typeof expertSubmissionSchema>;
