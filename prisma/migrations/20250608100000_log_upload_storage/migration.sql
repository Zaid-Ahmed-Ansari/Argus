-- File upload storage: staged uploads + permanent paths on LogFile

CREATE TABLE "LogUpload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER NOT NULL,
    "lineCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogUpload_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LogUpload_userId_idx" ON "LogUpload"("userId");
CREATE INDEX "LogUpload_createdAt_idx" ON "LogUpload"("createdAt");

ALTER TABLE "LogUpload" ADD CONSTRAINT "LogUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LogFile" ADD COLUMN "storagePath" TEXT;
ALTER TABLE "LogFile" ADD COLUMN "sizeBytes" INTEGER;
