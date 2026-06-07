-- Restore FTS column + trigger after 20260607102749_fts dropped search_vector.
-- Matches search_vector in prisma/schema.prisma (Unsupported tsvector).

DROP TRIGGER IF EXISTS logfile_search_vector_trigger ON "LogFile";
DROP FUNCTION IF EXISTS logfile_search_vector_update();

ALTER TABLE "LogFile" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

UPDATE "LogFile"
SET "search_vector" = to_tsvector('english', COALESCE(content, ''))
WHERE "search_vector" IS NULL;

DROP INDEX IF EXISTS "logfile_search_idx";
CREATE INDEX "logfile_search_idx" ON "LogFile" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION logfile_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER logfile_search_vector_trigger
  BEFORE INSERT OR UPDATE OF content ON "LogFile"
  FOR EACH ROW
  EXECUTE FUNCTION logfile_search_vector_update();
