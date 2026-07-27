/*
  Warnings:

  - The values [UPLOADING] on the enum `PhotoStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PhotoStatus_new" AS ENUM ('PENDING_UPLOAD', 'UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');
ALTER TABLE "public"."Photo" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Photo" ALTER COLUMN "status" TYPE "PhotoStatus_new" USING ("status"::text::"PhotoStatus_new");
ALTER TYPE "PhotoStatus" RENAME TO "PhotoStatus_old";
ALTER TYPE "PhotoStatus_new" RENAME TO "PhotoStatus";
DROP TYPE "public"."PhotoStatus_old";
ALTER TABLE "Photo" ALTER COLUMN "status" SET DEFAULT 'PENDING_UPLOAD';
COMMIT;
