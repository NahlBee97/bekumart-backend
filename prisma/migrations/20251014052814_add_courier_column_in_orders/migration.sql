/*
  Warnings:

  - Added the required column `courier` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Orders" ADD COLUMN     "courier" TEXT NOT NULL;
