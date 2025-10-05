/*
  Warnings:

  - You are about to drop the column `receiver` on the `Orders` table. All the data in the column will be lost.
  - Added the required column `receiver` to the `Addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Addresses" ADD COLUMN     "receiver" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Orders" DROP COLUMN "receiver";
