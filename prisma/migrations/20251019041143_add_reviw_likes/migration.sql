/*
  Warnings:

  - You are about to drop the column `likes` on the `Reviews` table. All the data in the column will be lost.
  - You are about to drop the column `review` on the `Reviews` table. All the data in the column will be lost.
  - Added the required column `desc` to the `Reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Reviews" DROP COLUMN "likes",
DROP COLUMN "review",
ADD COLUMN     "desc" TEXT NOT NULL,
ADD COLUMN     "likeCount" INTEGER;

-- CreateTable
CREATE TABLE "public"."ReviewLikes" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,

    CONSTRAINT "ReviewLikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewLikes_userId_reviewId_key" ON "public"."ReviewLikes"("userId", "reviewId");

-- AddForeignKey
ALTER TABLE "public"."ReviewLikes" ADD CONSTRAINT "ReviewLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewLikes" ADD CONSTRAINT "ReviewLikes_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."Reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
