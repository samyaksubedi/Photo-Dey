/*
  Warnings:

  - Added the required column `localPath` to the `SearchRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SearchRequest" ADD COLUMN     "localPath" TEXT NOT NULL,
ALTER COLUMN "selfieUrl" DROP NOT NULL;
