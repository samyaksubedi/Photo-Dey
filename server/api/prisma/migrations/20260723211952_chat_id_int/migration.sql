/*
  Warnings:

  - The primary key for the `TelegramSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `chatId` on the `TelegramSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TelegramSession" DROP CONSTRAINT "TelegramSession_pkey",
DROP COLUMN "chatId",
ADD COLUMN     "chatId" INTEGER NOT NULL,
ADD CONSTRAINT "TelegramSession_pkey" PRIMARY KEY ("chatId");
