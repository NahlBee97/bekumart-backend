/*
  Warnings:

  - Added the required column `receiver` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sale` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Orders" ADD COLUMN     "receiver" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Products" ADD COLUMN     "sale" INTEGER NOT NULL;
