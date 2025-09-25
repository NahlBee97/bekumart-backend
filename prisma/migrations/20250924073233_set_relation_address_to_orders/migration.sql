/*
  Warnings:

  - You are about to drop the column `shippingAddress` on the `Orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Orders" DROP COLUMN "shippingAddress",
ADD COLUMN     "addressId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
