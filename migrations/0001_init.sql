CREATE TABLE IF NOT EXISTS "WaitlistSignup" (
  "id"        TEXT     NOT NULL PRIMARY KEY,
  "email"     TEXT     NOT NULL UNIQUE,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "WaitlistSignup_createdAt_idx"
  ON "WaitlistSignup"("createdAt" DESC);
