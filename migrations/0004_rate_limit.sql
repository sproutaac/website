-- Per-IP rate limiting for the signup form. lib/security.js also creates
-- this table on first use; this file documents the schema.
CREATE TABLE IF NOT EXISTS "RateLimitHit" (
  "bucket" TEXT    NOT NULL,
  "ipHash" TEXT    NOT NULL,  -- salted HMAC of the IP, never the raw address
  "at"     INTEGER NOT NULL   -- unix seconds; rows older than the window are deleted
);
