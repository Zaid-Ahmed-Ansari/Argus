import type { LogType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { mapLogFile } from "@/utils/mappers";
import type { LogFileSummary } from "@/types/incident";
import { countLogLines } from "@/utils/format";

export type CreateLogFileInput = {
  incidentId: string;
  content: string;
  filename?: string;
  logType?: LogType;
};

export class LogFileRepository {
  async createForIncident(input: CreateLogFileInput): Promise<LogFileSummary> {
    const logFile = await prisma.logFile.create({
      data: {
        incidentId: input.incidentId,
        content: input.content,
        filename: input.filename,
        logType: input.logType ?? "AUTH",
        lineCount: countLogLines(input.content),
      },
    });

    return mapLogFile(logFile);
  }

  async findByIncidentId(incidentId: string): Promise<LogFileSummary[]> {
    const logFiles = await prisma.logFile.findMany({
      where: { incidentId },
      orderBy: { createdAt: "desc" },
    });

    return logFiles.map(mapLogFile);
  }
}

export const logFileRepository = new LogFileRepository();
