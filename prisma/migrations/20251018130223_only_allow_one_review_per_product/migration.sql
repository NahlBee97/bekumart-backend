/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `Reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reviews_userId_productId_key" ON "public"."Reviews"("userId", "productId");
