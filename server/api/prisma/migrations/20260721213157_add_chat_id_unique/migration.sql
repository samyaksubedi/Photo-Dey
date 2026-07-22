/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `SearchRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SearchRequest_chatId_key" ON "SearchRequest"("chatId");
