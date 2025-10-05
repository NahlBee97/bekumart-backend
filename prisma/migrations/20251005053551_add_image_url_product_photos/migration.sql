/*
  Warnings:

  - Added the required column `imageUrl` to the `ProductPhotos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ProductPhotos" ADD COLUMN     "imageUrl" TEXT NOT NULL;
