/*
  Warnings:

  - The primary key for the `TelegramSession` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "TelegramSession" DROP CONSTRAINT "TelegramSession_pkey",
ALTER COLUMN "chatId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TelegramSession_pkey" PRIMARY KEY ("chatId");
