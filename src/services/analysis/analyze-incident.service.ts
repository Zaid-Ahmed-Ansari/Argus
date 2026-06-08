import type { Severity } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { RAW_RESPONSE_MAX_CHARS, UPLOAD_STALE_HOURS } from "@/lib/constants";
import { analysisOrchestrator } from "@/services/ai/analysis-orchestrator";
import { logUploadRepository } from "@/services/repositories/log-upload.repository";
import {
  deleteStoredFile,
  isExternalStorageRef,
  promoteToIncidentStorage,
  readStoredLog,
  savePastedLog,
} from "@/services/storage/log-file-storage.service";
import type { AnalyzeResponse } from "@/types/api";
import { countLogLines } from "@/utils/format";
import { prepareLogContent } from "@/utils/redact-pii";

function toSeverity(value: string): Severity {
  const upper = value.toUpperCase();
  if (
    upper === "LOW" ||
    upper === "MEDIUM" ||
    upper === "HIGH" ||
    upper === "CRITICAL"
  ) {
    return upper;
  }
  return "MEDIUM";
}

function truncateRawResponse(raw: unknown): unknown {
  if (raw === undefined) return undefined;
  const str = JSON.stringify(raw);
  if (str.length <= RAW_RESPONSE_MAX_CHARS) return raw;
  return { truncated: true, preview: str.slice(0, RAW_RESPONSE_MAX_CHARS) };
}

export type AnalyzeIncidentInput = {
  userId: string;
  usedRag?: boolean;
  inputFormat?: "RAW" | "STRUCTURED";
  provider?: "GEMINI" | "OPENAI";
  logs?: string;
  uploadId?: string;
};

async function resolveLogContent(
  input: AnalyzeIncidentInput,
): Promise<{
  content: string;
  filename: string;
  sizeBytes: number;
  lineCount: number;
  stagingPath?: string;
  source: "paste" | "upload";
}> {
  if (input.uploadId) {
    const upload = await logUploadRepository.findByIdForUser(
      input.uploadId,
      input.userId,
    );
    if (!upload) {
      throw new Error("Upload not found or access denied");
    }

    const content = await readStoredLog(upload.storagePath);
    return {
      content,
      filename: upload.originalFilename,
      sizeBytes: upload.sizeBytes,
      lineCount: upload.lineCount ?? countLogLines(content),
      stagingPath: upload.storagePath,
      source: "upload",
    };
  }

  const content = prepareLogContent(input.logs!);
  return {
    content,
    filename: "pasted-logs.txt",
    sizeBytes: Buffer.byteLength(content, "utf-8"),
    lineCount: countLogLines(content),
    source: "paste",
  };
}

export async function analyzeAndPersistIncident(
  input: AnalyzeIncidentInput,
): Promise<AnalyzeResponse & { incidentId: string }> {
  const resolved = await resolveLogContent(input);

  const { response, metadata } = await analysisOrchestrator.analyzeLogsWithMeta(
    resolved.content,
    {
      usedRag: input.usedRag,
      inputFormat: input.inputFormat ?? "RAW",
      provider: input.provider,
    },
  );

  const result = await prisma.$transaction(async (tx) => {
    const incident = await tx.incident.create({
      data: {
        userId: input.userId,
        title: `Incident — ${response.attackType}`,
        attackType: response.attackType,
        severity: toSeverity(response.severity),
        summary: response.summary,
      },
    });

    let storagePath: string;
    if (resolved.source === "upload" && resolved.stagingPath) {
      if (isExternalStorageRef(resolved.stagingPath)) {
        storagePath = resolved.stagingPath;
      } else {
        storagePath = await promoteToIncidentStorage({
          userId: input.userId,
          incidentId: incident.id,
          stagingRelativePath: resolved.stagingPath,
          filename: resolved.filename,
        });
      }
      if (input.uploadId) {
        try {
          await tx.logUpload.delete({ where: { id: input.uploadId } });
        } catch {
          /* staging row may already be removed */
        }
      }
    } else {
      const saved = await savePastedLog({
        userId: input.userId,
        incidentId: incident.id,
        content: resolved.content,
      });
      storagePath = saved.relativePath;
    }

    await tx.logFile.create({
      data: {
        incidentId: incident.id,
        content: resolved.content,
        filename: resolved.filename,
        storagePath,
        sizeBytes: resolved.sizeBytes,
        logType: "AUTH",
        lineCount: resolved.lineCount,
      },
    });

    await tx.analysis.create({
      data: {
        incidentId: incident.id,
        provider: metadata.provider,
        usedRag: input.usedRag ?? false,
        inputFormat: input.inputFormat ?? "RAW",
        attackType: response.attackType,
        severity: toSeverity(response.severity),
        summary: response.summary,
        timeline: response.timeline,
        recommendations: response.recommendations,
        modelVersion: metadata.modelVersion,
        promptVersion: metadata.promptVersion,
        latencyMs: metadata.latencyMs,
        tokenCount: metadata.tokenCount,
        rawResponse: truncateRawResponse(metadata.rawResponse) as object | undefined,
      },
    });

    return incident;
  });

  return {
    ...response,
    incidentId: result.id,
  };
}

export async function cleanupStaleUploads(userId: string): Promise<void> {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - UPLOAD_STALE_HOURS);

  const stale = await prisma.logUpload.findMany({
    where: { userId, createdAt: { lt: cutoff } },
  });

  for (const row of stale) {
    await deleteStoredFile(row.storagePath).catch(() => {});
    await logUploadRepository.delete(row.id).catch(() => {});
  }
}
