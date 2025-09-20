-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
