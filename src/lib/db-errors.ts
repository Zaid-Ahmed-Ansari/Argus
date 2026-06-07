import { Prisma } from "@/generated/prisma/client";

export function isDatabaseConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1000", "P1001", "P1002", "P1017"].includes(error.code);
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("connect econnrefused") ||
      message.includes("connection terminated") ||
      message.includes("password authentication failed") ||
      message.includes("database_url")
    );
  }

  return false;
}

export function getDatabaseErrorMessage(): string {
  return "Database unavailable. Ensure PostgreSQL is running and DATABASE_URL is configured, then run npm run db:migrate.";
}
