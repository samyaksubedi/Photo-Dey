/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `UserSession` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Photo" ALTER COLUMN "status" SET DEFAULT 'PENDING_UPLOAD';

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_refreshToken_key" ON "UserSession"("refreshToken");
