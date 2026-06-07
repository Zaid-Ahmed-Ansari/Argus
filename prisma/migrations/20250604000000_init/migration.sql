-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('AUTH', 'FIREWALL', 'WEB_SERVER', 'SIEM', 'OTHER');

-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('GEMINI', 'OPENAI');

-- CreateEnum
CREATE TYPE "InputFormat" AS ENUM ('RAW', 'STRUCTURED');

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "attackType" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "summary" TEXT,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogFile" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "filename" TEXT,
    "logType" "LogType" NOT NULL DEFAULT 'AUTH',
    "content" TEXT NOT NULL,
    "lineCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "provider" "AiProvider" NOT NULL DEFAULT 'GEMINI',
    "usedRag" BOOLEAN NOT NULL DEFAULT false,
    "inputFormat" "InputFormat" NOT NULL DEFAULT 'RAW',
    "attackType" TEXT,
    "severity" "Severity" NOT NULL,
    "summary" TEXT NOT NULL,
    "timeline" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "modelVersion" TEXT,
    "promptVersion" TEXT,
    "latencyMs" INTEGER,
    "tokenCount" INTEGER,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incident_severity_idx" ON "Incident"("severity");

-- CreateIndex
CREATE INDEX "Incident_createdAt_idx" ON "Incident"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "LogFile_incidentId_idx" ON "LogFile"("incidentId");

-- CreateIndex
CREATE INDEX "Analysis_incidentId_idx" ON "Analysis"("incidentId");

-- CreateIndex
CREATE INDEX "Analysis_provider_usedRag_inputFormat_idx" ON "Analysis"("provider", "usedRag", "inputFormat");

-- AddForeignKey
ALTER TABLE "LogFile" ADD CONSTRAINT "LogFile_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
