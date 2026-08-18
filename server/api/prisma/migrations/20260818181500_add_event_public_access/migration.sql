-- Add public access controls without breaking existing events.
ALTER TABLE "Event"
ADD COLUMN "publicCode" TEXT,
ADD COLUMN "publicEnabled" BOOLEAN NOT NULL DEFAULT true;

-- PostgreSQL's UUID generator provides URL-safe, unique codes for existing rows.
UPDATE "Event"
SET "publicCode" = REPLACE(gen_random_uuid()::text, '-', '')
WHERE "publicCode" IS NULL;

ALTER TABLE "Event"
ALTER COLUMN "publicCode" SET NOT NULL;

CREATE UNIQUE INDEX "Event_publicCode_key" ON "Event"("publicCode");
