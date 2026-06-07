import { prisma } from "@/lib/prisma";
import type { LogSearchResult } from "@/types/search";

export interface LogSearchService {
  searchLogs(
    query: string,
    limit?: number,
    userId?: string,
  ): Promise<LogSearchResult[]>;
}

type FtsRow = {
  id: string;
  filename: string | null;
  logType: string;
  lineCount: number | null;
  createdAt: Date;
  incidentId: string;
  incidentTitle: string;
  rank: number;
  snippet: string;
};

export class PostgresFtsLogSearchService implements LogSearchService {
  async searchLogs(
    query: string,
    limit = 20,
    userId?: string,
  ): Promise<LogSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
      const rows = userId
        ? await prisma.$queryRaw<FtsRow[]>`
            SELECT
              lf.id,
              lf.filename,
              lf."logType",
              lf."lineCount",
              lf."createdAt",
              lf."incidentId",
              i.title AS "incidentTitle",
              ts_rank(lf.search_vector, plainto_tsquery('english', ${trimmed}))::float8 AS rank,
              ts_headline(
                'english',
                lf.content,
                plainto_tsquery('english', ${trimmed}),
                'MaxWords=24, MinWords=12, ShortWord=3'
              ) AS snippet
            FROM "LogFile" lf
            INNER JOIN "Incident" i ON i.id = lf."incidentId"
            WHERE lf.search_vector @@ plainto_tsquery('english', ${trimmed})
              AND i."userId" = ${userId}
            ORDER BY rank DESC
            LIMIT ${limit}
          `
        : await prisma.$queryRaw<FtsRow[]>`
            SELECT
              lf.id,
              lf.filename,
              lf."logType",
              lf."lineCount",
              lf."createdAt",
              lf."incidentId",
              i.title AS "incidentTitle",
              ts_rank(lf.search_vector, plainto_tsquery('english', ${trimmed}))::float8 AS rank,
              ts_headline(
                'english',
                lf.content,
                plainto_tsquery('english', ${trimmed}),
                'MaxWords=24, MinWords=12, ShortWord=3'
              ) AS snippet
            FROM "LogFile" lf
            INNER JOIN "Incident" i ON i.id = lf."incidentId"
            WHERE lf.search_vector @@ plainto_tsquery('english', ${trimmed})
            ORDER BY rank DESC
            LIMIT ${limit}
          `;

      return rows.map((row) => ({
        id: row.id,
        filename: row.filename,
        logType: row.logType,
        lineCount: row.lineCount,
        createdAt: row.createdAt.toISOString(),
        incidentId: row.incidentId,
        incidentTitle: row.incidentTitle,
        rank: row.rank,
        snippet: row.snippet,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown search error";

      if (
        message.includes("search_vector") ||
        message.includes("does not exist")
      ) {
        throw new Error(
          "Log search is not enabled. Run: npm run db:migrate",
        );
      }

      throw error;
    }
  }
}

export const logSearchService: LogSearchService =
  new PostgresFtsLogSearchService();
