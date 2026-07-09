/*
  Warnings:

  - You are about to drop the column `publicUrl` on the `Photo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "publicUrl",
ADD COLUMN     "publicId" TEXT,
ADD COLUMN     "secureUrl" TEXT;
