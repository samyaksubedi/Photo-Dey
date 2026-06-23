/*
  Warnings:

  - You are about to drop the column `userId` on the `Photo` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `SearchRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_userId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "totalPhotos" SET DEFAULT 0,
ALTER COLUMN "uploadedPhotos" SET DEFAULT 0,
ALTER COLUMN "processingPhotos" SET DEFAULT 0,
ALTER COLUMN "completedPhotos" SET DEFAULT 0,
ALTER COLUMN "failedPhotos" SET DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'CREATED',
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "userId",
ALTER COLUMN "publicUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SearchRequest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "matchedPhotosCount" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Photo_eventId_idx" ON "Photo"("eventId");

-- CreateIndex
CREATE INDEX "SearchRequest_eventId_chatId_idx" ON "SearchRequest"("eventId", "chatId");
