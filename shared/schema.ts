import { z } from "zod";

export const expertSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  category: z.string(),
  group: z.string().optional(),
});

export type Expert = z.infer<typeof expertSchema>;
