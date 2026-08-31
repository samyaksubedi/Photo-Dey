-- CreateEnum
CREATE TYPE "UploadBatchStatus" AS ENUM ('ACCEPTED', 'QUEUED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "receivedPhotos" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing events: every legacy event was created with all source files received.
UPDATE "Event" SET "receivedPhotos" = "totalPhotos";

-- CreateTable
CREATE TABLE "EventUploadBatch" (
    "id" TEXT NOT NULL,
    "clientBatchId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "photoCount" INTEGER NOT NULL,
    "totalBytes" INTEGER NOT NULL,
    "status" "UploadBatchStatus" NOT NULL DEFAULT 'ACCEPTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventUploadBatch_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN "uploadBatchId" TEXT;

-- CreateIndex
CREATE INDEX "EventUploadBatch_eventId_idx" ON "EventUploadBatch"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventUploadBatch_eventId_clientBatchId_key" ON "EventUploadBatch"("eventId", "clientBatchId");

-- CreateIndex
CREATE INDEX "Photo_uploadBatchId_idx" ON "Photo"("uploadBatchId");

-- AddForeignKey
ALTER TABLE "EventUploadBatch" ADD CONSTRAINT "EventUploadBatch_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_uploadBatchId_fkey" FOREIGN KEY ("uploadBatchId") REFERENCES "EventUploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
