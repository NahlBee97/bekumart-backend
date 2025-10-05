-- CreateTable
CREATE TABLE "public"."ProductPhotos" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductPhotos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ProductPhotos" ADD CONSTRAINT "ProductPhotos_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
