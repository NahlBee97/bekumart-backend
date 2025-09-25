/*
  Warnings:

  - Added the required column `district` to the `Addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subdistrict` to the `Addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Addresses" ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "subdistrict" TEXT NOT NULL;
