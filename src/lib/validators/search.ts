import { z } from "zod";

export const logSearchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required").max(200),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
