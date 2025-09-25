/*
  Warnings:

  - Added the required column `phone` to the `Addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Addresses" ADD COLUMN     "phone" TEXT NOT NULL;
