# PostgreSQL Full Text Search Migration (Phase 3)

Apply after the initial Prisma migration when implementing log search.

```sql
ALTER TABLE "LogFile" ADD COLUMN "search_vector" tsvector;

CREATE INDEX logfile_search_idx ON "LogFile" USING GIN ("search_vector");

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
```

Query example (via `LogSearchService`):

```sql
SELECT * FROM "LogFile"
WHERE search_vector @@ plainto_tsquery('english', $1)
ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC
LIMIT $2;
```
