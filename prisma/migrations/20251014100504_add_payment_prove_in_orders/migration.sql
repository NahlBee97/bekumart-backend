-- AlterTable
ALTER TABLE "public"."Orders" ADD COLUMN     "paymentProve" TEXT,
ALTER COLUMN "courier" DROP NOT NULL;
