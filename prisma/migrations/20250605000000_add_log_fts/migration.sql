-- Phase 3: PostgreSQL full-text search on LogFile.content

ALTER TABLE "LogFile" ADD COLUMN "search_vector" tsvector;

UPDATE "LogFile"
SET "search_vector" = to_tsvector('english', COALESCE(content, ''))
WHERE "search_vector" IS NULL;

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
