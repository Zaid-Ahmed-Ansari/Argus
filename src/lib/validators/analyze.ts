import { z } from "zod";
import {
  MAX_ATTACK_TYPE_LENGTH,
  MAX_LOG_CHARS,
  MAX_RECOMMENDATION_LENGTH,
  MAX_RECOMMENDATIONS,
  MAX_SUMMARY_LENGTH,
  MAX_TIMELINE_EVENT_LENGTH,
  MAX_TIMELINE_EVENTS,
} from "@/lib/constants";

export const analyzeRequestSchema = z
  .object({
    logs: z
      .string()
      .max(MAX_LOG_CHARS, `Logs exceed maximum size of ${MAX_LOG_CHARS} characters`)
      .optional(),
    uploadId: z.string().min(1).optional(),
    usedRag: z.boolean().optional().default(false),
  })
  .refine(
    (data) => Boolean(data.uploadId) || Boolean(data.logs?.trim()),
    { message: "Provide logs text or an uploadId" },
  );

export const timelineEventSchema = z.object({
  timestamp: z.string().max(100),
  event: z.string().max(MAX_TIMELINE_EVENT_LENGTH),
  source: z.string().max(200).optional(),
});

export const analyzeResponseSchema = z.object({
  attackType: z.string().max(MAX_ATTACK_TYPE_LENGTH),
  severity: z.string().max(20),
  summary: z.string().max(MAX_SUMMARY_LENGTH),
  timeline: z.array(timelineEventSchema).max(MAX_TIMELINE_EVENTS),
  recommendations: z
    .array(z.string().max(MAX_RECOMMENDATION_LENGTH))
    .max(MAX_RECOMMENDATIONS),
});
