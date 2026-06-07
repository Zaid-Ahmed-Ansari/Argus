import { z } from "zod";

export const uploadResponseSchema = z.object({
  uploadId: z.string(),
  filename: z.string(),
  sizeBytes: z.number(),
  lineCount: z.number(),
});
