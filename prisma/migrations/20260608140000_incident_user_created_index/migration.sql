-- Speed up per-user incident lists ordered by createdAt (dashboard, incidents page).
CREATE INDEX "Incident_userId_createdAt_idx" ON "Incident"("userId", "createdAt" DESC);
