import { z } from "zod";

const cuidPattern = /^c[a-z0-9]{24,}$/;

export const incidentsQuerySchema = z.object({
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).max(10_000).optional().default(0),
});

export const incidentIdSchema = z.string().regex(cuidPattern, "Invalid incident ID");
