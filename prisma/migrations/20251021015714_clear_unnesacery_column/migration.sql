/*
  Warnings:

  - You are about to drop the column `latitude` on the `Addresses` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Addresses` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Products` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Addresses" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Products" DROP COLUMN "rating";
